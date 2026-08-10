import cron from 'node-cron';
import Provider from '../models/Provider.ts';
import IntentRefreshJob from '../models/IntentRefreshJob.ts';
import providerService from '../services/providerService.ts';
import { logger } from '../utils/logger.ts';

const BIWEEKLY_REFRESH_DAYS = Number(process.env.PROVIDER_INTENT_REFRESH_DAYS ?? 14);
const CHECK_SCHEDULE = process.env.PROVIDER_INTENT_CHECK_CRON ?? '0 2 * * *';
const PROVIDER_REFRESH_DELAY_MS = Number(process.env.PROVIDER_INTENT_REFRESH_DELAY_MS ?? 15000);
const STARTUP_GRACE_MS = Number(process.env.PROVIDER_INTENT_STARTUP_GRACE_MS ?? 30000);
const PROVIDER_REFRESH_MAX_UPDATES_PER_RUN = Number(process.env.PROVIDER_INTENT_MAX_UPDATES_PER_RUN ?? 1);
const PROVIDER_REFRESH_ENABLED = process.env.PROVIDER_INTENT_REFRESH_ENABLED !== 'false';
const PROVIDER_REFRESH_STARTUP_ENABLED = process.env.PROVIDER_INTENT_STARTUP_ENABLED !== 'false';
const PROVIDER_REFRESH_ALLOWED_ENVS = (process.env.PROVIDER_INTENT_ALLOWED_ENVS ?? 'staging,development')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
const CURRENT_ENV = process.env.RENDER_ENV ?? process.env.NODE_ENV ?? 'development';
const BACKLOG_CHECK_INTERVAL_MS = Number(process.env.PROVIDER_INTENT_BACKLOG_CHECK_INTERVAL_MS ?? 10 * 60 * 1000);
const GEMINI_MIN_RETRY_BUFFER_MS = Number(process.env.PROVIDER_INTENT_RETRY_BUFFER_MS ?? 10 * 60 * 1000);
const QUOTA_FAILURE_BACKOFF_MS = Number(process.env.PROVIDER_INTENT_QUOTA_BACKOFF_MS ?? 15 * 60 * 1000);
const ACTIVE_PROVIDER_FILTER = {
    $or: [
        { isActive: true },
        { isActive: { $exists: false } },
    ],
};

let isRefreshRunning = false;
let backlogIntervalHandle: ReturnType<typeof setInterval> | null = null;

const buildMissingIntentQuery = () => ({
    ...ACTIVE_PROVIDER_FILTER,
    $or: [
        { intentScore: { $exists: false } },
        { scoringFactors: { $exists: false } },
        { sentimentAnalysis: { $exists: false } },
        { 'sentimentAnalysis.lastUpdated': { $exists: false } },
        { 'sentimentAnalysis.positiveReviews.4': { $exists: false } },
        { 'sentimentAnalysis.negativeReviews.4': { $exists: false } },
        { intentAnalysisStatus: { $in: ['pending', 'core_complete', 'failed', 'quota_limited', 'quota_exceeded'] } },
    ],
});

const buildStaleProviderQuery = (staleCutoff: Date) => ({
    ...ACTIVE_PROVIDER_FILTER,
    $or: [
        { intentScore: { $exists: false } },
        { scoringFactors: { $exists: false } },
        { sentimentAnalysis: { $exists: false } },
        { 'sentimentAnalysis.lastUpdated': { $exists: false } },
        { 'sentimentAnalysis.positiveReviews.4': { $exists: false } },
        { 'sentimentAnalysis.negativeReviews.4': { $exists: false } },
        { intentAnalysisStatus: { $in: ['pending', 'core_complete', 'failed', 'quota_limited', 'quota_exceeded'] } },
        { 'sentimentAnalysis.lastUpdated': { $lt: staleCutoff } },
    ],
});

function getStaleCutoff(referenceDate = new Date()): Date {
    return new Date(referenceDate.getTime() - BIWEEKLY_REFRESH_DAYS * 24 * 60 * 60 * 1000);
}

async function getLastCompletedJob() {
    return IntentRefreshJob.findOne({
        status: { $in: ['completed', 'completed_with_errors'] },
    }).sort({ startedAt: -1 });
}

