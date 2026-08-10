# Country Data Validation Requirements

## 1. Data Depth Tiers

### Tier 1: Strategic Markets

**Countries**: United States, United Kingdom, Germany, Brazil, India, China, Japan, France, Canada, Australia

| Requirement | Target | Description |
| ----------- | ------ | ----------- |
| **Total Sections** | **50+** | Across all 12 services |
| **Total Lines** | **2000+** | JSON file line count |
| **Total Items** | **150+** | Sum of all items/rows/steps |
| **Sections/Service** | **5+** | Each service must have 5+ sections |
| **Items/Section** | **3+** | Each section must have 3+ items |

**Depth Requirement**: **Exhaustive**.

- Covers state/regional variations (e.g., US States, CA Provinces).
- Complex tax laws and specific penalty amounts.
- **Micro-Search Strategy**: 3-4 distinct queries per service (36+ total per country).

**Required Sections per Service**:

- **Cost Breakdown** (`cost_breakdown`) - Specific numbers, 5+ items.
- **Legal Framework** (`essentials`) - Specific Acts/Sections, 4+ items.
- **Key Steps** (`key_steps`) - Detailed walkthrough, 5+ items.
- **Insights** (`insights`) - Future trends 2025/2026, 4+ items.
- **FAQ** (`faq`) - Non-generic, 5+ items.
- **Payroll Calculator** (`table`) - Mandatory sample with specific tax bands.

---

### Tier 2: Major Economies

**Countries**: Singapore, Netherlands, Switzerland, Ireland, Spain, Italy, South Korea, Mexico, Poland, UAE

| Requirement | Target | Description |
| ----------- | ------ | ----------- |
| **Total Sections** | **50+** | Across all 12 services |
| **Total Lines** | **2000+** | JSON file line count |
| **Total Items** | **150+** | Sum of all items/rows/steps |
| **Sections/Service** | **5+** | Each service must have 5+ sections |
| **Items/Section** | **3+** | Each section must have 3+ items |

**Depth Requirement**: **High**.

- Covers national laws, standard costs, standard procedures.
- **Research**: 8-10 inputs per service.

**Required Sections per Service**:

- **Cost Breakdown** (`cost_breakdown`)
- **Key Steps** (`key_steps`)
- **Compliance Overview** (`insights`)

---

### Tier 3: Standard Coverage

**Countries**: All remaining countries

| Requirement | Target | Description |
| ----------- | ------ | ----------- |
| **Total Sections** | **50+** | Across all 12 services |
| **Total Lines** | **2000+** | JSON file line count |
| **Total Items** | **150+** | Sum of all items/rows/steps |
| **Sections/Service** | **5+** | Each service must have 5+ sections |
| **Items/Section** | **3+** | Each section must have 3+ items |

**Depth Requirement**: **Baseline**.

- General availability, estimated costs, primary laws.
- **Research**: 4-6 inputs per service.

**Required Sections**:

- Service Overview/Hero Data
- Estimated Costs (ranges allowed)
- Basic Process Steps

---

## 2. Service Slug Validation (STRICT)

### 2.1 Canonical Service Slugs

> [!CAUTION]
> ONLY these 12 slugs are allowed. Any other slug will be removed by the cleanup script.

```typescript
const TOP_12_SERVICES: string[] = [
    'eor-peo',
    'global-payroll',
    'incorporation-entity-setup',
    'staffing-talent-acquisition',
    'hris',
    'accounting',
    'tax',
    'compliance',
    'msa',
    'software-solutions',
    'marketing-agencies',
    'payroll-calculator'
];
```

### 2.2 Validation Commands

```bash
# Validate all country JSONs (comprehensive check with depth requirements)
cd backend && bun src/scripts/validate_country_data.ts

# Clean invalid services from all JSONs
cd backend && bun src/scripts/append_data.ts

# Type check
cd backend && bun x tsc --noEmit
```

---

