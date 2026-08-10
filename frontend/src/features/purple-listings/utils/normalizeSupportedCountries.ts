import { COUNTRY_OPTIONS } from "../../auth/data/countries";

const ALL_COUNTRY_NAMES: string[] = Array.from(
  new Set(COUNTRY_OPTIONS.map((c) => c.value).filter(Boolean)),
);

const isCountryCountPlaceholder = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return true;

  // Examples we want to remove from supportedCountries:
  // - "100+ Countries", "190 Countries", "20+ Countries via Partners"
  // - "42+ European Countries", "50+ African Countries"
  const hasCountriesWord = /\bCountries\b/i.test(trimmed);
  const hasDigit = /\d/.test(trimmed);
  return hasCountriesWord && hasDigit;
};

/**
 * Normalizes a company's supportedCountries list:
 * - Removes placeholders like "100+ Countries", "190 Countries", etc.
 * - Treats "Global" as not-a-country; if it's the ONLY remaining signal, expands to all country names.
 * - Returns a de-duplicated list preserving original order.
 */
export const normalizeSupportedCountries = (countries: string[] | undefined): string[] => {
  const input = (countries ?? []).map((c) => String(c).trim()).filter(Boolean);

  const withoutPlaceholders = input.filter((c) => !isCountryCountPlaceholder(c));

  const hasGlobal = withoutPlaceholders.some((c) => c.toLowerCase() === "global");
  const withoutGlobal = withoutPlaceholders.filter((c) => c.toLowerCase() !== "global");

  const seen = new Set<string>();
  const unique = withoutGlobal.filter((c) => {
    if (seen.has(c)) return false;
    seen.add(c);
    return true;
  });

  // If a company lists "Global" at all, treat it as worldwide coverage.
  // This also ensures filters show real country names (not "Global").
  if (hasGlobal) {
    return ALL_COUNTRY_NAMES;
  }

  return unique;
};
