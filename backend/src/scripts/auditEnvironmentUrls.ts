type AuditResult = {
    label: string;
    baseUrl: string;
    ok: boolean;
    purpleListings?: {
        count?: number;
        total?: number;
        page?: number;
        limit?: number;
    };
    intentRefresh?: {
        totalProviders?: number;
        providersWithIntent?: number;
        providersMissingIntent?: number;
        latestJobStatus?: string | null;
        nextEligibleRunAt?: string | null;
    };
    errors: string[];
};

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

const fetchJson = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }
    return response.json();
};

async function auditEnvironment(label: string, baseUrl: string): Promise<AuditResult> {
    const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
    const result: AuditResult = {
        label,
        baseUrl: normalizedBaseUrl,
        ok: true,
        errors: [],
    };

    try {
        const purple = await fetchJson(`${normalizedBaseUrl}/api/listings/purple?page=1&limit=24`);
        result.purpleListings = {
            count: purple?.count,
            total: purple?.pagination?.total,
            page: purple?.pagination?.page,
            limit: purple?.pagination?.limit,
        };
    } catch (error: any) {
        result.ok = false;
        result.errors.push(`purple listings audit failed: ${error.message}`);
    }

    try {
        const intent = await fetchJson(`${normalizedBaseUrl}/api/providers/intent-refresh/status`);
        result.intentRefresh = {
            totalProviders: intent?.data?.totalProviders,
            providersWithIntent: intent?.data?.providersWithIntent,
            providersMissingIntent: intent?.data?.providersMissingIntent,
            latestJobStatus: intent?.data?.latestJob?.status ?? null,
            nextEligibleRunAt: intent?.data?.nextEligibleRunAt ?? null,
        };
    } catch (error: any) {
        result.ok = false;
        result.errors.push(`intent refresh audit failed: ${error.message}`);
    }

    return result;
}

async function main() {
    const productionUrl = process.argv[2] || process.env.AUDIT_PRODUCTION_URL;
    const developmentUrl = process.argv[3] || process.env.AUDIT_DEVELOPMENT_URL;

    if (!productionUrl || !developmentUrl) {
        console.error('Usage: bun src/scripts/auditEnvironmentUrls.ts <productionBaseUrl> <developmentBaseUrl>');
        console.error('Or set AUDIT_PRODUCTION_URL and AUDIT_DEVELOPMENT_URL in the environment.');
        process.exit(1);
    }

    const [production, development] = await Promise.all([
        auditEnvironment('production', productionUrl),
        auditEnvironment('development', developmentUrl),
    ]);

    console.log(JSON.stringify({ production, development }, null, 2));
}

main().catch((error) => {
    console.error('Environment audit failed:', error);
    process.exit(1);
});
