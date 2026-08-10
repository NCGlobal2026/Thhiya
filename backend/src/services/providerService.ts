import Provider, { IProvider } from '../models/Provider.ts';
import {
  analyzeCompanyCore,
  analyzeCompanyEnrichment,
  GeminiQuotaExceededError,
} from '../services/geminiService.ts';
import { logger } from '../utils/logger.ts';

type RefreshAnalysisPhase = 'core' | 'enrichment' | 'complete';

const CORE_REVIEW_TARGET = 3;
const FULL_REVIEW_TARGET = 5;
const FAILURE_RETRY_DELAY_MS = 15 * 60 * 1000;
const MIN_QUOTA_RETRY_DELAY_MS = 60 * 1000;

export interface RefreshCompanyAnalysisResult {
  success: boolean;
  status: 'updated' | 'skipped' | 'failed' | 'quota_exceeded';
  phase?: RefreshAnalysisPhase;
  providerName?: string;
  providerId: string;
  message: string;
  previousLastUpdated?: Date;
  newLastUpdated?: Date;
  intentScore?: number;
  retryAfterMs?: number;
}

const getProviderId = (provider: IProvider): string => provider._id.toString();

const hasCoreScoringFactors = (provider: IProvider): boolean => {
  const factors = provider.scoringFactors;
  return Boolean(
    factors?.marketMomentum &&
    factors?.userSentiment &&
    factors?.featureInnovation &&
    factors?.transparency,
  );
};

const getReviewCount = (reviews?: string[]): number => (
  Array.isArray(reviews) ? reviews.filter(Boolean).length : 0
);

const mergeUniqueReviews = (existing: string[] = [], incoming: string[] = [], limit: number): string[] => {
  const merged: string[] = [];

  for (const review of [...existing, ...incoming]) {
    const normalized = typeof review === 'string' ? review.replace(/\s+/g, ' ').trim() : '';
    if (!normalized) {
      continue;
    }

    if (!merged.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
      merged.push(normalized);
    }

    if (merged.length >= limit) {
      break;
    }
  }

  return merged;
};

const hasCoreAnalysis = (provider: IProvider): boolean => (
  typeof provider.intentScore === 'number' &&
  hasCoreScoringFactors(provider) &&
  getReviewCount(provider.sentimentAnalysis?.positiveReviews) >= CORE_REVIEW_TARGET &&
  getReviewCount(provider.sentimentAnalysis?.negativeReviews) >= CORE_REVIEW_TARGET
);

const hasFullEnrichment = (provider: IProvider): boolean => (
  hasCoreAnalysis(provider) &&
  getReviewCount(provider.sentimentAnalysis?.positiveReviews) >= FULL_REVIEW_TARGET &&
  getReviewCount(provider.sentimentAnalysis?.negativeReviews) >= FULL_REVIEW_TARGET
);

const getReferenceLastUpdated = (provider: IProvider): Date | undefined => {
  if (provider.sentimentAnalysis?.lastUpdated) {
    return new Date(provider.sentimentAnalysis.lastUpdated);
  }

  if (provider.intentAnalysisMeta?.lastEnrichedUpdated) {
    return new Date(provider.intentAnalysisMeta.lastEnrichedUpdated);
  }

  if (provider.intentAnalysisMeta?.lastCoreUpdated) {
    return new Date(provider.intentAnalysisMeta.lastCoreUpdated);
  }

  return undefined;
};

const isStale = (lastUpdated: Date | undefined, freshnessHours: number): boolean => {
  if (!lastUpdated) {
    return true;
  }

  const now = Date.now();
  const diffHours = (now - lastUpdated.getTime()) / (1000 * 60 * 60);
  return diffHours >= freshnessHours;
};

const buildAnalysisLabel = (provider: IProvider): string => {
  const details = provider.details as Record<string, unknown> | undefined;
  const analysisLabelParts = [
    provider.name,
    provider.service ? `service: ${provider.service}` : null,
    provider.country ? `country: ${provider.country}` : null,
    typeof details?.website === 'string' ? `website: ${details.website}` : null,
  ].filter(Boolean);

  return analysisLabelParts.join(' | ');
};

const applyCoreAnalysisToProvider = (
  provider: IProvider,
  analysis: NonNullable<Awaited<ReturnType<typeof analyzeCompanyCore>>>,
): void => {
  const now = new Date();
  const positiveReviews = mergeUniqueReviews([], analysis.positiveReviews, CORE_REVIEW_TARGET);
  const negativeReviews = mergeUniqueReviews([], analysis.negativeReviews, CORE_REVIEW_TARGET);

  provider.intentScore = analysis.intentScore;
  provider.scoringFactors = analysis.scoringFactors;
  provider.sentimentAnalysis = {
    positiveReviews,
    negativeReviews,
    lastUpdated: now,
  };

  provider.intentAnalysisMeta = {
    ...(provider.intentAnalysisMeta ?? {}),
    lastAttemptedAt: now,
    lastFailureAt: undefined,
    lastFailureReason: undefined,
    nextRetryAt: undefined,
    failureCount: 0,
    positiveReviewCount: positiveReviews.length,
    negativeReviewCount: negativeReviews.length,
    enrichmentComplete: false,
    lastCoreUpdated: now,
  };

  provider.intentAnalysisStatus = hasCoreAnalysis(provider) ? 'core_complete' : 'pending';
};

