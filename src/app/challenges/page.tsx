import ChallengeList from '@/components/ChallengeList';

export default function ChallengesPage() {
  return (
    <>
      <header className="demonlist-header">
        <h1 className="demonlist-title">FB Challenges</h1>
        <p className="demonlist-subtitle">
          Lista challenge&apos;y ze społeczności FireBrand. Showcase jest opcjonalny — pozycje bez wideo też mogą się tu pojawić.
        </p>
      </header>

      <ChallengeList />
    </>
  );
}