---
description: Complete workflow for researching, validating, and seeding country data to Insights Hub
---

# Country Data Seeding Workflow

This workflow guides the process of collecting comprehensive country data for the Insights Hub and seeding it to MongoDB.

---

## Phase 1: Research & Data Collection

### 1.1 Verify Tier Assignment

Check `COUNTRY_BATCH_TRACKER.md` for country tier:

- **Tier 1**: 40+ sections, 12-15 Tavily searches per service
- **Tier 2**: 25+ sections, 8-10 searches per service
- **Tier 3**: 15+ sections, 4-6 searches per service

### 1.2 Research Using Tavily API

For each of the 12 canonical services, research:

```text
Services to cover (use EXACT slugs):
1. eor-peo                    - EOR/PEO Services
2. global-payroll             - Global Payroll
3. incorporation-entity-setup - Incorporation & Entity Setup
4. staffing-talent-acquisition - Staffing & Recruitment
5. hris                       - HRIS
6. accounting                 - Accounting Services
7. tax                        - Tax Advisory
8. compliance                 - Compliance & Risk
9. msa                        - M&A Transaction Support
10. software-solutions        - Software & Technology Solutions
11. marketing-agencies        - Marketing & Agency Services
12. payroll-calculator        - Payroll Calculator
```

Research topics per service:

- Current costs and pricing (with year, e.g., "2025")
- Legal requirements and compliance
- Step-by-step processes
- Common pitfalls and warnings
- Tax rates and thresholds
- Timeline expectations
- Local provider options

---

## Phase 2: JSON Structure & Validation

### 2.1 Section Types (must match frontend)

Use ONLY these section types from `ServiceSection.tsx`:

| Type | Component | Required Content |
| :--- | :--- | :--- |
| `cost_breakdown` | CostBreakdownTable | `items[]` with label, value, description |
| `key_steps` | ServiceSteps | `items[]` with step, title, description |
| `insights` | InsightsPanel | `items[]` with type, title, description |
| `good_to_know` | GoodToKnowSection | `items[]` with type, title, description |
| `faq` | FAQSection | `content.faqs[]` with question, answer |
| `custom` | Generic | `content.html` or `content.markdown` |

### 2.2 Insight Item Types

For `insights` and `good_to_know` sections:

```json
{
  "type": "info | warning | success | tip",
  "title": "Short title",
  "description": "Detailed explanation"
}
```

### 2.3 JSON Template Structure

```json
{
  "name": "Country Name",
  "code": "XX",
  "slug": "country-slug",
  "region": "Region Name",
  "flag": "https://flagcdn.com/w160/xx.png",
  "languages": ["Language"],
  "currencies": ["Currency (Code)"],
  "services": [
    {
      "name": "Service Display Name",
      "serviceName": "Service Display Name",
      "serviceSlug": "canonical-slug-from-list",
      "slug": "canonical-slug-from-list",
      "heroData": {
        "title": "Service in Country",
        "subtitle": "Brief tagline",
        "description": "2-3 sentence overview",
        "bestFor": "Target audience",
        "icon": "service-slug"
      },
      "sections": [
        {
          "title": "Section Title",
          "type": "cost_breakdown | key_steps | insights | good_to_know | faq",
          "items": []
        }
      ]
    }
  ]
}
```

---

## Phase 3: Validation Checklist

### 3.1 Pre-Seed Validation

- [ ] All 12 services present
- [ ] Service slugs match `canonicalServices.ts` exactly
- [ ] Each service has `heroData` with all required fields
- [ ] Each service has at least 3 sections
- [ ] Section types are valid enum values
- [ ] No empty arrays or placeholder text
- [ ] Country code is 2-letter ISO (lowercase for flag URL)
- [ ] Flag URL format: `https://flagcdn.com/w160/{code}.png`

### 3.2 Content Quality

- [ ] Cost figures include specific amounts (not ranges like "varies")
- [ ] Dates/years are current (2024-2025)
- [ ] Legal thresholds are accurate
- [ ] No duplicate section titles within a service

---

## Phase 4: Seeding Process

### 4.1 Run Seed Script

// turbo

```bash
cd /Users/jay/Development/Projects/Internship/Thhiya/Website/thhiya/backend
npx ts-node src/scripts/seed_countries.ts
```

### 4.2 Verify in Database

// turbo

```bash
cd /Users/jay/Development/Projects/Internship/Thhiya/Website/thhiya/backend
npx ts-node -e "
const mongoose = require('mongoose');
require('dotenv').config();
const CountryService = require('./src/models/CountryService').default;
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const count = await CountryService.countDocuments();
  const countries = await CountryService.distinct('country');
  console.log('Total services:', count);
  console.log('Countries:', countries);
  process.exit(0);
});
"
```

---

## Phase 5: Frontend Verification

### 5.1 Start Dev Server

// turbo

```bash
cd /Users/jay/Development/Projects/Internship/Thhiya/Website/thhiya
npm run dev
```

### 5.2 Test URLs

Visit these URLs to verify:

- `/insights` - Hub page shows country
- `/insights?country={country-name}` - All services load
- `/insights?country={country-name}&service={service-slug}` - Specific service renders

### 5.3 Component Compatibility Check

Verify each section type renders correctly:

- CostBreakdownTable shows table/cards
- ServiceSteps shows numbered steps
- InsightsPanel shows colored insight cards
- FAQSection shows expandable accordion

---

## Slug Reference (CRITICAL)

**ALWAYS use these exact slugs** (from `frontend/src/constants/canonicalServices.ts`):

| Display Name | Slug (use this) |
| :--- | :--- |
| EOR/PEO Services | eor-peo |
| Global Payroll | global-payroll |
| Incorporation & Entity Setup | incorporation-entity-setup |
| Staffing & Talent Acquisition | staffing-talent-acquisition |
| HRIS | hris |
| Accounting Services | accounting |
| Tax Services | tax |
| Compliance Services | compliance |
| M&A Services | msa |
| Software Solutions | software-solutions |
| Marketing Agencies | marketing-agencies |
| Payroll Calculator | payroll-calculator |

---

## File Locations

| Purpose | Path |
| :--- | :--- |
| Tracker | `backend/data/seed/countries/COUNTRY_BATCH_TRACKER.md` |
| Processed JSON | `backend/data/seed/countries/processed/` |
| Pending Research | `backend/data/seed/countries/pending/` |
| Validation Rules | `backend/data/seed/countries/VALIDATION_REQUIREMENTS.md` |
| Seed Script | `backend/src/scripts/seed_countries.ts` |
| Country Model | `backend/src/models/Country.ts` |
| Service Model | `backend/src/models/CountryService.ts` |
| Frontend Constants | `frontend/src/constants/canonicalServices.ts` |
| ServiceSection | `frontend/src/components/insights/ServiceSection.tsx` |

---

## Update Tracker After Completion

Mark country as COMPLETE in `COUNTRY_BATCH_TRACKER.md`:

```md
| Country Name | 1 | COMPLETE | 48 | Tier 1 complete |
```
