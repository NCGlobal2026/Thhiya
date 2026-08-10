# Backend JSON Wiring Guide & Validation

This document defines the strict schema and wiring requirements for country service data JSON files located in `backend/data/seed/countries/processed/`.

## Core Requirements

1. **Service Slugs**: Only the 12 canonical slugs are allowed. Any other slug MUST be removed.
   - `eor-peo`, `global-payroll`, `incorporation-entity-setup`, `staffing-talent-acquisition`, `hris`, `accounting`, `tax`, `compliance`, `msa`, `software-solutions`, `marketing-agencies`, `payroll-calculator`

2. **Section Types**: Only specific section types are supported by the frontend.
   - `cost_breakdown`, `key_steps`, `essentials`, `insights`, `good_to_know`, `deductions`, `faq`, `custom`

## Section Schema Details

| Section Type | Component Mapping | Required `content` Structure |
|--------------|-------------------|----------------------------|
| `cost_breakdown` | `SummaryPanel` | `content.table` (with `headers` and `rows`) |
| `key_steps` | `ProcessSteps` | `content.steps` (array of objects with `title`, `description`) |
| `insights` | `InsightsPanel` | `content.items` (array with `text` field, not `description`) |
| `good_to_know` | `InsightsPanel` | `content.items` (array with `text` field, not `description`) |
| `faq` | `FAQPanel` | `content.faqs` (array of `{ question, answer }`) |
| `custom` | `CustomContent` | `content.html` OR `content.markdown` |

## Validation & Migration Logic (`validate_and_clean_data.ts`)

The `validate_and_clean_data.ts` script enforces these rules automatically and performs the following migrations:

- **Legacy `items` to `table`**: Converts legacy arrays into the `ITable` format for `cost_breakdown`.
- **Legacy `items` to `steps`**: Converts legacy arrays into the `IStep` format for `key_steps`.
- **Field Normalization**: Renames `description`, `value`, or `item` fields to `text` for `insights` and `good_to_know`.
- **Global Cleanup**: Removes non-compliant services, invalid section types, and non-model root keys (like `marketExpansionRoadmap`).
- **ID Generation**: Ensures every section has a unique ID (e.g., `section-1`).

## Workflow for New Countries

1. Generate raw data using scraping or LLM tools.
2. Place JSON in `backend/data/seed/countries/processed/`.
3. **Run `npx tsx validate_and_clean_data.ts`** to ensure it matches the wiring guide.
4. **Run `bun src/scripts/seed_countries.ts`** to seed the database.

> [!CAUTION]
> Never manually add services or sections that don't match the slugs/types above. They will be automatically deleted by the validation script.