function getRetryDelayMs(retryAfterMs?: number) {
    return Math.max(retryAfterMs ?? 0, BACKLOG_CHECK_INTERVAL_MS, GEMINI_MIN_RETRY_BUFFER_MS, QUOTA_FAILURE_BACKOFF_MS);
}

function isEnvironmentAllowed(): boolean {
    return PROVIDER_REFRESH_ALLOWED_ENVS.includes(CURRENT_ENV);
}

async function shouldRunNow(trigger: 'startup' | 'cron' | 'manual' | 'backlog', now = new Date()) {
    if (!PROVIDER_REFRESH_ENABLED && trigger !== 'manual') {
        return {
            shouldRun: false,
            reason: 'Provider intent refresh is disabled by environment variable.',
        };
    }

    if (!isEnvironmentAllowed() && trigger !== 'manual') {
        return {
            shouldRun: false,
            reason: `Environment "${CURRENT_ENV}" is not enabled for provider intent refresh.`,
        };
    }

    const missingIntentCount = await Provider.countDocuments(buildMissingIntentQuery());
    const lastJob = await getLastCompletedJob();

    if (lastJob && trigger !== 'manual' && lastJob.nextEligibleRunAt && lastJob.nextEligibleRunAt > now) {
        return {
            shouldRun: false,
            lastJob,
            nextEligibleRunAt: lastJob.nextEligibleRunAt,
            missingIntentCount,
            reason: `Next eligible run is ${lastJob.nextEligibleRunAt.toISOString()}.`,
        };
    }

    if (missingIntentCount > 0) {
        return {
            shouldRun: true,
            lastJob,
            missingIntentCount,
            bypassedEligibilityWindow: trigger !== 'manual',
        };
    }

    if (!lastJob) {
        return {
            shouldRun: true,
            lastJob: null,
            missingIntentCount,
        };
    }

    const nextEligibleRunAt =
        lastJob.nextEligibleRunAt ??
        new Date(lastJob.startedAt.getTime() + BIWEEKLY_REFRESH_DAYS * 24 * 60 * 60 * 1000);

    if (trigger !== 'manual' && trigger !== 'backlog' && nextEligibleRunAt > now) {
        return {
            shouldRun: false,
            lastJob,
            nextEligibleRunAt,
            missingIntentCount,
            reason: `Next eligible run is ${nextEligibleRunAt.toISOString()}.`,
        };
    }

    return {
        shouldRun: true,
        lastJob,
        nextEligibleRunAt,
        missingIntentCount,
    };
}

function getProviderPriority(provider: any, staleCutoff: Date) {
    const hasCore =
        typeof provider.intentScore === 'number' &&
        typeof provider.scoringFactors?.marketMomentum === 'string' &&
        typeof provider.scoringFactors?.userSentiment === 'string' &&
        typeof provider.scoringFactors?.featureInnovation === 'string' &&
        typeof provider.scoringFactors?.transparency === 'string' &&
        !!provider.sentimentAnalysis?.lastUpdated;

    const positiveCount = provider.sentimentAnalysis?.positiveReviews?.filter(Boolean).length ?? 0;
    const negativeCount = provider.sentimentAnalysis?.negativeReviews?.filter(Boolean).length ?? 0;
    const needsEnrichment = hasCore && (positiveCount < 5 || negativeCount < 5);
    const isStale = provider.sentimentAnalysis?.lastUpdated
        ? new Date(provider.sentimentAnalysis.lastUpdated) < staleCutoff
        : true;

    if (!hasCore) {
        return 0;
    }

    if (needsEnrichment) {
        return 1;
    }

    return isStale ? 2 : 3;
}

