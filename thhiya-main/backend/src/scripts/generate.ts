
import fs from 'fs';
import path from 'path';
import { TOP_13_SERVICES } from '../constants/canonicalServices.ts';

const TRACKER_PATH = path.join(process.cwd(), 'backend/data/seed/countries/COUNTRY_BATCH_TRACKER.md');
const PROCESSED_DIR = path.join(process.cwd(), 'backend/data/seed/countries/processed');

// Comprehensive Map of Country Name -> ISO Code & Slug
// This list maps the names found in the tracker to their codes/slugs.
const COUNTRY_MAP: Record<string, { code: string; slug: string; region: string }> = {
    // A
    "Afghanistan": { code: "AF", slug: "afghanistan", region: "Asia" },
    "Albania": { code: "AL", slug: "albania", region: "Europe" },
    "Algeria": { code: "DZ", slug: "algeria", region: "Africa" },
    "Andorra": { code: "AD", slug: "andorra", region: "Europe" },
    "Angola": { code: "AO", slug: "angola", region: "Africa" },
    "Antigua and Barbuda": { code: "AG", slug: "antigua-and-barbuda", region: "Americas" },
    "Argentina": { code: "AR", slug: "argentina", region: "Americas" },
    "Armenia": { code: "AM", slug: "armenia", region: "Asia" },
    "Australia": { code: "AU", slug: "australia", region: "Oceania" },
    "Austria": { code: "AT", slug: "austria", region: "Europe" },
    "Azerbaijan": { code: "AZ", slug: "azerbaijan", region: "Asia" },
    // B
    "Bahamas": { code: "BS", slug: "bahamas", region: "Americas" },
    "Bahrain": { code: "BH", slug: "bahrain", region: "Asia" },
    "Bangladesh": { code: "BD", slug: "bangladesh", region: "Asia" },
    "Barbados": { code: "BB", slug: "barbados", region: "Americas" },
    "Belarus": { code: "BY", slug: "belarus", region: "Europe" },
    "Belgium": { code: "BE", slug: "belgium", region: "Europe" },
    "Belize": { code: "BZ", slug: "belize", region: "Americas" },
    "Benin": { code: "BJ", slug: "benin", region: "Africa" },
    "Bhutan": { code: "BT", slug: "bhutan", region: "Asia" },
    "Bolivia": { code: "BO", slug: "bolivia", region: "Americas" },
    "Bosnia and Herzegovina": { code: "BA", slug: "bosnia-and-herzegovina", region: "Europe" },
    "Botswana": { code: "BW", slug: "botswana", region: "Africa" },
    "Brazil": { code: "BR", slug: "brazil", region: "Americas" },
    "Brunei": { code: "BN", slug: "brunei", region: "Asia" },
    "Bulgaria": { code: "BG", slug: "bulgaria", region: "Europe" },
    "Burkina Faso": { code: "BF", slug: "burkina-faso", region: "Africa" },
    "Burundi": { code: "BI", slug: "burundi", region: "Africa" },
    // C
    "Cabo Verde": { code: "CV", slug: "cabo-verde", region: "Africa" },
    "Cambodia": { code: "KH", slug: "cambodia", region: "Asia" },
    "Cameroon": { code: "CM", slug: "cameroon", region: "Africa" },
    "Canada": { code: "CA", slug: "canada", region: "Americas" },
    "Central African Republic": { code: "CF", slug: "central-african-republic", region: "Africa" },
    "Chad": { code: "TD", slug: "chad", region: "Africa" },
    "Chile": { code: "CL", slug: "chile", region: "Americas" },
    "China": { code: "CN", slug: "china", region: "Asia" },
    "Colombia": { code: "CO", slug: "colombia", region: "Americas" },
    "Comoros": { code: "KM", slug: "comoros", region: "Africa" },
    "Costa Rica": { code: "CR", slug: "costa-rica", region: "Americas" },
    "Croatia": { code: "HR", slug: "croatia", region: "Europe" },
    "Cuba": { code: "CU", slug: "cuba", region: "Americas" },
    "Cyprus": { code: "CY", slug: "cyprus", region: "Europe" },
    "Czech Republic": { code: "CZ", slug: "czech-republic", region: "Europe" },
    "Cote d'Ivoire": { code: "CI", slug: "cote-divoire", region: "Africa" },
    // D
    "Democratic Republic of the Congo": { code: "CD", slug: "democratic-republic-of-the-congo", region: "Africa" },
    "Denmark": { code: "DK", slug: "denmark", region: "Europe" },
    "Djibouti": { code: "DJ", slug: "djibouti", region: "Africa" },
    "Dominica": { code: "DM", slug: "dominica", region: "Americas" },
    "Dominican Republic": { code: "DO", slug: "dominican-republic", region: "Americas" },
    // E
    "Ecuador": { code: "EC", slug: "ecuador", region: "Americas" },
    "Egypt": { code: "EG", slug: "egypt", region: "Africa" },
    "El Salvador": { code: "SV", slug: "el-salvador", region: "Americas" },
    "Equatorial Guinea": { code: "GQ", slug: "equatorial-guinea", region: "Africa" },
    "Eritrea": { code: "ER", slug: "eritrea", region: "Africa" },
    "Estonia": { code: "EE", slug: "estonia", region: "Europe" },
    "Eswatini": { code: "SZ", slug: "eswatini", region: "Africa" },
    "Ethiopia": { code: "ET", slug: "ethiopia", region: "Africa" },
    // F
    "Fiji": { code: "FJ", slug: "fiji", region: "Oceania" },
    "Finland": { code: "FI", slug: "finland", region: "Europe" },
    "France": { code: "FR", slug: "france", region: "Europe" },
    // G
    "Gabon": { code: "GA", slug: "gabon", region: "Africa" },
    "Gambia": { code: "GM", slug: "gambia", region: "Africa" },
    "Georgia": { code: "GE", slug: "georgia", region: "Asia" },
    "Germany": { code: "DE", slug: "germany", region: "Europe" },
    "Ghana": { code: "GH", slug: "ghana", region: "Africa" },
    "Greece": { code: "GR", slug: "greece", region: "Europe" },
    "Grenada": { code: "GD", slug: "grenada", region: "Americas" },
    "Guatemala": { code: "GT", slug: "guatemala", region: "Americas" },
    "Guinea": { code: "GN", slug: "guinea", region: "Africa" },
    "Guinea-Bissau": { code: "GW", slug: "guinea-bissau", region: "Africa" },
    "Guyana": { code: "GY", slug: "guyana", region: "Americas" },
    // H
    "Haiti": { code: "HT", slug: "haiti", region: "Americas" },
    "Honduras": { code: "HN", slug: "honduras", region: "Americas" },
    "Hungary": { code: "HU", slug: "hungary", region: "Europe" },
    // I
    "Iceland": { code: "IS", slug: "iceland", region: "Europe" },
    "India": { code: "IN", slug: "india", region: "Asia" },
    "Indonesia": { code: "ID", slug: "indonesia", region: "Asia" },
    "Iran": { code: "IR", slug: "iran", region: "Asia" },
    "Iraq": { code: "IQ", slug: "iraq", region: "Asia" },
    "Ireland": { code: "IE", slug: "ireland", region: "Europe" },
    "Israel": { code: "IL", slug: "israel", region: "Asia" },
    "Italy": { code: "IT", slug: "italy", region: "Europe" },
    // J
    "Jamaica": { code: "JM", slug: "jamaica", region: "Americas" },
    "Japan": { code: "JP", slug: "japan", region: "Asia" },
    "Jordan": { code: "JO", slug: "jordan", region: "Asia" },
    // K
    "Kazakhstan": { code: "KZ", slug: "kazakhstan", region: "Asia" },
    "Kenya": { code: "KE", slug: "kenya", region: "Africa" },
    "Kiribati": { code: "KI", slug: "kiribati", region: "Oceania" },
    "Kuwait": { code: "KW", slug: "kuwait", region: "Asia" },
    "Kyrgyzstan": { code: "KG", slug: "kyrgyzstan", region: "Asia" },
    // L
    "Laos": { code: "LA", slug: "laos", region: "Asia" },
    "Latvia": { code: "LV", slug: "latvia", region: "Europe" },
    "Lebanon": { code: "LB", slug: "lebanon", region: "Asia" },
    "Lesotho": { code: "LS", slug: "lesotho", region: "Africa" },
    "Liberia": { code: "LR", slug: "liberia", region: "Africa" },
    "Libya": { code: "LY", slug: "libya", region: "Africa" },
    "Liechtenstein": { code: "LI", slug: "liechtenstein", region: "Europe" },
    "Lithuania": { code: "LT", slug: "lithuania", region: "Europe" },
    "Luxembourg": { code: "LU", slug: "luxembourg", region: "Europe" },
    // M
    "Madagascar": { code: "MG", slug: "madagascar", region: "Africa" },
    "Malawi": { code: "MW", slug: "malawi", region: "Africa" },
    "Malaysia": { code: "MY", slug: "malaysia", region: "Asia" },
    "Maldives": { code: "MV", slug: "maldives", region: "Asia" },
    "Mali": { code: "ML", slug: "mali", region: "Africa" },
    "Malta": { code: "MT", slug: "malta", region: "Europe" },
    "Marshall Islands": { code: "MH", slug: "marshall-islands", region: "Oceania" },
    "Mauritania": { code: "MR", slug: "mauritania", region: "Africa" },
    "Mauritius": { code: "MU", slug: "mauritius", region: "Africa" },
    "Mexico": { code: "MX", slug: "mexico", region: "Americas" },
    "Micronesia": { code: "FM", slug: "micronesia", region: "Oceania" },
    "Moldova": { code: "MD", slug: "moldova", region: "Europe" },
    "Monaco": { code: "MC", slug: "monaco", region: "Europe" },
    "Mongolia": { code: "MN", slug: "mongolia", region: "Asia" },
    "Montenegro": { code: "ME", slug: "montenegro", region: "Europe" },
    "Morocco": { code: "MA", slug: "morocco", region: "Africa" },
    "Mozambique": { code: "MZ", slug: "mozambique", region: "Africa" },
    "Myanmar": { code: "MM", slug: "myanmar", region: "Asia" },
    // N
    "Namibia": { code: "NA", slug: "namibia", region: "Africa" },
    "Nauru": { code: "NR", slug: "nauru", region: "Oceania" },
    "Nepal": { code: "NP", slug: "nepal", region: "Asia" },
    "Netherlands": { code: "NL", slug: "netherlands", region: "Europe" },
    "New Zealand": { code: "NZ", slug: "new-zealand", region: "Oceania" },
    "Nicaragua": { code: "NI", slug: "nicaragua", region: "Americas" },
    "Niger": { code: "NE", slug: "niger", region: "Africa" },
    "Nigeria": { code: "NG", slug: "nigeria", region: "Africa" },
    "North Korea": { code: "KP", slug: "north-korea", region: "Asia" },
    "North Macedonia": { code: "MK", slug: "north-macedonia", region: "Europe" },
    "Norway": { code: "NO", slug: "norway", region: "Europe" },
    // O
    "Oman": { code: "OM", slug: "oman", region: "Asia" },
    // P
    "Pakistan": { code: "PK", slug: "pakistan", region: "Asia" },
    "Palau": { code: "PW", slug: "palau", region: "Oceania" },
    "Panama": { code: "PA", slug: "panama", region: "Americas" },
    "Papua New Guinea": { code: "PG", slug: "papua-new-guinea", region: "Oceania" },
    "Paraguay": { code: "PY", slug: "paraguay", region: "Americas" },
    "Peru": { code: "PE", slug: "peru", region: "Americas" },
    "Philippines": { code: "PH", slug: "philippines", region: "Asia" },
    "Poland": { code: "PL", slug: "poland", region: "Europe" },
    "Portugal": { code: "PT", slug: "portugal", region: "Europe" },
    // Q
    "Qatar": { code: "QA", slug: "qatar", region: "Asia" },
    // R
    "Republic of the Congo": { code: "CG", slug: "republic-of-the-congo", region: "Africa" },
    "Romania": { code: "RO", slug: "romania", region: "Europe" },
    "Russia": { code: "RU", slug: "russia", region: "Europe" },
    "Rwanda": { code: "RW", slug: "rwanda", region: "Africa" },
    // S
    "Saint Kitts and Nevis": { code: "KN", slug: "saint-kitts-and-nevis", region: "Americas" },
    "Saint Lucia": { code: "LC", slug: "saint-lucia", region: "Americas" },
    "Saint Vincent and the Grenadines": { code: "VC", slug: "saint-vincent-and-the-grenadines", region: "Americas" },
    "Samoa": { code: "WS", slug: "samoa", region: "Oceania" },
    "San Marino": { code: "SM", slug: "san-marino", region: "Europe" },
    "Sao Tome and Principe": { code: "ST", slug: "sao-tome-and-principe", region: "Africa" },
    "Saudi Arabia": { code: "SA", slug: "saudi-arabia", region: "Asia" },
    "Senegal": { code: "SN", slug: "senegal", region: "Africa" },
    "Serbia": { code: "RS", slug: "serbia", region: "Europe" },
    "Seychelles": { code: "SC", slug: "seychelles", region: "Africa" },
    "Sierra Leone": { code: "SL", slug: "sierra-leone", region: "Africa" },
    "Singapore": { code: "SG", slug: "singapore", region: "Asia" },
    "Slovakia": { code: "SK", slug: "slovakia", region: "Europe" },
    "Slovenia": { code: "SI", slug: "slovenia", region: "Europe" },
    "Solomon Islands": { code: "SB", slug: "solomon-islands", region: "Oceania" },
    "Somalia": { code: "SO", slug: "somalia", region: "Africa" },
    "South Africa": { code: "ZA", slug: "south-africa", region: "Africa" },
    "South Korea": { code: "KR", slug: "south-korea", region: "Asia" },
    "South Sudan": { code: "SS", slug: "south-sudan", region: "Africa" },
    "Spain": { code: "ES", slug: "spain", region: "Europe" },
    "Sri Lanka": { code: "LK", slug: "sri-lanka", region: "Asia" },
    "State of Palestine": { code: "PS", slug: "state-of-palestine", region: "Asia" },
    "Sudan": { code: "SD", slug: "sudan", region: "Africa" },
    "Suriname": { code: "SR", slug: "suriname", region: "Americas" },
    "Sweden": { code: "SE", slug: "sweden", region: "Europe" },
    "Switzerland": { code: "CH", slug: "switzerland", region: "Europe" },
    "Syria": { code: "SY", slug: "syria", region: "Asia" },
    // T
    "Tajikistan": { code: "TJ", slug: "tajikistan", region: "Asia" },
    "Tanzania": { code: "TZ", slug: "tanzania", region: "Africa" },
    "Thailand": { code: "TH", slug: "thailand", region: "Asia" },
    "Timor-Leste": { code: "TL", slug: "timor-leste", region: "Asia" },
    "Togo": { code: "TG", slug: "togo", region: "Africa" },
    "Tonga": { code: "TO", slug: "tonga", region: "Oceania" },
    "Trinidad and Tobago": { code: "TT", slug: "trinidad-and-tobago", region: "Americas" },
    "Tunisia": { code: "TN", slug: "tunisia", region: "Africa" },
    "Turkey": { code: "TR", slug: "turkey", region: "Asia" },
    "Turkmenistan": { code: "TM", slug: "turkmenistan", region: "Asia" },
    "Tuvalu": { code: "TV", slug: "tuvalu", region: "Oceania" },
    // U
    "Uganda": { code: "UG", slug: "uganda", region: "Africa" },
    "Ukraine": { code: "UA", slug: "ukraine", region: "Europe" },
    "United Arab Emirates": { code: "AE", slug: "united-arab-emirates", region: "Asia" },
    "United Kingdom": { code: "GB", slug: "united-kingdom", region: "Europe" },
    "United States of America": { code: "US", slug: "united-states", region: "Americas" },
    "Uruguay": { code: "UY", slug: "uruguay", region: "Americas" },
    "Uzbekistan": { code: "UZ", slug: "uzbekistan", region: "Asia" },
    // V
    "Vanuatu": { code: "VU", slug: "vanuatu", region: "Oceania" },
    "Vatican City": { code: "VA", slug: "vatican-city", region: "Europe" },
    "Venezuela": { code: "VE", slug: "venezuela", region: "Americas" },
    "Vietnam": { code: "VN", slug: "vietnam", region: "Asia" },
    // Y
    "Yemen": { code: "YE", slug: "yemen", region: "Asia" },
    // Z
    "Zambia": { code: "ZM", slug: "zambia", region: "Africa" },
    "Zimbabwe": { code: "ZW", slug: "zimbabwe", region: "Africa" }
};

