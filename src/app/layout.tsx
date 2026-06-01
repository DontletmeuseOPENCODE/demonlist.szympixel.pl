import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { getSession } from '@/lib/session';

export const metadata: Metadata = {
  title: 'FriskieList',
  description: 'Prywatna lista najtrudniejszych demonów Geometry Dash – FriskieList',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session.isLoggedIn
    ? { username: session.username, role: session.role }
    : null;

  return (
    <html lang="pl">
      <body>
        <div className="page-wrapper">
          <Navbar user={user} />
          <main className="main-content">
            <div className="container">{children}</div>
          </main>
          <footer style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.8rem', borderTop: '1px solid var(--border)' }}>
            FriskieList · inspirowany <a href="https://pointercrate.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Pointercrate</a>
          </footer>
        </div>
      </body>
    </html>
  );
}
