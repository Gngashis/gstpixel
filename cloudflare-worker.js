const NOT_FOUND_PATH = '/404.html';
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
};

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Edge API Route Handling
    if (url.pathname === '/api/health') {
      return withSecurityHeaders(
        new Response(
          JSON.stringify({
            status: 'ok',
            service: 'GSTPIXEL Compliance Engine',
            version: '1.0.0-phase10',
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );
    }

    if (url.pathname === '/api/billing/plans') {
      return withSecurityHeaders(
        new Response(
          JSON.stringify({
            status: 'success',
            currency: 'INR',
            plans: [
              { id: 'community', name: 'Community Free', priceInr: 0, limit: 5 },
              { id: 'starter', name: 'Starter AI', priceInr: 499, limit: 100 },
              { id: 'pro', name: 'Business Pro', priceInr: 1499, limit: 500 },
              { id: 'enterprise', name: 'Enterprise', priceInr: 3999, limit: 2500 },
            ],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );
    }

    const response = withSecurityHeaders(await env.ASSETS.fetch(request));

    if (response.status !== 404 || !['GET', 'HEAD'].includes(request.method)) {
      return response;
    }

    const notFoundUrl = new URL(NOT_FOUND_PATH, request.url);
    const notFoundResponse = withSecurityHeaders(await env.ASSETS.fetch(
      new Request(notFoundUrl, { method: request.method, headers: request.headers }),
    ));

    return new Response(request.method === 'HEAD' ? null : notFoundResponse.body, {
      status: 404,
      statusText: 'Not Found',
      headers: notFoundResponse.headers,
    });
  },
};
