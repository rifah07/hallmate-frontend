'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { site } from '@/lib/site';

// The only client part of the header: it knows which page is open.
export function NavLinks() {
  const path = usePathname();
  return (
    <nav className="nav" aria-label="Main">
      {site.nav.map((item) => (
        <Link key={item.href} href={item.href} aria-current={path.startsWith(item.href) ? 'page' : undefined}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
