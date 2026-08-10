# Country Data Expansion - Agent Context and Guidelines

Goal: Systematically research, validate, and seed Tier 1/2/3 data for all 195 countries into the Insights Hub.

---

## 1. Core Architecture and File Paths

- Batch Tracker: `backend/data/seed/countries/COUNTRY_BATCH_TRACKER.md` (Master progress file)
- Validation Rules: `backend/data/seed/countries/VALIDATION_REQUIREMENTS.md` (Detailed QA gates)
- JSON Processing:
  - `pending/`: Raw text files (`{slug}_raw_research.txt`)
  - `processed/`: Final validated JSON files (`{slug}.json`)
- Scripts:
  - `backend/src/scripts/seed_countries.ts` - Handles MongoDB upserts
  - `backend/src/scripts/validate_country_data.ts` - Comprehensive JSON validation with depth checks
  - `backend/src/scripts/append_data.ts` - Service slug cleanup and validation
- Frontend Mappings: `frontend/src/constants/canonicalServices.ts` (Source of truth for slugs)

---

## 2. Strict Service Enforcement (CRITICAL)

### 2.1 The 12 Canonical Service Slugs

Source: `frontend/src/constants/canonicalServices.ts`

> [!CAUTION]
> DO NOT DEVIATE from these specific slug strings. Any service not in this list MUST BE DELETED.

| # | Service Name | REQUIRED JSON SLUG | Category |
|---|:---|:---|:---|
| 1 | EOR/PEO Services | `eor-peo` | Employment |
| 2 | Global Payroll | `global-payroll` | Payroll |
| 3 | Incorporation and Entity Setup | `incorporation-entity-setup` | Legal |
| 4 | Staffing and Talent Acquisition | `staffing-talent-acquisition` | Recruitment |
| 5 | HRIS | `hris` | Technology |
| 6 | Accounting Services | `accounting` | Finance |
| 7 | Tax Services | `tax` | Finance |
| 8 | Compliance Services | `compliance` | Legal |
| 9 | M and A Services | `msa` | Strategy |
| 10 | Software Solutions | `software-solutions` | Technology |
| 11 | Marketing Agencies | `marketing-agencies` | Marketing |
| 12 | Payroll Calculator | `payroll-calculator` | Payroll |

### 2.2 Validation Commands

```bash
# Validate all country JSONs (comprehensive check with depth requirements)
cd backend && bun src/scripts/validate_country_data.ts

# Clean invalid services from all JSONs
cd backend && bun src/scripts/append_data.ts
```

---

## 3. STRICT DEPTH REQUIREMENTS

### 3.1 Minimum Requirements Per Service

Every service in every country must have:

| Requirement | Minimum | Description |
|-------------|---------|-------------|
| Sections per service | 4 | Each of the 12 services needs at least 4 sections |
| Items per section | 3 | Each section needs at least 3 items/rows/steps |
| Required section types | `key_steps`, `insights` | Each service must have at least these two types |

### 3.2 Tier-Based Country Requirements

| Tier | Countries | Min Sections | Min Lines | Min Items |
|------|-----------|--------------|-----------|-----------|
| Tier 1 | US, UK, Germany, Brazil, India, China, Japan, France, Canada, Australia | 50+ | 2000+ | 150+ |
| Tier 2 | Singapore, Netherlands, Switzerland, Ireland, Spain, Italy, South Korea, Mexico, Poland, UAE | 30+ | 1200+ | 90+ |
| Tier 3 | All other countries | 20+ | 800+ | 60+ |

### 3.3 Section Type Mix Per Service

Each service should have a balanced mix of content types:

| Priority | Section Types | Purpose |
|----------|---------------|---------|
| Required | `key_steps` | Process walkthrough (hiring, setup, compliance) |
| Required | `insights` | Strategic tips, warnings, market intelligence |
| Recommended | `cost_breakdown` | Specific costs, fees, tax rates in tables |
| Recommended | `faq` | Common questions with detailed answers |
| Recommended | `good_to_know` | Cultural nuances, local practices |
| Optional | `essentials` | Quick reference data |
| Optional | `deductions` | Tax deduction breakdowns |
| Optional | `custom` | Rich content (HTML/Markdown) |

