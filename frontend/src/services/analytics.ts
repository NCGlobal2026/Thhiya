/**
 * Google Analytics 4 Service
 * Consent-aware analytics tracking for Thhiya
 * 
 * NOTE: GA4 only runs in production environment
 */

import { hasAnalyticsConsent } from '../hooks/useCookieConsent';

// GA4 Measurement ID
const GA_MEASUREMENT_ID = 'G-566H5MYEFH';

// Check if we're in production
const isProduction = import.meta.env.PROD;

// Extend window type for gtag
declare global {
    interface Window {
        dataLayer: unknown[];
        gtag: (...args: unknown[]) => void;
    }
}

let isInitialized = false;

/**
 * Initialize Google Analytics 4
 * Only loads if user has given analytics consent AND we're in production
 */
export const initializeGA = (): void => {
    if (isInitialized) return;

    // Skip in development
    if (!isProduction) {
        console.log('[Analytics] Skipping GA init - development mode');
        return;
    }

    if (!hasAnalyticsConsent()) {
        console.log('[Analytics] Skipping GA init - no consent');
        return;
    }

    try {
        // Create and inject gtag script
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        script.async = true;
        document.head.appendChild(script);

        // Initialize dataLayer and gtag function
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag() {
            window.dataLayer.push(arguments);
        };

        // Configure GA4
        window.gtag('js', new Date());
        window.gtag('config', GA_MEASUREMENT_ID, {
            send_page_view: false, // We'll track page views manually for SPA
        });

        isInitialized = true;
        console.log('[Analytics] GA4 initialized');
    } catch (error) {
        console.error('[Analytics] Failed to initialize GA4:', error);
    }
};

/**
 * Check if GA is ready to track
 */
const isGAReady = (): boolean => {
    return isInitialized && typeof window.gtag === 'function';
};

/**
 * Track a page view (for SPA navigation)
 */
export const trackPageView = (path: string, title?: string): void => {
    if (!isGAReady()) return;

    window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title || document.title,
        page_location: window.location.href,
    });
};

/**
 * Track a custom event
 */
export const trackEvent = (
    eventName: string,
    params?: Record<string, unknown>
): void => {
    if (!isGAReady()) return;

    window.gtag('event', eventName, params);
};

/**
 * GA4 Recommended Events
 * Pre-configured event tracking methods
 */
export const GA4Events = {
    /**
     * Track lead generation (BANT/MEDDIC/INTENT(BMI) form submission)
     */
    generateLead: (params: {
        leadSource: string;
        servicesRequested: string[];
        targetCountry: string;
        submissionId?: string;
    }): void => {
        trackEvent('generate_lead', {
            lead_source: params.leadSource,
            services_requested: params.servicesRequested.join(', '),
            target_country: params.targetCountry,
            submission_id: params.submissionId,
        });
    },

    /**
     * Track BANT/MEDDIC/INTENT(BMI) form started
     */
    bantFormStarted: (source: string): void => {
        trackEvent('bant_form_started', {
            source,
        });
    },

    /**
     * Track BANT/MEDDIC/INTENT(BMI) form section completed
     */
    bantFormSectionCompleted: (section: number, source: string): void => {
        trackEvent('bant_form_section_completed', {
            section: `section_${section}`,
            source,
        });
    },

    /**
     * Track contact form submission
     */
    contactFormSubmit: (params: {
        formType: string;
        subject?: string;
        source: string;
    }): void => {
        trackEvent('contact_form_submit', {
            form_type: params.formType,
            subject: params.subject,
            source: params.source,
        });
    },

    /**
     * Track content selection (CTA clicks, selections)
     */
    selectContent: (params: {
        contentType: string;
        contentId: string;
        itemId?: string;
    }): void => {
        trackEvent('select_content', {
            content_type: params.contentType,
            content_id: params.contentId,
            item_id: params.itemId,
        });
    },

    /**
     * Track item view (country/service page)
     */
    viewItem: (params: {
        itemId: string;
        itemName: string;
        itemCategory: string;
        itemCategory2?: string;
    }): void => {
        trackEvent('view_item', {
            items: [
                {
                    item_id: params.itemId,
                    item_name: params.itemName,
                    item_category: params.itemCategory,
                    item_category2: params.itemCategory2,
                },
            ],
        });
    },

    /**
     * Track item list view (country grid, service list)
     */
    viewItemList: (params: {
        itemListId: string;
        itemListName: string;
        items: Array<{
            itemId: string;
            itemName: string;
            index: number;
        }>;
    }): void => {
        trackEvent('view_item_list', {
            item_list_id: params.itemListId,
            item_list_name: params.itemListName,
            items: params.items.map((item) => ({
                item_id: item.itemId,
                item_name: item.itemName,
                index: item.index,
            })),
        });
    },

    /**
     * Track search queries
     */
    search: (params: { searchTerm: string; searchCategory?: string }): void => {
        trackEvent('search', {
            search_term: params.searchTerm,
            search_category: params.searchCategory,
        });
    },

    /**
     * Track outbound link clicks
     */
    outboundClick: (url: string, linkText?: string): void => {
        trackEvent('click', {
            link_url: url,
            link_text: linkText,
            outbound: true,
        });
    },
};

