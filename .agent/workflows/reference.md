---
description: Reference guide for adding Google Analytics GA4 to Thhiya pages
---

# Google Analytics 4 (GA4) Reference Guide for Thhiya

This reference document provides all the necessary information for implementing Google Analytics on new pages in the Thhiya website.

---

## Quick Start Checklist

For any new page you create, follow this checklist:

- [ ] **Page Views**: Automatic ✅ (handled by `AnalyticsTracker` component globally)
- [ ] **Engagement Tracking**: Add `useEngagementTracking` hook for scroll depth and time-on-page
- [ ] **Content Tracking**: Add `GA4Events.viewItem()` for content pages
- [ ] **CTA Tracking**: Add `GA4Events.selectContent()` for clickable elements
- [ ] **Form Tracking**: Use existing `BANTForm` or `ContactForm` components (already tracked)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     main.tsx                                │
│                 initializeGA() on app start                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      App.tsx                                │
│    ┌─────────────────────────────────────────────────┐      │
│    │ <AnalyticsTracker />                            │      │
│    │ - Auto tracks page_view on every route change   │      │
│    └─────────────────────────────────────────────────┘      │
│    ┌─────────────────────────────────────────────────┐      │
│    │ <Routes>                                        │      │
│    │   <Route path="/your-page" element={...} />    │      │
│    │   ...                                          │      │
│    └─────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuration

| Setting | Value |
|---------|-------|
| **GA4 Measurement ID** | `G-566H5MYEFH` |
| **Analytics Service** | `frontend/src/services/analytics.ts` |
| **Engagement Hook** | `frontend/src/hooks/useEngagementTracking.ts` |
| **Cookie Consent** | `frontend/src/hooks/useCookieConsent.ts` |

---

## What's Automatically Tracked

The following are tracked **automatically** without any code changes:

| Event | Description | Source |
|-------|-------------|--------|
| `page_view` | Every route navigation | `AnalyticsTracker` component |
| `engagement_time` | Time spent on site | GA4 automatic |
| `session_start` | New sessions | GA4 automatic |
| `first_visit` | First-time visitors | GA4 automatic |
| Device/Browser/Location | User environment | GA4 automatic |

---

## Adding Analytics to a New Page

### Step 1: Basic Page (Automatic Tracking Only)

If your page only needs page view tracking, **no code is required**. The `AnalyticsTracker` component handles this automatically.

```tsx
// Example: A simple static page
// frontend/src/pages/MyNewPage.tsx

import React from 'react';
import { Header, Footer } from '../components';

export const MyNewPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Your page content */}
      </main>
      <Footer />
    </div>
  );
};
```

### Step 2: Add Engagement Tracking (Recommended)

For content-heavy pages, add scroll depth and time-on-page tracking:

```tsx
// frontend/src/pages/MyContentPage.tsx

import React from 'react';
import { Header, Footer } from '../components';
import { useEngagementTracking } from '../hooks/useEngagementTracking';

export const MyContentPage: React.FC = () => {
  // Add engagement tracking with a unique page identifier
  useEngagementTracking('my_content_page');

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Your page content */}
      </main>
      <Footer />
    </div>
  );
};
```

**Parameters:**
- `pageId` (string): Unique identifier for the page (use snake_case)
- `enabled` (boolean, optional): Set to `false` to disable tracking conditionally

**Events Fired:**
- `scroll_depth` at 25%, 50%, 75%, 100%
- `time_on_page` at 30s, 60s, 120s

### Step 3: Track Content Views (For Item Pages)

For pages that display specific content items (countries, services, etc.):

```tsx
// frontend/src/pages/MyItemPage.tsx

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GA4Events } from '../services/analytics';
import { useEngagementTracking } from '../hooks/useEngagementTracking';

export const MyItemPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  
  // Track engagement
  useEngagementTracking(`item_page_${itemId}`);

  // Track item view on mount
  useEffect(() => {
    if (itemId) {
      GA4Events.viewItem({
        itemId: itemId,
        itemName: 'Item Display Name',
        itemCategory: 'category_name',
        itemCategory2: 'optional_subcategory',
      });
    }
  }, [itemId]);

  return (
    // ... your page content
  );
};
```

