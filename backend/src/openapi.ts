export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Thhiya API',
    version: '2.0.0',
    description: 'Public and authenticated API endpoints for the Thhiya platform.',
    contact: {
      name: 'Thhiya Engineering',
      email: 'engineering@thhiya.com',
    },
  },
  servers: [
    { url: '/', description: 'Current environment' },
    { url: 'http://localhost:3000', description: 'Local development' },
  ],
  tags: [
    { name: 'health', description: 'Service health and runtime metadata' },
    { name: 'auth', description: 'Authentication and OTP verification flows' },
    { name: 'listings', description: 'Vendor listing request and plan management' },
    { name: 'insights', description: 'Insights and metadata endpoints' },
    { name: 'countries', description: 'Country catalog endpoints' },
    { name: 'services', description: 'Service catalog endpoints' },
    { name: 'providers', description: 'Provider discovery and matching' },
    { name: 'country-services', description: 'Country-service detail endpoints' },
    { name: 'bant', description: 'Lead qualification form and submission management' },
    { name: 'contact', description: 'Contact form and submissions' },
    { name: 'blogs', description: 'Blog and content endpoints' },
    { name: 'email-tracking', description: 'Email open/click tracking and reporting' },
    { name: 'docs', description: 'API documentation and spec endpoints' },
  ],
  paths: {
    '/': {
      get: {
        tags: ['health'],
        summary: 'Root health payload',
        responses: {
          '200': {
            description: 'Root service health payload',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RootStatusResponse' },
              },
            },
          },
        },
      },
    },
    '/health': {
      get: {
        tags: ['health'],
        summary: 'Detailed health check',
        responses: {
          '200': {
            description: 'Service health payload with uptime',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
        },
      },
    },
    '/metrics': {
      get: {
        tags: ['health'],
        summary: 'Prometheus metrics payload',
        responses: {
          '200': {
            description: 'Prometheus text format metrics',
            content: {
              'text/plain': {
                schema: { type: 'string' },
              },
            },
          },
        },
      },
    },
    '/openapi.json': {
      get: {
        tags: ['docs'],
        summary: 'OpenAPI JSON spec',
        responses: {
          '200': {
            description: 'OpenAPI document',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/docs': {
      get: {
        tags: ['docs'],
        summary: 'Scalar API reference UI',
        responses: {
          '200': {
            description: 'HTML documentation UI',
            content: {
              'text/html': {
                schema: { type: 'string' },
              },
            },
          },
        },
      },
    },
    '/api/auth/signup-vendor/request-otp': {
      post: {
        tags: ['auth'],
        summary: 'Request signup OTP for vendor onboarding',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SignupVendorRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'OTP sent successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GenericSuccessResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '409': { $ref: '#/components/responses/Conflict' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/auth/signup-vendor/verify-otp': {
      post: {
        tags: ['auth'],
        summary: 'Verify vendor signup OTP and create account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OtpVerifyRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Authenticated session payload',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthSuccessResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '409': { $ref: '#/components/responses/Conflict' },
          '429': { $ref: '#/components/responses/RateLimited' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/auth/login/request-otp': {
      post: {
        tags: ['auth'],
        summary: 'Request login OTP with email/password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'OTP sent successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GenericSuccessResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/auth/login/verify-otp': {
      post: {
        tags: ['auth'],
        summary: 'Verify login OTP and issue auth session',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OtpVerifyRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Authenticated session payload',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthSuccessResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/RateLimited' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/auth/resend-otp': {
      post: {
        tags: ['auth'],
        summary: 'Resend active OTP for signup/login session',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ResendOtpRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'OTP resent successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GenericSuccessResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['auth'],
        summary: 'Clear auth session cookie',
        responses: {
          '200': {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GenericSuccessResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['auth'],
        summary: 'Get current auth session user',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Authenticated user payload',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthMeResponse' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/listings/request': {
      post: {
        tags: ['listings'],
        summary: 'Submit a listing request for the current user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ListingRequestPayload' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Listing request submitted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ListingCreatedResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/listings/my-request': {
      get: {
        tags: ['listings'],
        summary: 'Get current user listing request',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Listing request payload',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ListingGetResponse' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
      put: {
        tags: ['listings'],
        summary: 'Create or update current user listing request',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ListingRequestPayload' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Listing request upserted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ListingGetResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/listings/my-request/plan': {
      patch: {
        tags: ['listings'],
        summary: 'Update selected plan for current user listing request',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['selectedPlan'],
                properties: {
                  selectedPlan: { type: 'string', minLength: 1 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Plan updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ListingGetResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/listings/purple': {
      get: {
        tags: ['listings'],
        summary: 'Get public purple listings',
        responses: {
          '200': {
            description: 'Public purple listing collection',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    count: { type: 'number' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/PurpleListing' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/listings/purple/{slug}': {
      get: {
        tags: ['listings'],
        summary: 'Get single purple listing by slug',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Purple listing payload',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/PurpleListing' },
                  },
                },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/listings/seed-purple': {
      post: {
        tags: ['listings'],
        summary: 'Seed purple listings (internal/testing endpoint)',
        description: 'Use only for test/dev seeding. Keep protected in production deployments.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['listings'],
                properties: {
                  listings: {
                    type: 'array',
                    items: { type: 'object', additionalProperties: true },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Listings seeded response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    count: { type: 'number' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/insights': {
      get: {
        tags: ['insights'],
        summary: 'Get insights with optional query filters',
        responses: {
          '200': {
            description: 'Insight collection response',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/insights/all': {
      get: {
        tags: ['insights'],
        summary: 'Get all insights (legacy alias)',
        responses: {
          '200': {
            description: 'All insights response',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/insights/metadata': {
      get: {
        tags: ['insights'],
        summary: 'Get insights metadata for dropdowns',
        responses: {
          '200': {
            description: 'Insight metadata payload',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/insights/countries': {
      get: {
        tags: ['insights'],
        summary: 'Get countries by service query',
        responses: {
          '200': {
            description: 'Countries by service',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/insights/countries/by-service/{service}': {
      get: {
        tags: ['insights'],
        summary: 'Get countries for a specific service',
        parameters: [
          {
            name: 'service',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Countries list',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/insights/service/{service}': {
      get: {
        tags: ['insights'],
        summary: 'Get insights by service',
        parameters: [
          {
            name: 'service',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Insights by service',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/insights/country/{country}': {
      get: {
        tags: ['insights'],
        summary: 'Get insights by country',
        parameters: [
          {
            name: 'country',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Insights by country',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/insights/pair/{service}/{country}': {
      get: {
        tags: ['insights'],
        summary: 'Get insight for a service-country pair',
        parameters: [
          {
            name: 'service',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'country',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Insight pair response',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/countries': {
      get: {
        tags: ['countries'],
        summary: 'Get all countries',
        responses: {
          '200': {
            description: 'Countries list',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
      post: {
        tags: ['countries'],
        summary: 'Create country (admin/private)',
        responses: {
          '200': {
            description: 'Country created',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/countries/{code}': {
      get: {
        tags: ['countries'],
        summary: 'Get country by code',
        parameters: [
          {
            name: 'code',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Country payload',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/services': {
      get: {
        tags: ['services'],
        summary: 'Get all services',
        responses: {
          '200': {
            description: 'Services list',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
      post: {
        tags: ['services'],
        summary: 'Create service (admin/private)',
        responses: {
          '200': {
            description: 'Service created',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/services/category/{category}': {
      get: {
        tags: ['services'],
        summary: 'Get services by category',
        parameters: [
          {
            name: 'category',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Services by category',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/services/{slug}': {
      get: {
        tags: ['services'],
        summary: 'Get service by slug',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Service payload',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/providers': {
      get: {
        tags: ['providers'],
        summary: 'Get all providers',
        responses: {
          '200': {
            description: 'Providers list',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/providers/service/{service}': {
      get: {
        tags: ['providers'],
        summary: 'Get providers by service',
        parameters: [
          {
            name: 'service',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Providers by service',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/providers/country/{country}': {
      get: {
        tags: ['providers'],
        summary: 'Get providers by country',
        parameters: [
          {
            name: 'country',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Providers by country',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/providers/match': {
      get: {
        tags: ['providers'],
        summary: 'Search/match providers',
        responses: {
          '200': {
            description: 'Provider match response',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/providers/slug/{slug}': {
      get: {
        tags: ['providers'],
        summary: 'Get provider by slug',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Provider payload',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/country-services': {
      get: {
        tags: ['country-services'],
        summary: 'Get all country-service combinations',
        responses: {
          '200': {
            description: 'Country-services list',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/country-services/metadata': {
      get: {
        tags: ['country-services'],
        summary: 'Get country-service metadata',
        responses: {
          '200': {
            description: 'Country-services metadata',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/country-services/regions': {
      get: {
        tags: ['country-services'],
        summary: 'Get country regions',
        responses: {
          '200': {
            description: 'Regions payload',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/country-services/service/{serviceSlug}': {
      get: {
        tags: ['country-services'],
        summary: 'Get countries by service slug',
        parameters: [
          {
            name: 'serviceSlug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Countries by service slug',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/country-services/{country}': {
      get: {
        tags: ['country-services'],
        summary: 'Get services by country',
        parameters: [
          {
            name: 'country',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Services by country',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/country-services/{country}/{service}': {
      get: {
        tags: ['country-services'],
        summary: 'Get country-service details',
        parameters: [
          {
            name: 'country',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'service',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Country-service detail payload',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/bant/options': {
      get: {
        tags: ['bant'],
        summary: 'Get BANT form options/metadata',
        responses: {
          '200': {
            description: 'BANT options payload',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/bant/submit': {
      post: {
        tags: ['bant'],
        summary: 'Submit BANT form',
        responses: {
          '201': {
            description: 'BANT submission accepted',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '429': { $ref: '#/components/responses/RateLimited' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/bant/submissions': {
      get: {
        tags: ['bant'],
        summary: 'Get BANT submissions (admin/private)',
        responses: {
          '200': {
            description: 'BANT submissions list',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/bant/submissions/stats': {
      get: {
        tags: ['bant'],
        summary: 'Get BANT submission statistics (admin/private)',
        responses: {
          '200': {
            description: 'BANT stats payload',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/bant/submissions/{id}': {
      get: {
        tags: ['bant'],
        summary: 'Get BANT submission by ID (admin/private)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'BANT submission payload',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['bant'],
        summary: 'Update BANT submission (admin/private)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'BANT submission updated',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
      delete: {
        tags: ['bant'],
        summary: 'Delete BANT submission (admin/private)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'BANT submission deleted',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/contact/options': {
      get: {
        tags: ['contact'],
        summary: 'Get contact form options/metadata',
        responses: {
          '200': {
            description: 'Contact form options payload',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/contact/submit': {
      post: {
        tags: ['contact'],
        summary: 'Submit contact form',
        responses: {
          '201': {
            description: 'Contact form submission accepted',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '429': { $ref: '#/components/responses/RateLimited' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/contact/submissions': {
      get: {
        tags: ['contact'],
        summary: 'Get contact submissions (admin/private)',
        responses: {
          '200': {
            description: 'Contact submissions list',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/contact/submissions/{id}': {
      get: {
        tags: ['contact'],
        summary: 'Get contact submission by ID (admin/private)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Contact submission payload',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['contact'],
        summary: 'Update contact submission (admin/private)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Contact submission updated',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
      delete: {
        tags: ['contact'],
        summary: 'Delete contact submission (admin/private)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Contact submission deleted',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/email/track/open/{trackingId}': {
      get: {
        tags: ['email-tracking'],
        summary: 'Track email open pixel',
        parameters: [
          {
            name: 'trackingId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Tracking pixel GIF',
            content: {
              'image/gif': {
                schema: { type: 'string', format: 'binary' },
              },
            },
          },
        },
      },
    },
    '/api/email/track/click/{trackingId}': {
      get: {
        tags: ['email-tracking'],
        summary: 'Track email click and redirect',
        parameters: [
          {
            name: 'trackingId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'url',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '302': {
            description: 'Redirect to tracked URL',
          },
          '400': { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/api/email/track/stats': {
      get: {
        tags: ['email-tracking'],
        summary: 'Get email tracking stats',
        responses: {
          '200': {
            description: 'Email tracking stats payload',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/email/track/records': {
      get: {
        tags: ['email-tracking'],
        summary: 'Get paginated email tracking records',
        responses: {
          '200': {
            description: 'Email tracking records payload',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/email/track/submission/{submissionId}': {
      get: {
        tags: ['email-tracking'],
        summary: 'Get email tracking by submission ID',
        parameters: [
          {
            name: 'submissionId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Email tracking submission payload',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/email/track/{trackingId}/details': {
      get: {
        tags: ['email-tracking'],
        summary: 'Get email tracking details by tracking ID',
        parameters: [
          {
            name: 'trackingId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Email tracking detail payload',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/blogs': {
      get: {
        tags: ['blogs'],
        summary: 'List published blogs',
        responses: {
          '200': {
            description: 'Blogs list payload',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/blogs/categories': {
      get: {
        tags: ['blogs'],
        summary: 'Get blog categories with counts',
        responses: {
          '200': {
            description: 'Blog categories payload',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/blogs/tags': {
      get: {
        tags: ['blogs'],
        summary: 'Get blog tags with counts',
        responses: {
          '200': {
            description: 'Blog tags payload',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/blogs/{slug}': {
      get: {
        tags: ['blogs'],
        summary: 'Get blog by slug',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Blog detail payload',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/blogs/{slug}/related': {
      get: {
        tags: ['blogs'],
        summary: 'Get related blogs by slug',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Related blogs payload',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'auth_token',
      },
    },
    responses: {
      BadRequest: {
        description: 'Bad request / validation error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      Conflict: {
        description: 'Conflict (already exists)',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      RateLimited: {
        description: 'Too many requests',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      InternalError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
    schemas: {
      RootStatusResponse: {
        type: 'object',
        required: ['message', 'status', 'timestamp'],
        properties: {
          message: { type: 'string' },
          status: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      HealthResponse: {
        type: 'object',
        required: ['status', 'service', 'version', 'timestamp', 'uptime'],
        properties: {
          status: { type: 'string' },
          service: { type: 'string' },
          version: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
          uptime: { type: 'number' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          message: { type: 'string' },
          details: { type: 'object', additionalProperties: true },
          attemptsLeft: { type: 'number' },
        },
      },
      GenericSuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
        },
      },
      OtpVerifyRequest: {
        type: 'object',
        required: ['email', 'otp'],
        properties: {
          email: { type: 'string', format: 'email' },
          otp: { type: 'string', minLength: 6, maxLength: 6 },
        },
      },
      ResendOtpRequest: {
        type: 'object',
        required: ['email', 'purpose'],
        properties: {
          email: { type: 'string', format: 'email' },
          purpose: { type: 'string', enum: ['signup', 'login'] },
        },
      },
      ServiceCoverageItem: {
        type: 'object',
        required: ['country', 'services'],
        properties: {
          country: { type: 'string' },
          services: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      ServiceMatrixItem: {
        type: 'object',
        required: ['countries', 'services'],
        properties: {
          countries: {
            type: 'array',
            items: { type: 'string' },
          },
          services: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      SignupVendorRequest: {
        type: 'object',
        required: ['email', 'password', 'companyName', 'website', 'contactName', 'contactRole', 'contactPhone'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          companyName: { type: 'string' },
          website: { type: 'string', format: 'uri' },
          contactName: { type: 'string' },
          contactRole: { type: 'string' },
          contactPhone: { type: 'string' },
          selectedPlan: { type: 'string' },
          answers: {
            type: 'object',
            additionalProperties: true,
          },
          questionnaireAnswers: {
            type: 'object',
            additionalProperties: true,
          },
          serviceCoverage: {
            type: 'array',
            items: { $ref: '#/components/schemas/ServiceCoverageItem' },
          },
          serviceMatrix: {
            type: 'array',
            items: { $ref: '#/components/schemas/ServiceMatrixItem' },
          },
        },
      },
      AuthUser: {
        type: 'object',
        required: ['id', 'email', 'role'],
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string' },
          lastLogin: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      AuthSuccessResponse: {
        type: 'object',
        required: ['success', 'token', 'user'],
        properties: {
          success: { type: 'boolean' },
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/AuthUser' },
          profile: {
            type: 'object',
            nullable: true,
            additionalProperties: true,
          },
        },
      },
      AuthMeResponse: {
        type: 'object',
        properties: {
          authenticated: { type: 'boolean' },
          user: { $ref: '#/components/schemas/AuthUser' },
          profile: {
            type: 'object',
            nullable: true,
            additionalProperties: true,
          },
        },
      },
      ListingRequestPayload: {
        type: 'object',
        required: ['companyName', 'website', 'contactName', 'contactRole', 'email'],
        properties: {
          companyName: { type: 'string' },
          website: { type: 'string', format: 'uri' },
          contactName: { type: 'string' },
          contactRole: { type: 'string' },
          contactPhone: { type: 'string', nullable: true },
          email: { type: 'string', format: 'email' },
          selectedPlan: { type: 'string', nullable: true },
          serviceMatrix: {
            type: 'array',
            items: { $ref: '#/components/schemas/ServiceMatrixItem' },
          },
          answers: {
            type: 'object',
            additionalProperties: true,
          },
        },
      },
      ListingRequestRecord: {
        allOf: [
          { $ref: '#/components/schemas/ListingRequestPayload' },
          {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              userId: { type: 'string' },
              status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
              submittedAt: { type: 'string', format: 'date-time' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        ],
      },
      ListingCreatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
            },
          },
        },
      },
      ListingGetResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            anyOf: [
              { $ref: '#/components/schemas/ListingRequestRecord' },
              { type: 'null' },
            ],
          },
        },
      },
      PurpleListing: {
        type: 'object',
        additionalProperties: true,
      },
    },
  },
};