## 3. Section Type Validation (STRICT)

### 3.1 Valid Section Types

Only the following section types are recognized by the frontend:

| Type | Component | Content Requirement |
| ---- | --------- | ------------------- |
| `cost_breakdown` | CostBreakdownTable | `content.table` with `rows` and `headers` |
| `key_steps` | ServiceSteps | `content.steps` array |
| `insights` | InsightsPanel | `content.items` array with `text` field |
| `good_to_know` | GoodToKnowSection | `content.items` array with `text` field |
| `faq` | FAQSection | `content.faqs` array |
| `essentials` | Generic | `content.items` or `content.table` |
| `deductions` | Generic | `content.table` |
| `custom` | Markdown/HTML | `content.html` or `content.markdown` |
| `table` | GenericTable | `content.table` with `rows` and `headers` |

### 3.2 Required Section Types Per Service

Each service must have at minimum:

| Priority | Section Type | Required Per Service |
| -------- | ------------ | ------------------- |
| Required | `key_steps` | Yes - process walkthrough |
| Required | `insights` | Yes - tips and warnings |
| Recommended | `cost_breakdown` | For 6+ services |
| Recommended | `faq` | For 6+ services |

---

## 4. Content Schema Requirements

### 4.1 cost_breakdown

Minimum 3 rows required.

```json
{
  "type": "cost_breakdown",
  "title": "Cost Breakdown",
  "content": {
    "table": {
      "headers": ["Item", "Amount", "Notes"],
      "rows": [
        { "label": "Registration Fee", "values": ["$500", "One-time"], "highlight": false },
        { "label": "Annual Filing", "values": ["$200", "Yearly"], "highlight": false },
        { "label": "Agent Fee", "values": ["$300/year", "Required"], "highlight": false },
        { "label": "Total First Year", "values": ["$1,000", "-"], "highlight": true }
      ]
    }
  }
}
```

### 4.2 key_steps

Minimum 3 steps required. Each step must have descriptive content.

```json
{
  "type": "key_steps",
  "title": "Registration Process",
  "subtitle": "Timeline: 2-4 weeks",
  "content": {
    "steps": [
      {
        "stepNumber": 1,
        "title": "Document Gathering",
        "description": "Collect Articles of Incorporation, proof of registered address, director identification documents (passport or national ID), and initial share capital deposit confirmation."
      },
      {
        "stepNumber": 2,
        "title": "Notarization",
        "description": "Articles must be notarized by a local notary public. Fee typically ranges from $200-500. Appointment usually required 1-2 weeks in advance."
      },
      {
        "stepNumber": 3,
        "title": "Registry Submission",
        "description": "Submit all documents to the commercial registry (Handelsregister in Germany, Companies House in UK). Processing time: 1-2 weeks. Online submission available in most countries."
      }
    ]
  }
}
```

### 4.3 insights / good_to_know

Minimum 3 items required. Use `text` field (not `description`).

```json
{
  "type": "insights",
  "title": "Key Compliance Points",
  "content": {
    "items": [
      {
        "type": "warning",
        "title": "Permanent Establishment Risk",
        "text": "Using an EOR for more than 24 months may trigger PE concerns with tax authorities. Document the commercial rationale for extended EOR use."
      },
      {
        "type": "info",
        "title": "Social Security Rates 2025",
        "text": "Employer contribution is 21.3% of gross salary, split between pension (9.3%), health (7.3%), unemployment (1.2%), and care insurance (3.5%)."
      },
      {
        "type": "tip",
        "title": "Works Council Considerations",
        "text": "For companies with 5+ employees, workers can elect a works council. This impacts hiring, firing, and working conditions decisions."
      }
    ]
  }
}
```

### 4.4 faq

Minimum 3 questions required. Answers should be detailed, not one-liners.

