import ts from "typescript";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { normalizeSupportedCountries } from "../src/features/purple-listings/utils/normalizeSupportedCountries";

type Replacement = { start: number; end: number; text: string };

const formatStringArray = (values: string[], indent: string): string => {
  if (values.length === 0) return "[]";

  // Keep small lists inline for readability
  if (values.length <= 8) {
    return `[${values.map((v) => JSON.stringify(v)).join(", ")}]`;
  }

  const lines = values.map((v) => `${indent}  ${JSON.stringify(v)},`);
  return `[
${lines.join("\n")}
${indent}]`;
};

const getIndentAt = (text: string, position: number): string => {
  const lineStart = text.lastIndexOf("\n", position - 1) + 1;
  const line = text.slice(lineStart, position);
  const match = line.match(/^\s*/);
  return match ? match[0] : "";
};

const isStringLiteralLike = (node: ts.Node): node is ts.StringLiteralLike =>
  ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node);

const getPropName = (name: ts.PropertyName): string | null => {
  if (ts.isIdentifier(name)) return name.text;
  if (ts.isStringLiteral(name)) return name.text;
  return null;
};

const filePath = path.resolve(
  process.cwd(),
  "src/features/purple-listings/data/companies.ts",
);

const sourceText = readFileSync(filePath, "utf8");
const sourceFile = ts.createSourceFile(
  filePath,
  sourceText,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
);

const replacements: Replacement[] = [];
let totalSupportedCountriesProps = 0;
let updatedSupportedCountriesProps = 0;

const visit = (node: ts.Node) => {
  if (ts.isPropertyAssignment(node)) {
    const propName = getPropName(node.name);
    if (propName === "supportedCountries" && ts.isArrayLiteralExpression(node.initializer)) {
      totalSupportedCountriesProps += 1;

      const elements = node.initializer.elements;
      const rawValues: string[] = [];

      for (const el of elements) {
        if (!isStringLiteralLike(el)) {
          // If it's not a string literal, leave it untouched.
          return;
        }
        rawValues.push(String(el.text));
      }

      const normalized = normalizeSupportedCountries(rawValues);

      const start = node.initializer.getStart(sourceFile);
      const end = node.initializer.getEnd();
      const original = sourceText.slice(start, end);

      const indent = getIndentAt(sourceText, start);
      const formatted = formatStringArray(normalized, indent);

      if (formatted !== original) {
        replacements.push({ start, end, text: formatted });
        updatedSupportedCountriesProps += 1;
      }
    }
  }

  ts.forEachChild(node, visit);
};

visit(sourceFile);

// Apply edits from back-to-front to preserve offsets
replacements.sort((a, b) => b.start - a.start);
let nextText = sourceText;
for (const r of replacements) {
  nextText = nextText.slice(0, r.start) + r.text + nextText.slice(r.end);
}

if (nextText !== sourceText) {
  writeFileSync(filePath, nextText, "utf8");
}

console.log(
  JSON.stringify({
    file: filePath,
    totalSupportedCountriesProps,
    updatedSupportedCountriesProps,
    replacements: replacements.length,
  }),
);