const applyEnrichmentAnalysisToProvider = (
  provider: IProvider,
  analysis: NonNullable<Awaited<ReturnType<typeof analyzeCompanyEnrichment>>>,
): void => {
  const now = new Date();
  const previousPositive = provider.sentimentAnalysis?.positiveReviews ?? [];
  const previousNegative = provider.sentimentAnalysis?.negativeReviews ?? [];
  const positiveReviews = mergeUniqueReviews(previousPositive, analysis.positiveReviews, FULL_REVIEW_TARGET);
  const negativeReviews = mergeUniqueReviews(previousNegative, analysis.negativeReviews, FULL_REVIEW_TARGET);

  provider.sentimentAnalysis = {
    positiveReviews,
    negativeReviews,
    lastUpdated: now,
  };

  const positiveReviewCount = positiveReviews.length;
  const negativeReviewCount = negativeReviews.length;
  const enrichmentComplete = positiveReviewCount >= FULL_REVIEW_TARGET && negativeReviewCount >= FULL_REVIEW_TARGET;

  provider.intentAnalysisMeta = {
    ...(provider.intentAnalysisMeta ?? {}),
    lastAttemptedAt: now,
    lastFailureAt: undefined,
    lastFailureReason: undefined,
    nextRetryAt: undefined,
    failureCount: 0,
    positiveReviewCount,
    negativeReviewCount,
    enrichmentComplete,
    lastEnrichedUpdated: enrichmentComplete ? now : provider.intentAnalysisMeta?.lastEnrichedUpdated,
  };

  provider.intentAnalysisStatus = enrichmentComplete ? 'enriched' : 'core_complete';
};

export class ProviderService {
  async getAllProviders(): Promise<IProvider[]> {
    return await Provider.find({}).sort({ name: 1 });
  }

  async getProvidersByService(service: string): Promise<IProvider[]> {
    return await Provider.find({ service: { $regex: new RegExp(`^${service}$`, 'i') } }).sort({ name: 1 });
  }

  async getProvidersByCountry(country: string): Promise<IProvider[]> {
    return await Provider.find({ country: { $regex: new RegExp(`^${country}$`, 'i') } }).sort({ name: 1 });
  }

  async findMatches(service: string, country?: string): Promise<IProvider[]> {
    const query: Record<string, any> = { service: { $regex: new RegExp(`^${service}$`, 'i') } };
    if (country) query.country = { $regex: new RegExp(`^${country}$`, 'i') };
    return await Provider.find(query).sort({ matchingScore: -1, rating: -1 });
  }

  async getProviderBySlug(slug: string): Promise<IProvider | null> {
    return await Provider.findOne({ slug });
  }

