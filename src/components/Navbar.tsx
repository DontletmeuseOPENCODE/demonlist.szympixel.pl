'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import SubmitDemonForm from '@/components/SubmitDemonForm';

interface NavbarProps {
  user?: { username: string; role: string } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  const links = [
    { href: '/', label: 'Demonlist' },
    { href: '/challenges', label: 'FB Challenges' },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">
            <img src="/logo.png" alt="logo" width={32} height={32} />
            <span>szympixel<span className="brand-accent">.demonlist</span></span>
          </Link>

          <button
            className="navbar-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>

          <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link ${pathname === l.href || pathname.startsWith(l.href + '/') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}

            <button 
              className="nav-link" 
              style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              onClick={() => { setMenuOpen(false); setShowSubmitModal(true); }}
            >
              Zgłoś Poziom
            </button>

            {user ? (
              <>
                <Link href="/admin/dashboard" className={`nav-link ${pathname.startsWith('/admin') ? 'active' : ''}`}>
                  Panel ({user.username})
                </Link>
                <button className="nav-link nav-logout" onClick={handleLogout}>
                  Wyloguj
                </button>
              </>
            ) : (
              <Link href="/login" className="nav-link nav-login">
                Zaloguj
              </Link>
            )}
          </div>
        </div>
      </nav>
      {showSubmitModal && <SubmitDemonForm onClose={() => setShowSubmitModal(false)} />}
    </>
  );
}
