import { Context } from 'hono';
import ListingRequest from '../models/ListingRequest';
import PurpleListing from '../models/PurpleListing';
import Provider from '../models/Provider';
import emailService from '../services/emailService';
import { logger } from '../utils/logger';

const buildProviderLookupVariants = (name: string, slug: string, website?: string) => {
    const normalizedName = name.trim().toLowerCase();
    const normalizedSlug = slug.trim().toLowerCase();
    const hostname = (() => {
        if (!website) return null;
        try {
            return new URL(website).hostname.replace(/^www\./, '').toLowerCase();
        } catch {
            return null;
        }
    })();

    const nameWithoutPunctuation = normalizedName.replace(/[^a-z0-9]+/g, '');
    const slugWithoutPunctuation = normalizedSlug.replace(/[^a-z0-9]+/g, '');

    return Array.from(
        new Set(
            [
                normalizedName,
                normalizedSlug,
                nameWithoutPunctuation,
                slugWithoutPunctuation,
                hostname,
                hostname?.replace(/\.[a-z.]+$/, ''),
            ].filter(Boolean)
        )
    );
};

const toComparableValue = (value: unknown) =>
    typeof value === 'string' ? value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '') : '';

const buildProviderIndexKeys = (provider: any) => {
    const providerSlug = typeof provider?.slug === 'string' ? provider.slug : '';
    const providerName = typeof provider?.name === 'string' ? provider.name : '';

    return Array.from(
        new Set(
            [providerSlug, providerName, toComparableValue(providerSlug), toComparableValue(providerName)].filter(Boolean)
        )
    );
};

const findBestProviderMatch = (listing: any, providers: any[]) => {
    const lookupValues = buildProviderLookupVariants(listing.name, listing.slug, listing.website);
    const comparableLookupValues = lookupValues.map((value) => toComparableValue(value)).filter(Boolean);

    for (const provider of providers) {
        const providerKeys = buildProviderIndexKeys(provider);

        if (
            providerKeys.some((key) => {
                const comparableKey = toComparableValue(key);
                return lookupValues.includes(String(key)) || comparableLookupValues.includes(comparableKey);
            })
        ) {
            return provider;
        }
    }

    return null;
};

const mergeListingWithProvider = (listing: any, provider: any | null) => {
    const listingObject = typeof listing.toObject === 'function' ? listing.toObject() : listing;
    const providerObject = provider && typeof provider.toObject === 'function' ? provider.toObject() : provider;

    if (!providerObject) {
        return {
            ...listingObject,
            intentScore: listingObject.intentScore,
            scoringFactors: listingObject.scoringFactors,
            sentimentAnalysis: listingObject.sentimentAnalysis,
        };
    }

    return {
        ...listingObject,
        intentScore: providerObject.intentScore ?? listingObject.intentScore,
        scoringFactors: providerObject.scoringFactors ?? listingObject.scoringFactors,
        sentimentAnalysis: providerObject.sentimentAnalysis ?? listingObject.sentimentAnalysis,
        providerId: providerObject._id,
        providerUpdatedAt: providerObject.updatedAt,
    };
};

class ListingController {
    /**
     * Submit a new listing request
     */
    async submitRequest(c: Context) {
        try {
            const body = await c.req.json();
            const authUser = c.get('user') as any;
            const {
                companyName,
                website,
                contactName,
                contactRole,
                contactPhone,
                email,
                serviceMatrix,
                answers,
            } = body;

            // Validate required fields
            if (!companyName || !website || !contactName || !contactRole || !email) {
                return c.json({ success: false, error: 'Missing required fields' }, 400);
            }

            // 1. Save to database
            const request = new ListingRequest({
                userId: authUser?.id,
                companyName,
                website,
                contactName,
                contactRole,
                contactPhone,
                email,
                serviceMatrix,
                answers,
                selectedPlan: body.selectedPlan || null,
            });

            await request.save();

            // 2. Send email notification to admin
            try {
                await emailService.sendListingRequestAdminNotification({
                    companyName: request.companyName,
                    website: request.website,
                    contactName: request.contactName,
                    contactRole: request.contactRole,
                    contactPhone: request.contactPhone || '',
                    email: request.email,
                    serviceMatrix: request.serviceMatrix.map(m => ({
                        countries: m.countries,
                        services: m.services
                    })),
                    answers: request.answers,
                    selectedPlan: request.selectedPlan || null,
                    submittedAt: request.submittedAt,
                });
            } catch (emailError) {
                logger.error('Failed to send admin notification for listing request', emailError);
                // We still consider the submission successful even if the email fails
            }

            return c.json({
                success: true,
                message: 'Listing request submitted successfully',
                data: { id: request._id }
            }, 201);
        } catch (error: any) {
            logger.error('Error submitting listing request:', error);
            return c.json({ success: false, error: 'Failed to submit listing request' }, 500);
        }
    }

