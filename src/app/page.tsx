import DemonList from '@/components/DemonList';

export default function Home() {
  return (
    <>
      <header className="demonlist-header">
        <h1 className="demonlist-title">Demonlist</h1>
        <p className="demonlist-subtitle">Lista najtrudniejszych ukończonych demonów.</p>
      </header>
      
      <DemonList />
    </>
  );
}
