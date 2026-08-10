# GA4 Analytics Reference — Thhiya

Complete reference for GA4 analytics implementation.

---

## Overview

### Configuration

| Setting | Value |
| --- | --- |
| Measurement ID | `G-566H5MYEFH` |
| Service File | `frontend/src/services/analytics.ts` |
| Engagement Hook | `frontend/src/hooks/useEngagementTracking.ts` |
| Cookie Consent | `frontend/src/hooks/useCookieConsent.ts` |
| Auto Page Tracking | `frontend/src/components/analytics/AnalyticsTracker.tsx` |

### What We Track

| Category | What's Tracked | Business Value |
| --- | --- | --- |
| Page Views | Which pages users visit | Content popularity |
| Lead Generation | BANT/MEDDIC/INTENT(BMI) form submissions | Primary conversion metric |
| Form Funnel | Form start → section progress → submission | Drop-off analysis |
| User Intent | Service/country selections, CTA clicks | Interest signals |
| Content Engagement | Scroll depth, time on page | Content quality |
| Search Activity | What users search for | Demand signals |

---

## Events Reference

### Automatic Events (No code needed)

| Event | Tracked By | Trigger |
| --- | --- | --- |
| `page_view` | AnalyticsTracker | Every route change |
| `scroll_depth` | useEngagementTracking | 25%, 50%, 75%, 100% scroll |
| `time_on_page` | useEngagementTracking | 30s, 60s, 120s on page |

### Custom Events (GA4Events methods)

```typescript
import { GA4Events } from '../services/analytics';
```

| Method | Event Name | Parameters |
| --- | --- | --- |
| `GA4Events.generateLead()` | `generate_lead` | `lead_source`, `services_requested`, `target_country`, `submission_id` |
| `GA4Events.bantFormStarted()` | `bant_form_started` | `source` |
| `GA4Events.bantFormSectionCompleted()` | `bant_form_section_completed` | `section`, `source` |
| `GA4Events.contactFormSubmit()` | `contact_form_submit` | `form_type`, `subject`, `source` |
| `GA4Events.selectContent()` | `select_content` | `content_type`, `content_id`, `item_id` |
| `GA4Events.viewItem()` | `view_item` | `item_id`, `item_name`, `item_category` |
| `GA4Events.viewItemList()` | `view_item_list` | `item_list_id`, `item_list_name`, `items[]` |
| `GA4Events.search()` | `search` | `search_term`, `search_category` |
| `GA4Events.outboundClick()` | `click` | `link_url`, `link_text`, `outbound` |

### Events for GA4 Configuration

| Event | When It Fires | Mark as Conversion? |
| --- | --- | --- |
| `generate_lead` | BANT/MEDDIC/INTENT(BMI) form submitted | ⭐ Yes (Primary) |
| `bant_form_started` | Form opened | Optional |
| `contact_form_submit` | Contact form sent | Optional |
| `get_insights_clicked` | Hero CTA clicked | Optional |

---

## Adding Analytics to New Pages

### Step 1: Add Engagement Tracking

```typescript
import { useEngagementTracking } from '../hooks/useEngagementTracking';

export const MyNewPage: React.FC = () => {
  useEngagementTracking('my_new_page');
  
  return ( /* ... */ );
};
```

### Step 2: Track Content Views (for item pages)

```typescript
import { useEffect } from 'react';
import { GA4Events } from '../services/analytics';

useEffect(() => {
  GA4Events.viewItem({
    itemId: 'unique-id',
    itemName: 'Display Name',
    itemCategory: 'category',
  });
}, []);
```

### Step 3: Track User Interactions

```typescript
const handleClick = () => {
  GA4Events.selectContent({
    contentType: 'cta_button',
    contentId: 'button_name',
  });
};
```

---

## Current Page Tracking Status

### Full Tracking (Engagement + Custom Events)

| Page | Page ID | Custom Events |
| --- | --- | --- |
| InsightsPage | `insights_page` | selectContent |
| InsightsHubPage | `insights_hub` | viewItemList, search, selectContent |
| ServiceComparisonPage | `service_comparison_*` | viewItem |
| CountryServicePage | `country_service_*` | viewItem |
| FeaturesPage | `features_page` | selectContent |

### Engagement Tracking Only

| Page | Page ID |
| --- | --- |
| LandingPage | `landing_page` |
| WhyThhiyaPage | `why_thhiya` |
| PrivacyPolicyPage | `privacy_policy` |
| CookiePolicyPage | `cookie_policy` |
| TermsOfServicePage | `terms_of_service` |
| PurpleListingsPage | `purple_listings` |
| GTMToolkitsPage | `gtm_toolkits` |
| BANTFormPage | `bant_form_page` |
| ContactFormPage | `contact_form_page` |

### Form Components (Self-Tracking)

| Component | Events Tracked |
| --- | --- |
| BANTForm | `bant_form_started`, `bant_form_section_completed`, `generate_lead` |
| ContactForm | `contact_form_submit` |
| HeroSection | `select_content`, `get_insights_clicked` |

---

## Best Practices

### Naming Conventions

| Type | Format | Example |
| --- | --- | --- |
| Page IDs | snake_case | `landing_page`, `country_service_uae_eor` |
| Content Types | snake_case | `cta_button`, `feature_card` |
| Content IDs | lowercase, descriptive | `get_started`, `vendor_reviews` |

### What NOT to Send

❌ Names, emails, phone numbers (PII)  
❌ Sensitive business data  
❌ Full URLs with user data in query params

✅ Use `submissionId` for CRM linking  
✅ Use slugs/codes for services/countries  
✅ Use category names, not specific details

---

## Privacy & Compliance

- GA4 only loads after cookie consent
- No PII (personal data) is sent
- Compliant with GDPR and India DPDP Act
- Users can opt out via cookie preferences

---

## Testing

GA4 is disabled in development. Console shows:

```text
[Analytics] Skipping GA init - development mode
```

To test, deploy to production or use GA4 DebugView with Tag Assistant.

---

## Related Docs

- [GA4_DASHBOARD_GUIDE.md](./GA4_DASHBOARD_GUIDE.md) - Dashboard setup in GA4
- [.agent/workflows/reference.md](./.agent/workflows/reference.md) - Full workflow reference

---

## Contact

- **Technical:** Engineering team
- **Reports/Dashboards:** Growth team
- **Email:** <info@bugbuk.com>