/**
 * Re-initialize GA after consent is given
 * Call this when user accepts analytics cookies
 */
export const reinitializeGA = (): void => {
    if (isInitialized) return;
    initializeGA();

    // Track current page if we just got consent
    if (isGAReady()) {
        trackPageView(window.location.pathname + window.location.search);
    }
};

// =============================================================================
// ENGAGEMENT TRACKING UTILITIES
// =============================================================================

/**
 * Track scroll depth on a page
 * Fires events at 25%, 50%, 75%, and 100% scroll milestones
 */
export const createScrollDepthTracker = (pageId: string) => {
    const milestones = [25, 50, 75, 100];
    const firedMilestones = new Set<number>();

    const handleScroll = () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) return;

        const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

        milestones.forEach((milestone) => {
            if (scrollPercent >= milestone && !firedMilestones.has(milestone)) {
                firedMilestones.add(milestone);
                trackEvent('scroll_depth', {
                    page_id: pageId,
                    percent_scrolled: milestone,
                    page_path: window.location.pathname,
                });
            }
        });
    };

    // Cleanup function
    const cleanup = () => {
        window.removeEventListener('scroll', handleScroll);
    };

    // Start tracking
    window.addEventListener('scroll', handleScroll, { passive: true });

    return cleanup;
};

/**
 * Track time spent on a page
 * Fires events at specified thresholds (default: 30s, 60s, 120s)
 */
export const createTimeOnPageTracker = (
    pageId: string,
    thresholds: number[] = [30, 60, 120]
) => {
    const firedThresholds = new Set<number>();
    const startTime = Date.now();
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const checkTime = () => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

        thresholds.forEach((threshold) => {
            if (elapsedSeconds >= threshold && !firedThresholds.has(threshold)) {
                firedThresholds.add(threshold);
                trackEvent('time_on_page', {
                    page_id: pageId,
                    seconds_elapsed: threshold,
                    page_path: window.location.pathname,
                });
            }
        });

        // Stop checking if all thresholds fired
        if (firedThresholds.size === thresholds.length && intervalId) {
            clearInterval(intervalId);
        }
    };

    // Check every 5 seconds
    intervalId = setInterval(checkTime, 5000);

    // Cleanup function
    const cleanup = () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    };

    return cleanup;
};

/**
 * React hook helper for engagement tracking
 * Returns a function to start tracking that returns a cleanup function
 */
export const trackPageEngagement = (pageId: string) => {
    const scrollCleanup = createScrollDepthTracker(pageId);
    const timeCleanup = createTimeOnPageTracker(pageId);

    return () => {
        scrollCleanup();
        timeCleanup();
    };
};
