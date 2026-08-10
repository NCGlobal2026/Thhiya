import { COMPANIES } from "../src/features/purple-listings/data/companies";
import { normalizeSupportedCountries } from "../src/features/purple-listings/utils/normalizeSupportedCountries";

const isPlaceholder = (value: string): boolean => /\bCountries\b/i.test(value) && /\d/.test(value);

let companiesWithPlaceholdersBefore = 0;
let placeholderEntriesBefore = 0;
let globalOnlyBefore = 0;

for (const c of COMPANIES) {
  const list = c.supportedCountries ?? [];
  const placeholders = list.filter((v) => isPlaceholder(v));
  if (placeholders.length > 0) {
    companiesWithPlaceholdersBefore++;
    placeholderEntriesBefore += placeholders.length;
  }

  const nonEmpty = list.map((v) => String(v).trim()).filter(Boolean);
  const onlyGlobal = nonEmpty.length === 1 && nonEmpty[0].toLowerCase() === "global";
  if (onlyGlobal) globalOnlyBefore++;
}

// Because COMPANIES is already normalized at export-time, this should be 0.
const sample = COMPANIES.find((c) => (c.supportedCountries ?? []).some((v) => isPlaceholder(v)));

console.log(
  JSON.stringify(
    {
      companies: COMPANIES.length,
      companiesWithPlaceholdersBefore,
      placeholderEntriesBefore,
      globalOnlyBefore,
      sampleCompanyWithPlaceholder: sample ? { slug: sample.slug, name: sample.name } : null,
      note:
        "COMPANIES is normalized at export-time. If this shows placeholders, normalization is not being applied.",
      sanityCheck: {
        normalizedExampleLength: normalizeSupportedCountries(["Global"]).length,
      },
    },
    null,
    2,
  ),
);