    async getMyRequest(c: Context) {
        try {
            const authUser = c.get('user') as any;
            if (!authUser?.id) {
                return c.json({ success: false, error: 'Unauthorized' }, 401);
            }

            const request = await ListingRequest.findOne({ userId: authUser.id }).sort({ submittedAt: -1 });
            if (!request) {
                return c.json({ success: true, data: null });
            }

            return c.json({ success: true, data: request });
        } catch (error: any) {
            logger.error('Error fetching my listing request:', error);
            return c.json({ success: false, error: 'Failed to fetch listing request' }, 500);
        }
    }

    async updateMyRequestPlan(c: Context) {
        try {
            const authUser = c.get('user') as any;
            if (!authUser?.id) {
                return c.json({ success: false, error: 'Unauthorized' }, 401);
            }

            const body = await c.req.json();
            const selectedPlan = typeof body.selectedPlan === 'string' ? body.selectedPlan : null;
            if (!selectedPlan) {
                return c.json({ success: false, error: 'selectedPlan is required' }, 400);
            }

            const request = await ListingRequest.findOneAndUpdate(
                { userId: authUser.id },
                { $set: { selectedPlan } },
                { new: true, sort: { submittedAt: -1 } }
            );

            if (!request) {
                return c.json({ success: false, error: 'No listing request found' }, 404);
            }

            return c.json({ success: true, data: request });
        } catch (error: any) {
            logger.error('Error updating listing request plan:', error);
            return c.json({ success: false, error: 'Failed to update listing request plan' }, 500);
        }
    }

    async upsertMyRequest(c: Context) {
        try {
            const authUser = c.get('user') as any;
            if (!authUser?.id) {
                return c.json({ success: false, error: 'Unauthorized' }, 401);
            }

            const body = await c.req.json();
            const {
                companyName,
                website,
                contactName,
                contactRole,
                contactPhone,
                email,
                serviceMatrix,
                answers,
                selectedPlan,
            } = body;

            if (!companyName || !website || !contactName || !contactRole || !email) {
                return c.json({ success: false, error: 'Missing required fields' }, 400);
            }

            const request = await ListingRequest.findOneAndUpdate(
                { userId: authUser.id },
                {
                    $set: {
                        companyName,
                        website,
                        contactName,
                        contactRole,
                        contactPhone,
                        email,
                        serviceMatrix: Array.isArray(serviceMatrix) ? serviceMatrix : [],
                        answers: answers || {},
                        ...(typeof selectedPlan === 'string' ? { selectedPlan } : {}),
                        status: 'pending',
                    },
                    $setOnInsert: {
                        userId: authUser.id,
                        submittedAt: new Date(),
                    },
                },
                {
                    new: true,
                    upsert: true,
                }
            );

            try {
                await emailService.sendListingRequestAdminNotification({
                    companyName: request.companyName,
                    website: request.website,
                    contactName: request.contactName,
                    contactRole: request.contactRole,
                    contactPhone: request.contactPhone || '',
                    email: request.email,
                    serviceMatrix: (request.serviceMatrix || []).map((m: any) => ({
                        countries: m.countries || [],
                        services: m.services || [],
                    })),
                    answers: request.answers || {},
                    selectedPlan: request.selectedPlan || null,
                    submittedAt: request.submittedAt,
                });
            } catch (emailError) {
                logger.error('Failed to send admin notification for upserted listing request', emailError);
            }

            return c.json({ success: true, data: request });
        } catch (error: any) {
            logger.error('Error upserting listing request:', error);
            return c.json({ success: false, error: 'Failed to save listing request' }, 500);
        }
    }

    /**
     * Get all approved purple listings
     */
    async getPurpleListings(c: Context) {
        try {
            const page = Math.max(Number(c.req.query('page') || 1), 1);
            const limit = Math.min(Math.max(Number(c.req.query('limit') || 24), 1), 1000);
            const search = (c.req.query('search') || '').trim();
            const category = (c.req.query('category') || '').trim();
            const country = (c.req.query('country') || '').trim();
            const feature = (c.req.query('feature') || '').trim();
            const sortBy = (c.req.query('sortBy') || 'name').trim();

            const query: any = {};

            if (category) {
                query.categories = category;
            }

            if (country) {
                query.supportedCountries = country;
            }

            if (feature) {
                query.serviceFeatures = feature;
            }

            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { shortDescription: { $regex: search, $options: 'i' } },
                    { tags: { $elemMatch: { $regex: search, $options: 'i' } } },
                ];
            }

