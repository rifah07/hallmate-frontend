import Link from 'next/link';
import { site } from '@/lib/site';
import { HallLogo } from './HallLogo';
import { NavLinks } from './NavLinks';
import { SessionLink } from './SessionLink';

export function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="brand" aria-label={`${site.name}, home`}>
          <HallLogo />
          <span>
            <span className="brand-name">{site.short}</span>
            <span className="brand-sub">{site.name}</span>
          </span>
        </Link>
        <NavLinks />
        <SessionLink className="btn btn-small header-cta" />
        <details className="menu">
          <summary>Menu</summary>
          <div className="menu-panel">
            <NavLinks />
            <SessionLink className="btn btn-small menu-cta" />
          </div>
        </details>
      </div>
    </header>
  );
}
