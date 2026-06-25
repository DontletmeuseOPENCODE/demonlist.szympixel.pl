import DemonList from '@/components/DemonList';

export default function Home() {
  return (
    <>
      <header className="demonlist-header">
        <h1 className="demonlist-title">FriskieList</h1>
        <p className="demonlist-subtitle">Lista najtrudniejszych demonów w Geometry Dash (ustalana przez community)</p>
      </header>

      <DemonList />
    </>
  );
}
