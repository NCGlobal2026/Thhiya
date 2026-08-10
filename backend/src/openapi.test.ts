import { describe, expect, it } from 'bun:test';
import { openApiDocument } from './openapi';

describe('openApiDocument quality', () => {
  it('uses OpenAPI 3.0.3 with metadata', () => {
    expect(openApiDocument.openapi).toBe('3.0.3');
    expect(openApiDocument.info.title).toBeTruthy();
    expect(openApiDocument.info.version).toBeTruthy();
    expect(openApiDocument.info.contact?.email).toBeTruthy();
  });

  it('defines auth security schemes', () => {
    expect(openApiDocument.components?.securitySchemes?.bearerAuth?.type).toBe('http');
    expect(openApiDocument.components?.securitySchemes?.cookieAuth?.in).toBe('cookie');
  });

  it('documents core auth and listing endpoints', () => {
    const paths = openApiDocument.paths;

    expect(paths['/api/auth/login/request-otp']).toBeDefined();
    expect(paths['/api/auth/login/verify-otp']).toBeDefined();
    expect(paths['/api/auth/me']).toBeDefined();
    expect(paths['/api/listings/my-request']).toBeDefined();
    expect(paths['/api/listings/my-request/plan']).toBeDefined();
    expect(paths['/api/listings/purple/{slug}']).toBeDefined();
  });

  it('secures private endpoints in the spec', () => {
    const myRequest = openApiDocument.paths['/api/listings/my-request'];
    const authMe = openApiDocument.paths['/api/auth/me'];

    expect(Array.isArray(myRequest.get.security)).toBe(true);
    expect(Array.isArray(myRequest.put.security)).toBe(true);
    expect(Array.isArray(authMe.get.security)).toBe(true);
  });

  it('has reusable schemas and error responses', () => {
    expect(openApiDocument.components?.schemas?.ErrorResponse).toBeDefined();
    expect(openApiDocument.components?.schemas?.ListingRequestPayload).toBeDefined();
    expect(openApiDocument.components?.responses?.BadRequest).toBeDefined();
    expect(openApiDocument.components?.responses?.InternalError).toBeDefined();
  });

  it('covers all backend route groups in OpenAPI paths', () => {
    const paths = openApiDocument.paths as Record<string, unknown>;

    const requiredPaths = [
      '/api/insights',
      '/api/countries',
      '/api/services',
      '/api/providers',
      '/api/country-services',
      '/api/bant/options',
      '/api/contact/options',
      '/api/email/track/stats',
      '/api/blogs',
      '/api/auth/login/request-otp',
      '/api/listings/my-request',
    ];

    for (const path of requiredPaths) {
      expect(paths[path]).toBeDefined();
    }
  });

  it('documents all backend route-group tags', () => {
    const tags = (openApiDocument.tags || []).map((tag: any) => tag.name);

    const requiredTags = [
      'health',
      'docs',
      'auth',
      'listings',
      'insights',
      'countries',
      'services',
      'providers',
      'country-services',
      'bant',
      'contact',
      'email-tracking',
      'blogs',
    ];

    for (const tag of requiredTags) {
      expect(tags.includes(tag)).toBe(true);
    }
  });
});
