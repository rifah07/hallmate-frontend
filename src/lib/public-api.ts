import 'server-only';

// Server-side reads of the public API. Pages are static and refresh at most
// every 5 minutes. If the API can't be reached, a page gets null and shows a
// calm message instead of failing (or failing the build).
export async function getPublic<T>(path: string, revalidate = 300): Promise<T | null> {
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/public/${path}`, {
      headers: { 'x-internal-key': process.env.INTERNAL_API_KEY ?? '' },
      next: { revalidate },
    });
    if (!res.ok) return null;
    return ((await res.json()) as { data: T }).data;
  } catch (error) {
    console.error(`[public-api] ${path}`, (error as Error).message);
    return null;
  }
}