### Step 4: Track User Interactions (CTAs, Selections)

For buttons, links, and interactive elements:

```tsx
import { GA4Events } from '../services/analytics';

// In your component:
const handleButtonClick = () => {
  GA4Events.selectContent({
    contentType: 'cta_button',
    contentId: 'get_started',
    itemId: 'hero_section', // optional: where the button is located
  });
  
  // Continue with your action
  navigate('/get-matched');
};

// In JSX:
<button onClick={handleButtonClick}>
  Get Started
</button>
```

### Step 5: Track Lists (For Grid/List Views)

When displaying a list of items (e.g., country grid, service list):

```tsx
import { useEffect } from 'react';
import { GA4Events } from '../services/analytics';

// In your component:
useEffect(() => {
  if (items.length > 0) {
    GA4Events.viewItemList({
      itemListId: 'country_grid',
      itemListName: 'Available Countries',
      items: items.map((item, index) => ({
        itemId: item.id,
        itemName: item.name,
        index: index,
      })),
    });
  }
}, [items]);
```

---

## Available GA4 Event Methods

All methods are available in `GA4Events` object from `frontend/src/services/analytics.ts`:

### Lead Generation Events

```tsx
// When BANT/MEDDIC/INTENT(BMI) form is submitted
GA4Events.generateLead({
  leadSource: 'hero_section',
  servicesRequested: ['eor', 'payroll'],
  targetCountry: 'UAE',
  submissionId: 'unique-id', // optional
});

// When form is opened/started
GA4Events.bantFormStarted('landing_page');

// When form section is completed
GA4Events.bantFormSectionCompleted(1, 'bant_page'); // section number, source
```

### Contact Form Events

```tsx
GA4Events.contactFormSubmit({
  formType: 'general_inquiry',
  subject: 'Partnership', // optional
  source: 'contact_page',
});
```

### Content Interaction Events

```tsx
// General content selection (CTAs, buttons, tabs)
GA4Events.selectContent({
  contentType: 'service_select',
  contentId: 'eor',
  itemId: 'hero_dropdown', // optional
});

// View a specific item (country, service page)
GA4Events.viewItem({
  itemId: 'uae',
  itemName: 'United Arab Emirates',
  itemCategory: 'country',
  itemCategory2: 'middle_east', // optional
});

// View a list of items
GA4Events.viewItemList({
  itemListId: 'country_grid',
  itemListName: 'All Countries',
  items: [
    { itemId: 'uae', itemName: 'UAE', index: 0 },
    { itemId: 'ind', itemName: 'India', index: 1 },
  ],
});
```

### Search Events

```tsx
GA4Events.search({
  searchTerm: 'payroll services',
  searchCategory: 'services', // optional
});
```

### Outbound Link Tracking

```tsx
GA4Events.outboundClick(
  'https://external-site.com',
  'Learn More' // link text, optional
);

// Or use the OutboundLink component:
import { OutboundLink } from '../components/analytics/OutboundLink';

<OutboundLink href="https://example.com">
  External Link
</OutboundLink>
```

---

## Custom Event Tracking

For events not covered by `GA4Events`, use the generic `trackEvent`:

```tsx
import { trackEvent } from '../services/analytics';

trackEvent('custom_event_name', {
  param1: 'value1',
  param2: 'value2',
  // Add any custom parameters
});
```

---

## Current Page Analytics Status

### ✅ Fully Implemented (Page View + Enhanced Tracking)

| Page | Route | Analytics Features |
|------|-------|-------------------|
| InsightsHubPage | `/insights/hub` | viewItemList, search, selectContent, engagement |
| InsightsPage | `/insights` | selectContent, engagement |
| ServiceComparisonPage | `/insights/service/:slug` | viewItem, engagement |
| CountryServicePage | `/country-services/:country/:service` | viewItem, engagement |
| HeroSection (Landing) | `/` | selectContent, get_insights_clicked |

### ✅ Form Pages (Tracked via Components)

| Page | Route | Tracking Component |
|------|-------|-------------------|
| BANTFormPage | `/get-matched` | BANTForm (generateLead, formStarted, sectionCompleted) |
| ContactFormPage | `/contact` | ContactForm (contactFormSubmit) |