### 3.4 Content Depth Examples

BAD (Too Sparse):
```json
{
  "type": "key_steps",
  "title": "Onboarding",
  "content": {
    "steps": [
      { "title": "Step 1", "description": "Register" },
      { "title": "Step 2", "description": "Submit docs" }
    ]
  }
}
```

GOOD (Dense and Specific):
```json
{
  "type": "key_steps",
  "title": "Onboarding Process in Germany",
  "subtitle": "Timeline: 2-4 weeks",
  "content": {
    "steps": [
      {
        "stepNumber": 1,
        "title": "Employment Contract Drafting",
        "description": "Draft NachwG-compliant contract including: working hours (max 8h/day), probation period (max 6 months), notice periods (4 weeks statutory), salary breakdown with benefits. Contract must be provided in writing within 1 week of employment start."
      },
      {
        "stepNumber": 2,
        "title": "Social Security Registration",
        "description": "Register with Deutsche Rentenversicherung for pension, AOK/TK/other Krankenkasse for health insurance. Employer pays 50% of contributions. Total employer burden: ~21% of gross salary."
      },
      {
        "stepNumber": 3,
        "title": "Tax Card Setup",
        "description": "Obtain Lohnsteuerkarte (electronic since 2013). Employee provides Tax ID (Steuer-ID). Tax class determined by marital status (Steuerklasse I-VI)."
      },
      {
        "stepNumber": 4,
        "title": "Works Council Notification",
        "description": "If company has Betriebsrat (works council), notify before hiring. Works council has consultation rights on hiring decisions for companies with 20+ employees."
      },
      {
        "stepNumber": 5,
        "title": "Equipment and IT Access",
        "description": "GDPR-compliant data processing agreements. Employee consent for monitoring if applicable. Minimum 24-inch display recommended per arbeitsstättenverordnung."
      }
    ]
  }
}
```

---

## 4. Frontend-Backend Wiring Guide

Source: `frontend/src/components/insights/ServiceSection.tsx`

The frontend renders content based on `section.type`. Only the following types are valid.

### 4.1 Valid Section Types and Required Content

| JSON Section Type | Frontend Component | Required Content Schema |
|:---|:---|:---|
| `cost_breakdown` | `CostBreakdownTable` | `{ table: { rows: [{ label: string, values: string[], highlight?: boolean }], headers: string[] } }` |
| `key_steps` | `ServiceSteps` | `{ steps: [{ stepNumber?: number, title: string, description: string }] }` |
| `insights` | `InsightsPanel` | `{ items: [{ type: 'info' or 'warning' or 'tip', title: string, text: string }] }` |
| `good_to_know` | `GoodToKnowSection` | `{ items: [{ type: 'tip', title: string, text: string }] }` |
| `faq` | `FAQSection` | `{ faqs: [{ question: string, answer: string }] }` |
| `essentials` | Generic section | `{ items: [...] }` or `{ table: {...} }` |
| `deductions` | Generic section | `{ table: {...} }` |
| `custom` | Generic Markup | `{ html: string }` OR `{ markdown: string }` |

### 4.2 Critical Field Notes

> [!IMPORTANT]
> - For `insights` and `good_to_know`, the text field is strictly `text` (NOT `description`)
> - `cost_breakdown` strictly requires a `table` object, not just a list of items
> - Each service can have multiple sections of the same type

### 4.3 Insight Item Types

| Type | Visual | Use Case |
|------|--------|----------|
| `info` | Blue border | General information |
| `warning` | Red border | Risks, penalties, strict laws |
| `tip` | Lightbulb icon | Strategic advice, tips |

---

## 5. Usage Workflow (The "Deep Loop" Protocol)

