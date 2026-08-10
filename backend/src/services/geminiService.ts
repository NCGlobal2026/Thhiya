import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.ts';

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const MODEL_FALLBACK_ORDER = [
    process.env.GEMINI_MODEL?.trim(),
    'gemini-2.5-flash-lite',
    'gemini-3.1-flash-lite-preview',
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
].filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index);

const DEFAULT_SCORING_FACTORS = {
    marketMomentum: 'Limited signal',
    userSentiment: 'Mixed feedback',
    featureInnovation: 'Standard offering',
    transparency: 'Pricing unclear',
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const RETRY_DELAYS = [15_000, 30_000, 60_000];
const QUOTA_MODEL_COOLDOWN_MS = Number(process.env.GEMINI_MODEL_QUOTA_COOLDOWN_MS ?? 15 * 60 * 1000);
const CORE_REVIEW_COUNT = 3;
const FULL_REVIEW_COUNT = 5;

export interface CompanyAnalysis {
    intentScore: number;
    scoringFactors: {
        marketMomentum: string;
        userSentiment: string;
        featureInnovation: string;
        transparency: string;
    };
    sentimentAnalysis: {
        positiveReviews: string[];
        negativeReviews: string[];
        lastUpdated: Date;
    };
}

export interface CoreCompanyAnalysis {
    intentScore: number;
    scoringFactors: CompanyAnalysis['scoringFactors'];
    positiveReviews: string[];
    negativeReviews: string[];
}

export interface EnrichmentCompanyAnalysis {
    positiveReviews: string[];
    negativeReviews: string[];
}

export class GeminiQuotaExceededError extends Error {
    retryAfterMs?: number;
    attemptedModels: string[];

    constructor(message: string, retryAfterMs?: number, attemptedModels: string[] = []) {
        super(message);
        this.name = 'GeminiQuotaExceededError';
        this.retryAfterMs = retryAfterMs;
        this.attemptedModels = attemptedModels;
    }
}

function parseRetryAfterMs(error: any): number | undefined {
    const message = String(error?.message || '');
    const match =
        message.match(/retry in\s+([0-9.]+)s/i) ||
        message.match(/"retryDelay":"([0-9.]+)s"/i);

    if (!match) {
        return undefined;
    }

    const seconds = Number(match[1]);
    if (!Number.isFinite(seconds) || seconds <= 0) {
        return undefined;
    }

    return Math.ceil(seconds * 1000);
}

function stripMarkdownJsonFences(text: string): string {
    return text.replace(/```json/gi, '').replace(/```/g, '').trim();
}

function normalizeShortText(value: unknown, fallback: string): string {
    if (typeof value !== 'string') {
        return fallback;
    }

    const normalized = value.replace(/\s+/g, ' ').trim();
    return normalized || fallback;
}

function normalizeReviewList(value: unknown, maxItems: number): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => (typeof item === 'string' ? item.replace(/\s+/g, ' ').trim() : ''))
        .filter(Boolean)
        .slice(0, maxItems);
}

function normalizeIntentScore(value: unknown): number {
    const score = Number(value);
    if (!Number.isFinite(score)) {
        return 5;
    }

    return Math.min(10, Math.max(0, Math.round(score * 10) / 10));
}

function tryParseJson(text: string): any {
    const cleaned = stripMarkdownJsonFences(text);

    try {
        return JSON.parse(cleaned);
    } catch {
        const objectMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!objectMatch) {
            throw new Error('Gemini response did not contain valid JSON.');
        }

        return JSON.parse(objectMatch[0]);
    }
}

function normalizeCoreAnalysis(data: any): CoreCompanyAnalysis {
    return {
        intentScore: normalizeIntentScore(data?.intentScore),
        scoringFactors: {
            marketMomentum: normalizeShortText(data?.scoringFactors?.marketMomentum, DEFAULT_SCORING_FACTORS.marketMomentum),
            userSentiment: normalizeShortText(data?.scoringFactors?.userSentiment, DEFAULT_SCORING_FACTORS.userSentiment),
            featureInnovation: normalizeShortText(data?.scoringFactors?.featureInnovation, DEFAULT_SCORING_FACTORS.featureInnovation),
            transparency: normalizeShortText(data?.scoringFactors?.transparency, DEFAULT_SCORING_FACTORS.transparency),
        },
        positiveReviews: normalizeReviewList(data?.positiveReviews, CORE_REVIEW_COUNT),
        negativeReviews: normalizeReviewList(data?.negativeReviews, CORE_REVIEW_COUNT),
    };
}

