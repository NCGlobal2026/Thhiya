import { describe, expect, it } from 'bun:test';
import app from './index';

describe('API app contracts', () => {
  it('returns root status payload', async () => {
    const response = await app.request('http://localhost/');
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe('Thhiya API v2');
    expect(body.status).toBe('healthy');
  });

  it('returns health check payload', async () => {
    const response = await app.request('http://localhost/health');
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('thhiya-api');
    expect(typeof body.uptime).toBe('number');
  });

  it('serves openapi json', async () => {
    const response = await app.request('http://localhost/openapi.json');
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(body.openapi).toBeTruthy();
    expect(body.info?.title).toBeTruthy();
  });

  it('serves scalar docs html', async () => {
    const response = await app.request('http://localhost/docs');
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    expect(body.toLowerCase()).toContain('scalar');
  });

  it('handles cors preflight with allow headers', async () => {
    const response = await app.request('http://localhost/api/insights', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:5173',
      },
    });

    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
    expect(response.headers.get('access-control-allow-credentials')).toBe('true');
  });

  it('returns structured 404 response for unknown routes', async () => {
    const response = await app.request('http://localhost/api/does-not-exist');
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Not found');
    expect(body.message).toContain('GET /api/does-not-exist');
  });
});
