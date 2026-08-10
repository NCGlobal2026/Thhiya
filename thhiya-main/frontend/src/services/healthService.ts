/**
 * Health Service
 * Handles health checks and backend wake-up calls for cold start scenarios
 * (e.g., Render, Railway free tier, Heroku free tier)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const isProduction = import.meta.env.PROD;

// Backend readiness state
let backendReady = false;
let backendWakeupPromise: Promise<boolean> | null = null;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

interface HealthResponse {
    status: string;
    service?: string;
    version?: string;
    timestamp?: string;
    uptime?: number;
    environment?: string;
}

/**
 * Check if we should skip health check (recently checked)
 */
const shouldSkipHealthCheck = (): boolean => {
    return backendReady && (Date.now() - lastHealthCheck) < HEALTH_CHECK_INTERVAL;
};

/**
 * Wake up the backend server with retry logic
 * Returns a cached promise if a wakeup is already in progress
 */
export const wakeUpBackend = async (retries = 3): Promise<boolean> => {
    // Return cached result if backend is ready and recently checked
    if (shouldSkipHealthCheck()) {
        return true;
    }

    // Return existing promise if wakeup is in progress
    if (backendWakeupPromise) {
        return backendWakeupPromise;
    }

    backendWakeupPromise = (async () => {
        const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
        
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout per attempt

                const response = await fetch(`${baseUrl}/health`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const data: HealthResponse = await response.json();
                    backendReady = true;
                    lastHealthCheck = Date.now();
                    
                    if (!isProduction) {
                        console.log(`✅ Backend ready: ${data.service} v${data.version} (attempt ${attempt})`);
                    }
                    return true;
                }

                // Non-OK response - backend might be starting up
                if (!isProduction) {
                    console.warn(`⚠️ Backend returned ${response.status} (attempt ${attempt}/${retries})`);
                }
            } catch (error) {
                if (!isProduction) {
                    console.info(`🔄 Backend wakeup attempt ${attempt}/${retries} failed`);
                }
            }

            // Wait before retry (exponential backoff)
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, Math.min(2000 * attempt, 10000)));
            }
        }

        // All retries failed
        backendReady = false;
        return false;
    })();

    try {
        return await backendWakeupPromise;
    } finally {
        backendWakeupPromise = null;
    }
};

/**
 * Check if the backend is healthy (quick check, no retries)
 */
export const checkHealth = async (): Promise<HealthResponse | null> => {
    try {
        const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${baseUrl}/health`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            backendReady = true;
            lastHealthCheck = Date.now();
            return await response.json();
        }

        return null;
    } catch {
        return null;
    }
};

/**
 * Get current backend readiness state
 */
export const isBackendReady = (): boolean => backendReady;

/**
 * Wait for backend to be ready (with timeout)
 * Use this before making API calls that need the backend
 */
export const waitForBackend = async (timeoutMs = 60000): Promise<boolean> => {
    if (shouldSkipHealthCheck()) {
        return true;
    }

    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
        const ready = await wakeUpBackend(1);
        if (ready) return true;
        
        // Brief pause before checking again
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return false;
};

/**
 * Initialize the app - called once on startup
 * Makes a non-blocking wake-up call to the backend
 */
export const initializeApp = (): void => {
    // Fire and forget - don't block the app startup
    wakeUpBackend().catch(() => {
        // Silently handle errors - the app should still work
    });
};

export default {
    wakeUpBackend,
    checkHealth,
    isBackendReady,
    waitForBackend,
    initializeApp,
};
