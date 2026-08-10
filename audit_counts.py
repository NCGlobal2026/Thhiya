from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]

files = [
    root / "frontend/src/features/purple-listings/data/companies.ts",
    root / "frontend/src/constants/initialCountryData.ts",
]

for file in files:
    if not file.exists():
        print(f"{file}: missing")
        continue
    text = file.read_text(encoding="utf-8")
    company_names = re.findall(r"\bname:\s*['\"]", text)
    slugs = re.findall(r"\bslug:\s*['\"]", text)
    print(f"{file.relative_to(root)} -> name entries: {len(company_names)}, slug entries: {len(slugs)}")

provider_catalog = root / "backend/src/constants/providerCatalog.ts"
if provider_catalog.exists():
    text = provider_catalog.read_text(encoding="utf-8")
    catalog_names = re.findall(r"\{\s*name:\s*['\"]", text)
    print(f"{provider_catalog.relative_to(root)} -> provider catalog entries: {len(catalog_names)}")
else:
    print("backend/src/constants/providerCatalog.ts: missing")

provider_model = root / "backend/src/models/Provider.ts"
print(f"provider model exists: {provider_model.exists()}")