### ⚠️ Basic Tracking Only (Page View Only)

These pages have automatic `page_view` tracking but could benefit from enhanced analytics:

| Page | Route | Recommended Additions |
|------|-------|----------------------|
| LandingPage | `/` | useEngagementTracking |
| WhyThhiyaPage | `/why-thhiya` | useEngagementTracking |
| FeaturesPage | `/features` | useEngagementTracking, selectContent on card clicks |
| PrivacyPolicyPage | `/privacy-policy` | useEngagementTracking |
| CookiePolicyPage | `/cookie-policy` | useEngagementTracking |
| TermsOfServicePage | `/terms-of-service` | useEngagementTracking |
| PurpleListingsPage | `/purple-listings` | useEngagementTracking |
| GTMToolkitsPage | `/gtm-toolkits` | useEngagementTracking |

---

## Testing Your Analytics

### In Development Mode

GA4 is **disabled** in development. You'll see console logs:
```
[Analytics] Skipping GA init - development mode
```

### In Production

1. **Open GA4 Realtime Report**: [analytics.google.com](https://analytics.google.com) → Realtime
2. **Accept Cookies**: Must accept analytics cookies on the site
3. **Navigate the Site**: Watch events appear in realtime

### Using Browser DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by `collect` or `google-analytics`
4. Look for requests to `www.google-analytics.com/g/collect`

### Console Logs

With consent given, you'll see:
```
[Analytics] GA4 initialized
```

Without consent:
```
[Analytics] Skipping GA init - no consent
```

---

## Best Practices

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Page IDs | snake_case | `insights_hub`, `country_service_uae_eor` |
| Event content types | snake_case | `service_select`, `cta_button` |
| Item IDs | lowercase, hyphenated slugs | `uae`, `eor-services` |

### What NOT to Track

> ⚠️ **Never send PII (Personally Identifiable Information) to GA4**

- ❌ Names, emails, phone numbers
- ❌ IP addresses (GA4 already anonymizes)
- ❌ Sensitive business data

Instead, use anonymous identifiers:
- ✅ `submissionId` for linking to CRM
- ✅ Normalized slugs for services/countries
- ✅ Category names instead of specific details

### Performance Considerations

1. **Use `useEffect` with dependencies** to avoid duplicate event fires
2. **Gate events with conditionals** (e.g., only fire `viewItem` when data loads)
3. **Don't over-track** - focus on actionable business metrics

---

## Common Patterns

### Track Button with Navigation

```tsx
const navigate = useNavigate();

const handleCTAClick = () => {
  GA4Events.selectContent({
    contentType: 'cta_button',
    contentId: 'get_matched',
  });
  navigate('/get-matched');
};
```

### Track Conditional Content View

```tsx
const { data, isLoading } = useQuery(...);

useEffect(() => {
  if (data && !isLoading) {
    GA4Events.viewItem({
      itemId: data.id,
      itemName: data.name,
      itemCategory: 'product',
    });
  }
}, [data, isLoading]);
```

### Track Tab/Filter Changes

```tsx
const [activeTab, setActiveTab] = useState('all');

const handleTabChange = (tab: string) => {
  GA4Events.selectContent({
    contentType: 'filter_tab',
    contentId: tab,
  });
  setActiveTab(tab);
};
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `frontend/src/services/analytics.ts` | Core GA4 service, all event methods |
| `frontend/src/hooks/useEngagementTracking.ts` | Hook for scroll/time tracking |
| `frontend/src/hooks/useCookieConsent.ts` | Cookie consent management |
| `frontend/src/components/analytics/AnalyticsTracker.tsx` | Auto page view tracking |
| `frontend/src/components/analytics/OutboundLink.tsx` | Tracked external links |
| `GA4_FOR_BUSINESS.md` | Business-focused GA4 summary |
| `GA4_SETUP_GUIDE.md` | Technical setup and dashboard guide |

---

## Related Documentation

- [GA4 Business Summary](../GA4_FOR_BUSINESS.md) - For non-technical stakeholders
- [GA4 Setup Guide](../GA4_SETUP_GUIDE.md) - Dashboard configuration and verification
- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
