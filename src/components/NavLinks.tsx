'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { site } from '@/lib/site';

// Grouped navigation. Wide screens: each group is a dropdown (hover, keyboard
// focus or a tap). Inside the phone menu the same markup shows every group as
// a labelled list (see .menu in globals.css).
export function NavLinks() {
  const path = usePathname();
  // Remember the page a dropdown was opened on: on any other page it is closed
  const [openOn, setOpenOn] = useState<{ group: string; path: string } | null>(null);
  const open = openOn?.path === path ? openOn.group : null;
  const setOpen = (group: string | null) => setOpenOn(group ? { group, path } : null);
  const navRef = useRef<HTMLElement>(null);

  // A new page also drops focus inside the menu and closes the phone menu
  useEffect(() => {
    (document.activeElement as HTMLElement | null)?.blur();
    document.querySelector('details.menu[open]')?.removeAttribute('open');
  }, [path]);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !navRef.current?.contains(e.target as Node)) setOpenOn(null);
    };
    document.addEventListener('keydown', close);
    document.addEventListener('pointerdown', close);
    return () => {
      document.removeEventListener('keydown', close);
      document.removeEventListener('pointerdown', close);
    };
  }, [open]);

  return (
    <nav className="nav" aria-label="Main" ref={navRef}>
      {site.nav.map((group) => {
        const active = group.links.some((l) => path.startsWith(l.href));
        return (
          <div key={group.label} className="nav-group" data-open={open === group.label || undefined}>
            <button
              type="button"
              className="nav-trigger"
              aria-expanded={open === group.label}
              data-active={active || undefined}
              onClick={() => setOpen(open === group.label ? null : group.label)}
            >
              {group.label}
            </button>
            <ul className="nav-menu">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} aria-current={path.startsWith(link.href) ? 'page' : undefined}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
