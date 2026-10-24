'use client';

import Link from 'next/link';
import { useSession } from '@/lib/session';

export function SessionLink({ className }: { className?: string }) {
  const { user } = useSession();
  return (
    <Link href={user ? '/dashboard' : '/login'} className={className}>
      {user ? 'My dashboard' : 'Resident login'}
    </Link>
  );
}
