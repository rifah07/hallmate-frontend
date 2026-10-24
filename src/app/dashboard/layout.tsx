'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar } from '@/components/Avatar';
import { api } from '@/lib/client-api';
import { ROLE_LABEL } from '@/lib/roles';
import { useSession } from '@/lib/session';
import type { Role } from '@/lib/types';

const ADMINS: Role[] = ['SUPER_ADMIN', 'PROVOST'];
const TASK_STAFF: Role[] = ['OFFICE_STAFF', 'MAINTENANCE_STAFF', 'ASSISTANT_WARDEN'];

// Each role sees only the pages its job needs. The API enforces the same
// rules; hiding a link is for clarity, not security.
const NAV: { href: string; label: string; roles?: Role[] }[] = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/notifications', label: 'Notifications' },
  { href: '/dashboard/notices', label: 'Notices' },
  { href: '/dashboard/id-card', label: 'ID card', roles: ['STUDENT'] },
  { href: '/dashboard/bills', label: 'Bills & payments', roles: ['STUDENT'] },
  { href: '/dashboard/requests', label: 'Requests', roles: ['STUDENT', 'HOUSE_TUTOR', ...ADMINS] },
  { href: '/dashboard/tasks', label: 'My tasks', roles: [...TASK_STAFF, 'HOUSE_TUTOR', ...ADMINS] },
  { href: '/dashboard/visitors', label: 'Visitors', roles: ['STUDENT', 'HOUSE_TUTOR', ...ADMINS] },
  { href: '/dashboard/meals', label: 'Meals', roles: ['STUDENT', 'DINING_STAFF', ...ADMINS] },
  { href: '/dashboard/people', label: 'People', roles: ['HOUSE_TUTOR', ...ADMINS] },
  { href: '/dashboard/rooms', label: 'Rooms', roles: ['HOUSE_TUTOR', ...ADMINS] },
  { href: '/dashboard/gate', label: 'Gate', roles: ['GUARD', ...ADMINS] },
  { href: '/dashboard/billing', label: 'Billing', roles: ADMINS },
  { href: '/dashboard/password', label: 'Change password' },
];

export default function DashboardLayout({ children }: LayoutProps<'/dashboard'>) {
  const { user, ready, signOut } = useSession();
  const path = usePathname();
  const router = useRouter();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(path)}`);
  }, [ready, user, path, router]);

  // Polling, not websockets: Vercel functions can't hold a socket open.
  // Skipped while the tab is hidden, so idle tabs cost nothing.
  useEffect(() => {
    if (!user) return;
    const check = () => {
      if (document.visibilityState === 'visible')
        api<{ count: number }>('/notifications/unread-count')
          .then((r) => setUnread(r.count))
          .catch(() => undefined);
    };
    check();
    const timer = setInterval(check, 30_000);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
    };
  }, [user, path]);

  if (!user) {
    return (
      <p className="container section muted" role="status">
        Opening your dashboard…
      </p>
    );
  }

  return (
    <div className="container dash">
      <aside className="dash-side">
        <div className="dash-me">
          <Avatar src={user.photo} name={user.name} size={56} />
          <div>
            <b>{user.name}</b>
            <span>{ROLE_LABEL[user.role]}</span>
          </div>
        </div>
        <nav aria-label="Dashboard">
          {NAV.filter((item) => !item.roles || item.roles.includes(user.role)).map((item) => (
            <Link key={item.href} href={item.href} aria-current={path === item.href ? 'page' : undefined}>
              {item.label}
              {item.href === '/dashboard/notifications' && unread > 0 && (
                <span className="badge" aria-label={`${unread} unread`}>
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="btn btn-quiet btn-small"
          onClick={async () => {
            await signOut();
            // A full load: the dashboard's own "not signed in" redirect can't race it,
            // and nothing from this session stays in memory
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload on purpose
            window.location.assign('/');
          }}
        >
          Log out
        </button>
      </aside>
      <div className="dash-main">{children}</div>
    </div>
  );
}
