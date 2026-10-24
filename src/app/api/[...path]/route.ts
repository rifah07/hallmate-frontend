import type { NextRequest } from 'next/server';

// Same-origin proxy: the browser calls /api/*, this forwards to the API.
// Why a route handler and not a plain rewrite:
// - the refresh cookie the API sets lands on THIS site's domain, so it can
//   be SameSite=Strict and invisible to other sites
// - we add the shared secret plus the reader's real IP, so the API rate
//   limits per reader instead of treating all of Vercel as one client
// - only an allowlist of headers goes through: a browser can't smuggle in
//   its own x-client-ip or x-internal-key
const REQUEST_HEADERS = ['content-type', 'authorization', 'cookie', 'user-agent', 'accept'];
const RESPONSE_HEADERS = ['content-type', 'location', 'content-disposition', 'cache-control'];

async function proxy(req: NextRequest, { params }: RouteContext<'/api/[...path]'>) {
  const { path } = await params;
  const url = `${process.env.BACKEND_URL}/api/${path.map(encodeURIComponent).join('/')}${req.nextUrl.search}`;

  const headers = new Headers();
  for (const name of REQUEST_HEADERS) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set('x-internal-key', process.env.INTERNAL_API_KEY ?? '');
  // On Vercel these forwarding headers are set by the platform, not the browser
  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  headers.set('x-client-ip', clientIp);

  const hasBody = !['GET', 'HEAD'].includes(req.method);
  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: req.method,
      headers,
      body: hasBody ? req.body : undefined,
      redirect: 'manual',
      // @ts-expect-error -- Node fetch needs this to stream a request body
      duplex: hasBody ? 'half' : undefined,
    });
  } catch (err) {
    // API down or unreachable: log it here, answer in the API's own shape
    console.error(`[api proxy] ${req.method} /${path.join('/')}`, err);
    return Response.json(
      { success: false, error: { message: 'The server is not responding. Please try again shortly.' } },
      { status: 502 },
    );
  }

  const out = new Headers();
  for (const name of RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) out.set(name, value);
  }
  for (const cookie of upstream.headers.getSetCookie()) out.append('set-cookie', cookie);
  return new Response(upstream.body, { status: upstream.status, headers: out });
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
