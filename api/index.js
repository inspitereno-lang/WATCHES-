import app from '../server/server.js';

// Vercel invokes the Express application as a serverless function. The app
// rewrite passes the wildcard as a query value; restore it as the Express path.
export function normalizeVercelRequest(request) {
  const requestUrl = new URL(request.url, 'http://vercel.internal');
  const rewrittenPath = requestUrl.searchParams.get('__path');

  if (rewrittenPath) {
    requestUrl.searchParams.delete('__path');
    const cleanPath = rewrittenPath.replace(/^\/+|\/+$/g, '');
    const query = requestUrl.searchParams.toString();
    request.url = `/api/${cleanPath}${query ? `?${query}` : ''}`;
  }
}

export default function handler(request, response) {
  normalizeVercelRequest(request);

  return app(request, response);
}
