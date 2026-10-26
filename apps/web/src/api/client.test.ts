import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './client';

afterEach(() => { vi.unstubAllGlobals(); });
describe('API response handling', () => {
  it('returns a Markdown export as text instead of attempting to parse JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('# Network report', { headers: { 'content-type': 'text/markdown; charset=utf-8' } })));
    expect(await api.get('/designs/example/report?format=markdown')).toBe('# Network report');
  });
  it('exposes API errors and explains an unavailable API that returns HTML', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid CIDR' } }), { status: 422, headers: { 'content-type': 'application/json' } })));
    await expect(api.get('/test')).rejects.toThrow('Invalid CIDR');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>Unavailable</html>', { headers: { 'content-type': 'text/html' } })));
    await expect(api.get('/test')).rejects.toThrow('API unavailable');
  });
});