```json
{
  "type": "faq",
  "title": "Frequently Asked Questions",
  "content": {
    "faqs": [
      {
        "question": "How long does entity registration take?",
        "answer": "Standard registration takes 2-4 weeks. Express services available in some jurisdictions can reduce this to 3-5 business days. Timeline depends on document completeness and notary appointment availability."
      },
      {
        "question": "What is the minimum capital requirement?",
        "answer": "GmbH requires EUR 25,000 (12,500 must be deposited upfront). UG (mini-GmbH) can start with EUR 1 but profits must be retained until reaching 25,000. AG requires EUR 50,000."
      },
      {
        "question": "Do I need a local director?",
        "answer": "No residency requirement for directors since 2019, but having a local managing director simplifies banking relationships. At least one director must be an individual (not a corporate entity)."
      }
    ]
  }
}
```

---

## 5. Quality Assurance Gates

### Gate 1: Service Completeness

| Check | Status | Action |
| ----- | ------ | ------ |
| Missing any of 12 slugs | REJECT | Add missing services |
| Invalid slug (not in list) | REJECT | Remove or rename |
| Empty services array | REJECT | Add all 12 services |

### Gate 2: Section Depth

| Check | Status | Action |
| ----- | ------ | ------ |
| Service has 0 sections | REJECT | Add minimum 4 sections |
| Service has less than 4 sections | REJECT | Add more sections |
| Section has less than 3 items | WARNING | Expand content |

### Gate 3: Section Validity

| Check | Status | Action |
| ----- | ------ | ------ |
| Invalid section type | REJECT | Use valid type from list |
| Missing content | REJECT | Add required content |
| Wrong content schema | REJECT | Fix content structure |

### Gate 4: Frontend Compatibility

| Check | Status | Action |
| ----- | ------ | ------ |
| Missing heroData | REJECT | Add complete heroData |
| Missing flag URL | WARNING | Add flag CDN URL |
| Placeholder text | REJECT | Replace with real data |

### Gate 5: Tier-Based Depth (STRICT)

| Check | Status | Action |
| ----- | ------ | ------ |
| Tier 1: Less than 50 sections | REJECT | Add more content |
| Tier 1: Less than 2000 lines | REJECT | Expand all services |
| Tier 2: Less than 30 sections | REJECT | Add more content |
| Tier 2: Less than 1200 lines | REJECT | Expand services |
| Tier 3: Less than 20 sections | REJECT | Add more content |
| Tier 3: Less than 800 lines | REJECT | Expand services |

---

## 6. Running Validation

### Before Seeding (Required)

```bash
# Full validation with depth checks
cd backend && bun src/scripts/validate_country_data.ts

# Expected output for passing country:
# [PASS] germany.json (T1): 52 sections, 2150 lines, 165 items

# Output for failing country:
# [FAIL] japan.json (T1): needs +41 sections +1625 lines
```

### Interpreting Results

The validation script provides:

- Per-country status (PASS/FAIL)
- Section count, line count, and item count
- Specific errors (which services lack sections)
- Summary of what needs to be added

### After Adding Content

1. Re-run validation: `bun src/scripts/validate_country_data.ts`
2. Fix any remaining errors
3. Run type check: `bun x tsc --noEmit`
4. Seed to database: `bun run seed:countries`

---

## 7. Data Quality Checklist

Before marking a country as "PUSHED", verify:

- [ ] All 12 services present with correct slugs
- [ ] Each service has 4+ sections
- [ ] Each section has 3+ items/rows/steps
- [ ] Total sections meets tier requirement (50/30/20)
- [ ] Total lines meets tier requirement (2000/1200/800)
- [ ] No placeholder text ("Coming soon", "TBD", etc.)
- [ ] Specific numbers, rates, and fees included
- [ ] 2024/2025 data where applicable
- [ ] Section types are all valid
- [ ] Content schemas match frontend expectations
- [ ] HeroData complete for all services

---

Reference `AGENT_CONTEXT.md` for full component mapping and deep loop workflow.