  async refreshCompanyAnalysis(providerId: string, freshnessHours = 24): Promise<RefreshCompanyAnalysisResult> {
    let provider: IProvider | null = null;

    try {
      provider = await Provider.findById(providerId);

      if (!provider) {
        const message = `Provider not found for analysis refresh: ${providerId}`;
        logger.warn(message);
        return {
          success: false,
          status: 'failed',
          providerId,
          message,
        };
      }

      const stableProviderId = getProviderId(provider);
      const previousLastUpdated = getReferenceLastUpdated(provider);
      const coreExists = hasCoreAnalysis(provider);
      const enrichmentComplete = hasFullEnrichment(provider);
      const lastCoreUpdated = provider.intentAnalysisMeta?.lastCoreUpdated
        ? new Date(provider.intentAnalysisMeta.lastCoreUpdated)
        : previousLastUpdated;
      const needsCoreRefresh = !coreExists || isStale(lastCoreUpdated, freshnessHours);
      const needsEnrichment = coreExists && !enrichmentComplete;

      if (!needsCoreRefresh && !needsEnrichment) {
        const message = `Skipping analysis for ${provider.name} - core analysis is fresh and enrichment is complete`;
        logger.info(message);
        return {
          success: true,
          status: 'skipped',
          phase: 'complete',
          providerId: stableProviderId,
          providerName: provider.name,
          message,
          previousLastUpdated,
          newLastUpdated: previousLastUpdated,
          intentScore: provider.intentScore,
        };
      }

      const phase: RefreshAnalysisPhase = needsCoreRefresh ? 'core' : 'enrichment';
      const analysisLabel = buildAnalysisLabel(provider);

      provider.intentAnalysisMeta = {
        ...(provider.intentAnalysisMeta ?? {}),
        lastAttemptedAt: new Date(),
        positiveReviewCount: getReviewCount(provider.sentimentAnalysis?.positiveReviews),
        negativeReviewCount: getReviewCount(provider.sentimentAnalysis?.negativeReviews),
        enrichmentComplete,
      };
      provider.intentAnalysisStatus = phase === 'core' ? 'pending' : 'core_complete';
      await provider.save();

      logger.info(`Refreshing ${phase} analysis for ${provider.name}...`, {
        analysisLabel,
        phase,
      });

      if (phase === 'core') {
        const analysis = await analyzeCompanyCore(analysisLabel);

        if (analysis) {
          applyCoreAnalysisToProvider(provider, analysis);
          await provider.save();

          const newLastUpdated = getReferenceLastUpdated(provider);
          const message = `Saved core analysis for ${provider.name} (Score: ${analysis.intentScore})`;

          logger.info(message, {
            phase,
            positiveReviewCount: provider.intentAnalysisMeta?.positiveReviewCount,
            negativeReviewCount: provider.intentAnalysisMeta?.negativeReviewCount,
            intentAnalysisStatus: provider.intentAnalysisStatus,
          });

          return {
            success: true,
            status: 'updated',
            phase,
            providerId: stableProviderId,
            providerName: provider.name,
            message,
            previousLastUpdated,
            newLastUpdated,
            intentScore: analysis.intentScore,
          };
        }
      } else {
        const analysis = await analyzeCompanyEnrichment(
          analysisLabel,
          provider.sentimentAnalysis?.positiveReviews ?? [],
          provider.sentimentAnalysis?.negativeReviews ?? [],
        );

        if (analysis) {
          applyEnrichmentAnalysisToProvider(provider, analysis);
          await provider.save();

          const newLastUpdated = getReferenceLastUpdated(provider);
          const message = `Saved enrichment analysis for ${provider.name} (Score: ${provider.intentScore ?? 'n/a'})`;

          logger.info(message, {
            phase,
            positiveReviewCount: provider.intentAnalysisMeta?.positiveReviewCount,
            negativeReviewCount: provider.intentAnalysisMeta?.negativeReviewCount,
            intentAnalysisStatus: provider.intentAnalysisStatus,
          });

          return {
            success: true,
            status: 'updated',
            phase,
            providerId: stableProviderId,
            providerName: provider.name,
            message,
            previousLastUpdated,
            newLastUpdated,
            intentScore: provider.intentScore,
          };
        }
      }

      provider.intentAnalysisStatus = 'failed';
      provider.intentAnalysisMeta = {
        ...(provider.intentAnalysisMeta ?? {}),
        lastAttemptedAt: new Date(),
        lastFailureAt: new Date(),
        lastFailureReason: 'Gemini returned no analysis payload',
        nextRetryAt: new Date(Date.now() + FAILURE_RETRY_DELAY_MS),
        failureCount: (provider.intentAnalysisMeta?.failureCount ?? 0) + 1,
      };
      await provider.save();

      const message = `Failed to get ${phase} analysis from Gemini for ${provider.name}`;
      logger.warn(message);

      return {
        success: false,
        status: 'failed',
        phase,
        providerId: stableProviderId,
        providerName: provider.name,
        message,
        previousLastUpdated,
      };
    } catch (error: unknown) {
      if (error instanceof GeminiQuotaExceededError) {
        if (provider) {
          provider.intentAnalysisStatus = 'quota_exceeded';
          provider.intentAnalysisMeta = {
            ...(provider.intentAnalysisMeta ?? {}),
            lastAttemptedAt: new Date(),
            lastQuotaExceededAt: new Date(),
            lastFailureReason: error.message,
            nextRetryAt: new Date(Date.now() + Math.max(error.retryAfterMs ?? 0, MIN_QUOTA_RETRY_DELAY_MS)),
            failureCount: (provider.intentAnalysisMeta?.failureCount ?? 0) + 1,
          };
          await provider.save();
        }

        logger.warn(`Gemini quota exceeded while refreshing provider ${providerId}`, {
          retryAfterMs: error.retryAfterMs,
        });

        return {
          success: false,
          status: 'quota_exceeded',
          phase: provider && hasCoreAnalysis(provider) && !hasFullEnrichment(provider) ? 'enrichment' : 'core',
          providerId,
          providerName: provider?.name,
          message: error.message,
          retryAfterMs: error.retryAfterMs,
        };
      }

      if (provider) {
        provider.intentAnalysisStatus = 'failed';
        provider.intentAnalysisMeta = {
          ...(provider.intentAnalysisMeta ?? {}),
          lastAttemptedAt: new Date(),
          lastFailureAt: new Date(),
          lastFailureReason: error instanceof Error ? error.message : `Unknown error for provider ${providerId}`,
          nextRetryAt: new Date(Date.now() + FAILURE_RETRY_DELAY_MS),
          failureCount: (provider.intentAnalysisMeta?.failureCount ?? 0) + 1,
        };
        await provider.save();
      }

      logger.error(`Error refreshing analysis for provider ${providerId}:`, error);
      return {
        success: false,
        status: 'failed',
        phase: provider && hasCoreAnalysis(provider) && !hasFullEnrichment(provider) ? 'enrichment' : 'core',
        providerId,
        providerName: provider?.name,
        message: `Error refreshing analysis for provider ${providerId}`,
      };
    }
  }
}

export default new ProviderService();
