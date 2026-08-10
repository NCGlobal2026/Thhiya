import mongoose from "mongoose";
import dotenv from "dotenv";
import Provider from "../models/Provider.ts";
import { PROVIDER_CATALOG as PROVIDERS } from "../constants/providerCatalog.ts";
import {
  analyzeCompany,
  GeminiQuotaExceededError,
} from "../services/geminiService.ts";

dotenv.config();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function hasIntentFields(provider: {
  intentScore?: number;
  scoringFactors?: unknown;
  sentimentAnalysis?: unknown;
}) {
  return (
    typeof provider.intentScore === "number" &&
    !!provider.scoringFactors &&
    !!provider.sentimentAnalysis
  );
}

async function main() {
  const uri = process.env.MONGODB_URI || "";
  if (!uri) {
    console.error("MONGODB_URI not set");
    process.exit(1);
  }
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not set");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB\n");

  const args = process.argv.slice(2);
  const allMode = args.includes("--all");
  const dryRun = args.includes("--dry-run");
  const skipExisting = args.includes("--skip-existing");
  const slugFilter = args.find((a) => !a.startsWith("--"))?.toLowerCase();
  const delayMs = Number(
    args.find((a) => a.startsWith("--delay-ms="))?.split("=")[1] || 8000,
  );

  if (!allMode && !slugFilter) {
    console.error(
      "Provide a slug filter or pass --all to process the entire provider catalog.",
    );
    process.exit(1);
  }

  const targets = slugFilter
    ? PROVIDERS.filter((p) => p.slug.includes(slugFilter))
    : PROVIDERS;

  console.log(
    `Processing ${targets.length} provider(s)...` +
    `${allMode ? " [all-mode]" : ""}` +
    `${skipExisting ? " [skip-existing ON]" : ""}` +
    `${dryRun ? " [dry-run]" : ""}\n`,
  );

  for (let i = 0; i < targets.length; i++) {
    const p = targets[i];

    if (skipExisting) {
      const existing = await Provider.findOne({ slug: p.slug }).lean();
      if (existing && hasIntentFields(existing)) {
        console.log(
          `[${i + 1}/${targets.length}] ${p.name} — already has full intent data, skipping.`,
        );
        continue;
      }
    }

    console.log(`[${i + 1}/${targets.length}] Analyzing ${p.name}...`);

    if (dryRun) {
      continue;
    }

    let analysis;
    try {
      analysis = await analyzeCompany(p.name);
    } catch (error) {
      if (error instanceof GeminiQuotaExceededError) {
        const retryAfter = error.retryAfterMs
          ? ` Retry after ~${Math.ceil(error.retryAfterMs / 1000)}s.`
          : "";
        console.error(`  [STOP] ${error.message}.${retryAfter}`);
        break;
      }
      throw error;
    }

    if (!analysis) {
      console.warn(`  [SKIP] Gemini returned null for ${p.name}`);
      continue;
    }

    await Provider.findOneAndUpdate(
      { slug: p.slug },
      {
        $set: {
          name: p.name,
          slug: p.slug,
          country: p.country,
          service: p.service,
          isActive: true,
          intentScore: analysis.intentScore,
          scoringFactors: analysis.scoringFactors,
          sentimentAnalysis: analysis.sentimentAnalysis,
        },
      },
      { upsert: true, new: true },
    );

    console.log(`  [OK] ${p.name} → ${analysis.intentScore}/10`);

    if (i < targets.length - 1 && delayMs > 0) {
      console.log(`  Waiting ${delayMs}ms (rate limit)...`);
      await delay(delayMs);
    }
  }

  await mongoose.disconnect();
  console.log("\nAll done.");
  console.log(
    "Tip: use --all for the full catalog, --skip-existing to resume, and --dry-run to preview targets.",
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