function normalizeEnrichmentAnalysis(data: any): EnrichmentCompanyAnalysis {
    return {
        positiveReviews: normalizeReviewList(data?.positiveReviews, 2),
        negativeReviews: normalizeReviewList(data?.negativeReviews, 2),
    };
}

function mergeUniqueReviews(existing: string[], incoming: string[], limit: number): string[] {
    const merged: string[] = [];

    for (const review of [...existing, ...incoming]) {
        const normalized = review.replace(/\s+/g, ' ').trim();
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
}

function buildCorePrompt(companyName: string): string {
    return `
Analyze the company "${companyName}" using broadly known public reputation, buyer demand signals, product positioning, and customer feedback.

Return valid JSON only with this exact shape:
{
  "intentScore": number,
  "scoringFactors": {
    "marketMomentum": string,
    "userSentiment": string,
    "featureInnovation": string,
    "transparency": string
  },
  "positiveReviews": string[],
  "negativeReviews": string[]
}

Rules:
- intentScore must be between 0 and 10.
- scoringFactors must each be a concise 2-4 word phrase.
- positiveReviews must contain exactly 3 concise one-sentence review summaries.
- negativeReviews must contain exactly 3 concise one-sentence review summaries.
- Do not include markdown.
- Do not include explanations outside JSON.
`.trim();
}

function buildEnrichmentPrompt(companyName: string, existingPositive: string[], existingNegative: string[]): string {
    return `
Analyze the company "${companyName}" using broadly known public reputation, buyer demand signals, product positioning, and customer feedback.

Existing positive review summaries:
${existingPositive.map((review, index) => `${index + 1}. ${review}`).join('\n') || 'None'}

Existing negative review summaries:
${existingNegative.map((review, index) => `${index + 1}. ${review}`).join('\n') || 'None'}

Return valid JSON only with this exact shape:
{
  "positiveReviews": string[],
  "negativeReviews": string[]
}

Rules:
- positiveReviews must contain exactly 2 NEW concise one-sentence review summaries that are materially different from the existing positives.
- negativeReviews must contain exactly 2 NEW concise one-sentence review summaries that are materially different from the existing negatives.
- Do not repeat existing summaries.
- Do not include markdown.
- Do not include explanations outside JSON.
`.trim();
}

const modelQuotaCooldowns = new Map<string, number>();

function getQuotaBlockedModels(now = Date.now()): Set<string> {
    const blocked = new Set<string>();

    for (const [modelName, blockedUntil] of modelQuotaCooldowns.entries()) {
        if (blockedUntil > now) {
            blocked.add(modelName);
            continue;
        }

        modelQuotaCooldowns.delete(modelName);
    }

    return blocked;
}

async function generateWithModelFallback<T>(
    prompt: string,
    parser: (data: any) => T,
    operationLabel: string,
): Promise<T> {
    if (!genAI) {
        throw new Error('Gemini API key is missing.');
    }

    let lastNonQuotaError: unknown = null;
    let longestRetryAfterMs = 0;
    const attemptedModels: string[] = [];
    const blockedModels = getQuotaBlockedModels();

    for (const modelName of MODEL_FALLBACK_ORDER) {
        if (blockedModels.has(modelName)) {
            logger.info(`Skipping Gemini model ${modelName} for ${operationLabel} because it is in quota cooldown.`);
            continue;
        }

        attemptedModels.push(modelName);
        const model = genAI.getGenerativeModel({ model: modelName });

        for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt += 1) {
            try {
                const result = await model.generateContent(prompt);
                const text = result.response.text();
                const data = tryParseJson(text);
                return parser(data);
            } catch (error: any) {
                const message = String(error?.message || '');
                const is503 = message.includes('503') || message.includes('Service Unavailable');
                const is429 = message.includes('429') || message.includes('Too Many Requests');
                const quotaExceeded =
                    message.includes('quota exceeded') ||
                    message.includes('Quota exceeded') ||
                    message.includes('free_tier_requests');

                if (is429 && quotaExceeded) {
                    const retryAfterMs = parseRetryAfterMs(error);
                    const cooldownMs = Math.max(retryAfterMs ?? 0, QUOTA_MODEL_COOLDOWN_MS);
                    longestRetryAfterMs = Math.max(longestRetryAfterMs, cooldownMs);
                    modelQuotaCooldowns.set(modelName, Date.now() + cooldownMs);

                    logger.warn(`Gemini model ${modelName} hit quota during ${operationLabel}; trying next fallback model.`, {
                        model: modelName,
                        retryAfterMs: retryAfterMs ?? 0,
                        cooldownMs,
                    });
                    break;
                }

                if (is503 && attempt < RETRY_DELAYS.length) {
                    const wait = RETRY_DELAYS[attempt];
                    logger.warn(
                        `[RETRY ${attempt + 1}/${RETRY_DELAYS.length}] Gemini 503 during ${operationLabel} on ${modelName}. Waiting ${wait / 1000}s...`,
                    );
                    await sleep(wait);
                    continue;
                }

                logger.warn(`Gemini model ${modelName} failed during ${operationLabel}.`, {
                    model: modelName,
                    attempt,
                    error: message,
                });
                lastNonQuotaError = error;
                break;
            }
        }
    }

    if (attemptedModels.length > 0 && longestRetryAfterMs > 0) {
        throw new GeminiQuotaExceededError(
            `Gemini quota exceeded while performing ${operationLabel}; all available fallback models are cooling down.`,
            longestRetryAfterMs,
            attemptedModels,
        );
    }

    throw lastNonQuotaError instanceof Error
        ? lastNonQuotaError
        : new Error(`All Gemini models failed during ${operationLabel}.`);
}

