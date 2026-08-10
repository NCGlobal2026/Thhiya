import { useState, useEffect, useCallback } from 'react';

export interface CookiePreferences {
    essential: boolean; // Always true, cannot be disabled
    analytics: boolean;
    marketing: boolean;
}

const CONSENT_KEY = 'thhiya_cookie_consent';
const CONSENT_VERSION = '1.0';

interface StoredConsent {
    version: string;
    preferences: CookiePreferences;
    timestamp: number;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
    essential: true,
    analytics: false,
    marketing: false,
};

export const useCookieConsent = () => {
    const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load consent from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(CONSENT_KEY);
            if (stored) {
                const parsed: StoredConsent = JSON.parse(stored);
                // Only use stored preferences if version matches
                if (parsed.version === CONSENT_VERSION) {
                    setPreferences(parsed.preferences);
                }
            }
        } catch (e) {
            console.warn('[CookieConsent] Failed to parse stored consent:', e);
        }
        setIsLoaded(true);
    }, []);

    // Save preferences to localStorage
    const savePreferences = useCallback((newPreferences: CookiePreferences) => {
        const stored: StoredConsent = {
            version: CONSENT_VERSION,
            preferences: { ...newPreferences, essential: true }, // Essential always true
            timestamp: Date.now(),
        };
        try {
            localStorage.setItem(CONSENT_KEY, JSON.stringify(stored));
            setPreferences(stored.preferences);
        } catch (e) {
            console.error('[CookieConsent] Failed to save consent:', e);
        }
    }, []);

    // Accept all cookies
    const acceptAll = useCallback(() => {
        savePreferences({
            essential: true,
            analytics: true,
            marketing: true,
        });
    }, [savePreferences]);

    // Reject all optional cookies
    const rejectAll = useCallback(() => {
        savePreferences({
            essential: true,
            analytics: false,
            marketing: false,
        });
    }, [savePreferences]);

    // Check if a specific category is consented
    const hasConsent = useCallback(
        (category: keyof CookiePreferences): boolean => {
            if (!preferences) return category === 'essential';
            return preferences[category];
        },
        [preferences]
    );

    // Whether user has made any choice
    const isConsentGiven = preferences !== null;

    // Whether to show the banner
    const showBanner = isLoaded && !isConsentGiven;

    return {
        preferences: preferences || DEFAULT_PREFERENCES,
        isConsentGiven,
        isLoaded,
        showBanner,
        hasConsent,
        acceptAll,
        rejectAll,
        savePreferences,
    };
};

// Utility function for checking analytics consent outside of React
export const hasAnalyticsConsent = (): boolean => {
    try {
        const stored = localStorage.getItem(CONSENT_KEY);
        if (!stored) return false;
        const parsed: StoredConsent = JSON.parse(stored);
        return parsed.version === CONSENT_VERSION && parsed.preferences.analytics;
    } catch {
        return false;
    }
};
