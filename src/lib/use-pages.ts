'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from './client-api';

type Page<T> = { items: T[]; nextCursor: string | null };

// Cursor-paginated lists ({ items, nextCursor }) with a "Load more" button.
export function usePages<T>(path: string) {
  const [items, setItems] = useState<T[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  const fetchPage = useCallback(
    (after: string | null) =>
      api<Page<T>>(`${path}${path.includes('?') ? '&' : '?'}limit=20${after ? `&cursor=${encodeURIComponent(after)}` : ''}`),
    [path],
  );

  useEffect(() => {
    let live = true;
    fetchPage(null)
      .then((p) => live && (setItems(p.items), setCursor(p.nextCursor), setError('')))
      .catch((e: Error) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, [fetchPage, version]);

  const more = async () => {
    const p = await fetchPage(cursor);
    setItems((old) => [...(old ?? []), ...p.items]);
    setCursor(p.nextCursor);
  };
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { items, setItems, error, hasMore: !!cursor, more, reload };
}
