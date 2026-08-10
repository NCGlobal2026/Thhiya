export interface Company {
    id: string;
    slug: string;
    name: string;
    logo: string;
    shortDescription: string;
    fullDescription: string;
    rating: number;
    reviewCount: number;
    categories: string[]; // Category slugs
    tags: string[];
    foundedYear: number;
    headquarters: string;
    website: string;
    pricing: {
        startingAt: string;
        model: string;
        freeTrial: boolean;
    };
    features: string[];
    pros: string[];
    cons: string[];
    screenshots?: string[];
    featured?: boolean;
    verifiedAt?: string;
    supportedCountries: string[]; // e.g. ["US", "UK", "IN", "Global"]
    serviceFeatures: string[];    // Granular services for filtering
    intentScore?: number;
    scoringFactors?: {
        marketMomentum: string;
        userSentiment: string;
        featureInnovation: string;
        transparency: string;
    };
    sentimentAnalysis?: {
        positiveReviews: string[];
        negativeReviews: string[];
        lastUpdated: Date;
    };
}
