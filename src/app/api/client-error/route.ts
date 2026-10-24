// Browser crashes are invisible to the server. error.tsx posts a short
// report here so it shows up in Vercel → Logs next to server errors.
// More specific than /api/[...path], so it never reaches the proxy.
export async function POST(req: Request) {
  const text = (await req.text()).slice(0, 2000); // cap: anyone can call this
  console.error('[client-error]', text);
  return new Response(null, { status: 204 });
}
