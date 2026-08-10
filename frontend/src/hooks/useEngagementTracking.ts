import { useEffect, useRef } from 'react';
import { trackPageEngagement } from '../services/analytics';

/**
 * Hook to track user engagement on a page
 * Automatically tracks scroll depth and time on page
 *
 * @param pageId - Unique identifier for the page (e.g., 'insights_hub', 'country_service_india_eor')
 * @param enabled - Whether tracking is enabled (default: true)
 *
 * @example
 * // In a page component:
 * useEngagementTracking('insights_hub');
 *
 * // Conditionally enable:
 * useEngagementTracking('country_service', isDataLoaded);
 */
export const useEngagementTracking = (pageId: string, enabled: boolean = true): void => {
    const cleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!enabled) return;

        // Start tracking and store cleanup function
        cleanupRef.current = trackPageEngagement(pageId);

        // Cleanup on unmount or when pageId changes
        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
            }
        };
    }, [pageId, enabled]);
};

export default useEngagementTracking;