async function runBiweeklyIntentRefresh(trigger: 'startup' | 'cron' | 'manual' | 'backlog' = 'cron') {
    if (isRefreshRunning) {
        logger.warn(`Biweekly provider intent refresh is already running. Skipping ${trigger} trigger.`);
        return;
    }

    isRefreshRunning = true;
    const startedAt = new Date();

    try {
        const runDecision = await shouldRunNow(trigger, startedAt);

        if (!runDecision.shouldRun) {
            logger.info(
                `Skipping biweekly provider intent refresh on ${trigger}. ${runDecision.reason ?? ''}`.trim(),
            );
            return;
        }

        const staleCutoff = getStaleCutoff(startedAt);

        logger.info('Checking for provider intent scores older than refresh window...', {
            trigger,
            environment: CURRENT_ENV,
            staleCutoff: staleCutoff.toISOString(),
            refreshWindowDays: BIWEEKLY_REFRESH_DAYS,
            maxUpdatesPerRun: PROVIDER_REFRESH_MAX_UPDATES_PER_RUN,
            missingIntentCount: runDecision.missingIntentCount ?? 0,
        });

        const staleProviderQuery = buildStaleProviderQuery(staleCutoff);
        const checkedProviderCount = await Provider.countDocuments(ACTIVE_PROVIDER_FILTER);
        const staleProviderCount = await Provider.countDocuments(staleProviderQuery);

        const providerCandidates = await Provider.find(staleProviderQuery)
            .select({
                name: 1,
                intentScore: 1,
                scoringFactors: 1,
                sentimentAnalysis: 1,
                intentAnalysisStatus: 1,
                intentAnalysisMeta: 1,
                updatedAt: 1,
            })
            .sort({ 'intentAnalysisMeta.nextRetryAt': 1, 'sentimentAnalysis.lastUpdated': 1, updatedAt: 1, name: 1 })
            .limit(Math.max(PROVIDER_REFRESH_MAX_UPDATES_PER_RUN * 5, PROVIDER_REFRESH_MAX_UPDATES_PER_RUN));

        const providersToProcess = providerCandidates
            .filter((provider: any) => {
                const nextRetryAt = provider.intentAnalysisMeta?.nextRetryAt
                    ? new Date(provider.intentAnalysisMeta.nextRetryAt)
                    : null;

                return !nextRetryAt || nextRetryAt <= startedAt;
            })
            .sort((left: any, right: any) => {
                const leftPriority = getProviderPriority(left, staleCutoff);
                const rightPriority = getProviderPriority(right, staleCutoff);

                if (leftPriority !== rightPriority) {
                    return leftPriority - rightPriority;
                }

                const leftRetry = left.intentAnalysisMeta?.nextRetryAt
                    ? new Date(left.intentAnalysisMeta.nextRetryAt).getTime()
                    : 0;
                const rightRetry = right.intentAnalysisMeta?.nextRetryAt
                    ? new Date(right.intentAnalysisMeta.nextRetryAt).getTime()
                    : 0;

                return leftRetry - rightRetry;
            })
            .slice(0, Math.max(0, PROVIDER_REFRESH_MAX_UPDATES_PER_RUN));

        const job = await IntentRefreshJob.create({
            jobKey: `${trigger}-${startedAt.toISOString()}`,
            trigger,
            status: 'running',
            refreshWindowDays: BIWEEKLY_REFRESH_DAYS,
            staleCutoff,
            startedAt,
            checkedProviderCount,
            staleProviderCount,
            updatedCount: 0,
            skippedCount: 0,
            failedCount: 0,
            items: [],
            errorMessage:
                staleProviderCount > providersToProcess.length
                    ? `Run capped at ${providersToProcess.length} provider(s) out of ${staleProviderCount} stale provider(s).`
                    : undefined,
            nextEligibleRunAt:
                staleProviderCount > providersToProcess.length || (runDecision.missingIntentCount ?? 0) > providersToProcess.length
                    ? new Date(startedAt.getTime() + BACKLOG_CHECK_INTERVAL_MS)
                    : new Date(startedAt.getTime() + BIWEEKLY_REFRESH_DAYS * 24 * 60 * 60 * 1000),
        });

        logger.info(
            `Biweekly provider intent refresh found ${staleProviderCount} stale provider(s); processing ${providersToProcess.length} in this run.`,
        );

        for (let index = 0; index < providersToProcess.length; index += 1) {
            const provider = providersToProcess[index];
            const itemStartedAt = new Date();

            logger.info(`[${index + 1}/${providersToProcess.length}] Refreshing provider intent for ${provider.name}...`);

            const result = await providerService.refreshCompanyAnalysis(
                provider.id,
                BIWEEKLY_REFRESH_DAYS * 24,
            );

            job.items.push({
                providerId: provider._id,
                providerName: provider.name,
                status: result.status === 'quota_exceeded' ? 'failed' : result.status,
                message: result.message,
                previousLastUpdated: result.previousLastUpdated,
                newLastUpdated: result.newLastUpdated,
                startedAt: itemStartedAt,
                completedAt: new Date(),
            });

            if (result.status === 'updated') {
                job.updatedCount += 1;
            } else if (result.status === 'skipped') {
                job.skippedCount += 1;
            } else {
                job.failedCount += 1;
            }

            if (result.status === 'quota_exceeded') {
                const retryDelayMs = getRetryDelayMs(result.retryAfterMs);
                job.errorMessage = `Gemini quota exceeded for ${provider.name}. Provider deferred for retry in ${retryDelayMs}ms.`;
                job.nextEligibleRunAt = new Date(Date.now() + retryDelayMs);
                logger.warn(job.errorMessage, {
                    providerId: provider.id,
                    retryAfterMs: result.retryAfterMs ?? 0,
                    nextEligibleRunAt: job.nextEligibleRunAt.toISOString(),
                });
                await job.save();
                continue;
            }

            if (result.status === 'failed') {
                logger.warn(`Refresh did not complete for ${provider.name}. It will be retried on the next run.`);
            }

            await job.save();

            if (index < providersToProcess.length - 1 && PROVIDER_REFRESH_DELAY_MS > 0) {
                await new Promise((resolve) => setTimeout(resolve, PROVIDER_REFRESH_DELAY_MS));
            }
        }

        job.completedAt = new Date();
        job.status = job.failedCount > 0 ? 'completed_with_errors' : 'completed';
        await job.save();

        logger.info('Biweekly provider intent refresh completed.', {
            trigger,
            environment: CURRENT_ENV,
            updatedCount: job.updatedCount,
            skippedCount: job.skippedCount,
            failedCount: job.failedCount,
            nextEligibleRunAt: job.nextEligibleRunAt?.toISOString(),
        });
    } catch (error) {
        logger.error('Error in biweekly provider intent refresh job:', error);

        try {
            await IntentRefreshJob.create({
                jobKey: `failed-${trigger}-${startedAt.toISOString()}`,
                trigger,
                status: 'failed',
                refreshWindowDays: BIWEEKLY_REFRESH_DAYS,
                staleCutoff: getStaleCutoff(startedAt),
                startedAt,
                completedAt: new Date(),
                checkedProviderCount: 0,
                staleProviderCount: 0,
                updatedCount: 0,
                skippedCount: 0,
                failedCount: 0,
                items: [],
                errorMessage: error instanceof Error ? error.message : String(error),
                nextEligibleRunAt: new Date(startedAt.getTime() + getRetryDelayMs()),
            });
        } catch (trackingError) {
            logger.error('Failed to persist biweekly provider intent refresh job failure record.', trackingError);
        }
    } finally {
        isRefreshRunning = false;
    }
}

export const startProviderIntentRefreshCron = () => {
    cron.schedule(CHECK_SCHEDULE, async () => {
        await runBiweeklyIntentRefresh('cron');
    });

    logger.info(
        `Provider intent refresh cron scheduled (${CHECK_SCHEDULE}) with ${BIWEEKLY_REFRESH_DAYS}-day staleness window for env "${CURRENT_ENV}".`,
    );

    if (backlogIntervalHandle) {
        clearInterval(backlogIntervalHandle);
    }

    backlogIntervalHandle = setInterval(() => {
        void runBiweeklyIntentRefresh('backlog');
    }, BACKLOG_CHECK_INTERVAL_MS);

    logger.info(
        `Provider intent backlog checker scheduled every ${BACKLOG_CHECK_INTERVAL_MS}ms for env "${CURRENT_ENV}".`,
    );

    if (!PROVIDER_REFRESH_STARTUP_ENABLED) {
        logger.info('Startup provider intent refresh is disabled.');
        return;
    }

    setTimeout(() => {
        void runBiweeklyIntentRefresh('startup');
    }, STARTUP_GRACE_MS);
};

export const triggerProviderIntentRefresh = async () => {
    await runBiweeklyIntentRefresh('manual');
};