Core Principle: One Country at a Time --> Loop through 12 Services --> "Micro-Search" for Depth.

### 5.1 Workflow Steps

1. Select Target: Pick the next `NOT_STARTED` or `NEEDS_MORE` country from `COUNTRY_BATCH_TRACKER.md`.

2. Service Loop (Process each of the 12 services sequentially):
   - Micro-Searching: Do NOT run one generic search. Run 3-4 specific queries per service.
   - Drafting: Write the JSON section immediately while context is fresh.
   - Depth Check: Ensure each service has at least 4 robust sections with 3+ items each.

3. Synthesis: Combine all 12 services into the final `{slug}.json`.

4. Validation:
   - Run `bun src/scripts/validate_country_data.ts` - must show 0 errors
   - Tier 1: must have 50+ sections and 2000+ lines
   - Tier 2: must have 30+ sections and 1200+ lines
   - Tier 3: must have 20+ sections and 800+ lines

5. Seed: Run the seeding script.

6. Mark Complete: Update the tracker.

### 5.2 The "Micro-Search" Strategy

To achieve 2000+ lines, you must query for components, not summaries.

Example for "EOR Services":
- [AVOID]: "EOR in Germany"
- [GOOD 1]: "Germany EOR management fee pricing 2025"
- [GOOD 2]: "Germany labor leasing AUG license requirements 2025"
- [GOOD 3]: "Germany employer social security contribution rates 2025 table"
- [GOOD 4]: "Germany permanent establishment risk EOR"

Repeat this granular approach for ALL 12 services.

---

## 6. Section Content Checklist Per Service

For each of the 12 services, ensure the following content mix:

### EOR-PEO

| Section | Type | Min Items | Content Focus |
|---------|------|-----------|---------------|
| Onboarding Process | key_steps | 5 | Step-by-step employee setup |
| Cost Breakdown | cost_breakdown | 5 | Management fees, taxes, benefits |
| Legal Risks | insights | 3 | PE risk, misclassification, compliance |
| Cultural Considerations | good_to_know | 3 | Local norms, expectations |
| FAQs | faq | 5 | Common questions |

### Global Payroll

| Section | Type | Min Items | Content Focus |
|---------|------|-----------|---------------|
| Processing Cycle | key_steps | 4 | Monthly payroll steps |
| Tax Withholdings | cost_breakdown | 6 | Income tax, social security rates |
| Deductions | deductions | 5 | Mandatory vs optional |
| Compliance Notes | insights | 3 | Filing deadlines, penalties |
| FAQs | faq | 4 | Common payroll questions |

### Incorporation-Entity-Setup

| Section | Type | Min Items | Content Focus |
|---------|------|-----------|---------------|
| Entity Types | insights | 3 | LLC vs Corp vs Branch comparison |
| Registration Steps | key_steps | 5 | Timeline and process |
| Setup Costs | cost_breakdown | 6 | All fees itemized |
| Requirements | good_to_know | 3 | Director residency, capital requirements |
| FAQs | faq | 4 | Common incorporation questions |

(Apply similar patterns to remaining 9 services)

---

## 7. Common Pitfalls to Avoid

| Pitfall | Issue | Fix |
|---------|-------|-----|
| Wrong Slugs | Using `incorporation` instead of `incorporation-entity-setup` | Copy exact slug from table above |
| Wrong Section Type | Using `overview` instead of `insights` | Use only types from Section 4.1 |
| Missing Hero Data | Every service needs complete `heroData` | Include `title`, `subtitle`, `description`, `bestFor`, `icon` |
| Empty Sections Array | `sections: []` causes validation failure | Add at least 4 sections per service |
| Sparse Content | Only 2 items in a section | Each section needs 3+ items |
| Wrong Content Field | Using `description` instead of `text` in items | Check content schema in Section 4.1 |
| Generic Advice | "Consult a lawyer" without specifics | Add specific laws, amounts, deadlines |
| Missing Costs | No specific numbers or ranges | Include actual fees, rates, percentages |
