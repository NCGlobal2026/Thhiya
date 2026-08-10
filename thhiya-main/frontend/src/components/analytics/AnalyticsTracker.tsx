import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, initializeGA } from '../../services/analytics';
import { hasAnalyticsConsent } from '../../hooks/useCookieConsent';

/**
 * Analytics Tracker Component
 * Tracks page views on route changes for SPA navigation
 * Only tracks if user has given analytics consent
 */
export const AnalyticsTracker: React.FC = () => {
    const location = useLocation();
    const prevPathRef = useRef<string | null>(null);

    useEffect(() => {
        // Attempt to initialize GA if consent was given
        if (hasAnalyticsConsent()) {
            initializeGA();
        }
    }, []);

    useEffect(() => {
        const currentPath = location.pathname + location.search;

        // Only track if path actually changed (avoid initial double-fire)
        if (prevPathRef.current !== currentPath) {
            trackPageView(currentPath);
            prevPathRef.current = currentPath;
        }
    }, [location]);

    return null;
};
