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