export async function analyzeCompanyCore(companyName: string): Promise<CoreCompanyAnalysis | null> {
    if (!genAI) {
        logger.warn('Gemini API key is missing. Skipping core company analysis.');
        return null;
    }

    try {
        return await generateWithModelFallback(
            buildCorePrompt(companyName),
            normalizeCoreAnalysis,
            `core analysis for "${companyName}"`,
        );
    } catch (error) {
        if (error instanceof GeminiQuotaExceededError) {
            throw error;
        }

        logger.error(`Error running core analysis for ${companyName} with Gemini:`, error);
        return null;
    }
}

export async function analyzeCompanyEnrichment(
    companyName: string,
    existingPositive: string[] = [],
    existingNegative: string[] = [],
): Promise<EnrichmentCompanyAnalysis | null> {
    if (!genAI) {
        logger.warn('Gemini API key is missing. Skipping company enrichment analysis.');
        return null;
    }

    try {
        return await generateWithModelFallback(
            buildEnrichmentPrompt(companyName, existingPositive, existingNegative),
            normalizeEnrichmentAnalysis,
            `enrichment analysis for "${companyName}"`,
        );
    } catch (error) {
        if (error instanceof GeminiQuotaExceededError) {
            throw error;
        }

        logger.error(`Error running enrichment analysis for ${companyName} with Gemini:`, error);
        return null;
    }
}

export const analyzeCompany = async (companyName: string): Promise<CompanyAnalysis | null> => {
    try {
        const coreAnalysis = await analyzeCompanyCore(companyName);
        if (!coreAnalysis) {
            return null;
        }

        let positiveReviews = coreAnalysis.positiveReviews;
        let negativeReviews = coreAnalysis.negativeReviews;

        const enrichmentAnalysis = await analyzeCompanyEnrichment(
            companyName,
            coreAnalysis.positiveReviews,
            coreAnalysis.negativeReviews,
        );

        if (enrichmentAnalysis) {
            positiveReviews = mergeUniqueReviews(coreAnalysis.positiveReviews, enrichmentAnalysis.positiveReviews, FULL_REVIEW_COUNT);
            negativeReviews = mergeUniqueReviews(coreAnalysis.negativeReviews, enrichmentAnalysis.negativeReviews, FULL_REVIEW_COUNT);
        }

        return {
            intentScore: coreAnalysis.intentScore,
            scoringFactors: coreAnalysis.scoringFactors,
            sentimentAnalysis: {
                positiveReviews,
                negativeReviews,
                lastUpdated: new Date(),
            },
        };
    } catch (error) {
        if (error instanceof GeminiQuotaExceededError) {
            throw error;
        }

        logger.error(`Error analyzing company ${companyName} with Gemini:`, error);
        return null;
    }
};