            const sort: Record<string, 1 | -1> =
                sortBy === 'rating'
                    ? { rating: -1, reviewCount: -1, name: 1 }
                    : sortBy === 'reviews'
                        ? { reviewCount: -1, rating: -1, name: 1 }
                        : { name: 1 };

            const [listings, total] = await Promise.all([
                PurpleListing.find(query)
                    .sort(sort)
                    .skip((page - 1) * limit)
                    .limit(limit),
                PurpleListing.countDocuments(query),
            ]);

            const providerLookupValues = Array.from(
                new Set(
                    listings.flatMap((listing) => buildProviderLookupVariants(listing.name, listing.slug, listing.website))
                )
            );

            const providers = providerLookupValues.length
                ? await Provider.find(
                    {
                        $or: [
                            { slug: { $in: providerLookupValues } },
                            { name: { $in: providerLookupValues } },
                        ],
                    },
                    {
                        slug: 1,
                        name: 1,
                        intentScore: 1,
                        scoringFactors: 1,
                        sentimentAnalysis: 1,
                        updatedAt: 1,
                    }
                ).lean()
                : [];

            return c.json({
                success: true,
                count: listings.length,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNextPage: page * limit < total,
                    hasPreviousPage: page > 1,
                },
                filters: {
                    search,
                    category,
                    country,
                    feature,
                    sortBy,
                },
                data: listings.map((listing) => mergeListingWithProvider(listing, findBestProviderMatch(listing, providers))),
            });
        } catch (error: any) {
            logger.error('Error fetching purple listings:', error);
            return c.json({ success: false, error: 'Failed to fetch listings' }, 500);
        }
    }

    async getPurpleListingMeta(c: Context) {
        try {
            const [categoryCounts, countryValues, featureValues, total] = await Promise.all([
                PurpleListing.aggregate([
                    { $unwind: '$categories' },
                    { $group: { _id: '$categories', companyCount: { $sum: 1 } } },
                    { $sort: { _id: 1 } },
                ]),
                PurpleListing.distinct('supportedCountries'),
                PurpleListing.distinct('serviceFeatures'),
                PurpleListing.countDocuments({}),
            ]);

            return c.json({
                success: true,
                data: {
                    total,
                    categories: categoryCounts.map((item) => ({
                        slug: item._id,
                        companyCount: item.companyCount,
                    })),
                    countries: countryValues.filter(Boolean).sort(),
                    features: featureValues.filter(Boolean).sort(),
                },
            });
        } catch (error: any) {
            logger.error('Error fetching purple listing metadata:', error);
            return c.json({ success: false, error: 'Failed to fetch listing metadata' }, 500);
        }
    }

    /**
     * Get a single purple listing by slug
     */
    async getPurpleListingBySlug(c: Context) {
        try {
            const { slug } = c.req.param();
            const listing = await PurpleListing.findOne({ slug });

            if (!listing) {
                return c.json({ success: false, error: 'Listing not found' }, 404);
            }

            const lookupValues = buildProviderLookupVariants(listing.name, listing.slug, listing.website);
            const providers = await Provider.find(
                {
                    $or: [
                        { slug: { $in: lookupValues } },
                        { name: { $in: [listing.name, listing.slug] } },
                    ],
                },
                {
                    slug: 1,
                    name: 1,
                    intentScore: 1,
                    scoringFactors: 1,
                    sentimentAnalysis: 1,
                    updatedAt: 1,
                }
            ).lean();

            const matchedProvider = findBestProviderMatch(listing, providers);

            return c.json({ success: true, data: mergeListingWithProvider(listing, matchedProvider) });
        } catch (error: any) {
            logger.error('Error fetching purple listing:', error);
            return c.json({ success: false, error: 'Failed to fetch listing' }, 500);
        }
    }

    /**
     * Temporary endpoint to seed purple listings from the frontend mock data
     */
    async seedPurpleListings(c: Context) {
        try {
            const body = await c.req.json();
            const listings = body.listings || [];

            if (!Array.isArray(listings) || listings.length === 0) {
                return c.json({ success: false, error: 'Expected an array of listings in the request body' }, 400);
            }

            // Delete existing to prevent duplicates during testing
            await PurpleListing.deleteMany({});

            const inserted = await PurpleListing.insertMany(listings);

            return c.json({
                success: true,
                message: 'Listings seeded successfully',
                count: inserted.length
            });
        } catch (error: any) {
            logger.error('Error seeding purple listings:', error);
            return c.json({ success: false, error: error.message }, 500);
        }
    }
}

export const listingController = new ListingController();