async function main() {
    console.log(`Starting global base seeding...`);
    console.log(`Checking against ${Object.keys(COUNTRY_MAP).length} countries in map.`);

    // Read tracker to ensure we are covering the expected list
    const trackerContent = fs.readFileSync(TRACKER_PATH, 'utf-8');
    const tableRegex = /\|\s*([a-zA-Z\s\(\)]+)\s*\|\s*(\d)\s*\|\s*([A-Z_]+)\s*\|/g;

    let match;
    let counts = {
        created: 0,
        skipped: 0,
        missingInMap: 0
    };

    const countriesInTracker: string[] = [];

    // Extract all countries from tracker
    while ((match = tableRegex.exec(trackerContent)) !== null) {
        let countryName = match[1].trim();
        countriesInTracker.push(countryName);
    }

    console.log(`Found ${countriesInTracker.length} countries in tracker.`);

    for (const countryName of countriesInTracker) {
        // Handle nice-to-have cleanups or adjustments if map keys vary slightly
        const mapData = COUNTRY_MAP[countryName];

        if (!mapData) {
            console.error(`[ERROR] Metadata missing for: "${countryName}". Skipping.`);
            counts.missingInMap++;
            continue;
        }

        const fileName = `${mapData.slug}.json`;
        const filePath = path.join(PROCESSED_DIR, fileName);

        if (fs.existsSync(filePath)) {
            // console.log(`[SKIP] Exists: ${fileName}`);
            counts.skipped++;
            continue;
        }

        // Create Base JSON
        const baseJson = {
            name: countryName,
            code: mapData.code,
            slug: mapData.slug,
            flag: `https://flagcdn.com/w160/${mapData.code.toLowerCase()}.png`,
            region: mapData.region,
            languages: ["TBD"],
            services: TOP_13_SERVICES.map(slug => ({
                serviceSlug: slug,
                slug: slug, // Frontend filter slug
                service: getServiceName(slug),
                name: getServiceName(slug),
                serviceName: getServiceName(slug),
                heroData: {
                    title: `${getServiceName(slug)} in ${countryName}`,
                    subtitle: `Comprehensive guide to ${getServiceName(slug)} in ${countryName}`,
                    description: `Detailed insights and providers for ${getServiceName(slug)} in ${countryName}.`,
                    bestFor: "Global expansion teams",
                    icon: slug
                },
                sections: [] // Empty sections initially
            }))
        };

        fs.writeFileSync(filePath, JSON.stringify(baseJson, null, 4));
        console.log(`[CREATE] Generated: ${fileName}`);
        counts.created++;
    }

    console.log(`\n============================`);
    console.log(`SUMMARY`);
    console.log(`Total Tracker Entries: ${countriesInTracker.length}`);
    console.log(`Created: ${counts.created}`);
    console.log(`Skipped (Exists): ${counts.skipped}`);
    console.log(`Missing Data: ${counts.missingInMap}`);
    console.log(`============================\n`);
}

function getServiceName(slug: string): string {
    const map: Record<string, string> = {
        'eor-peo': 'EOR & PEO',
        'global-payroll': 'Global Payroll',
        'incorporation-entity-setup': 'Incorporation',
        'staffing-talent-acquisition': 'Staffing',
        'hris': 'HRIS',
        'accounting': 'Accounting',
        'tax': 'Tax',
        'compliance': 'Compliance',
        'msa': 'MSA & Legal',
        'software-solutions': 'Software',
        'marketing-agencies': 'Marketing',
        'payroll-calculator': 'Payroll Calculator'
    };
    return map[slug] || slug;
}

main().catch(console.error);
