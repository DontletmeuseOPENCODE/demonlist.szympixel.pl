import ChallengeList from '@/components/ChallengeList';

export default function ChallengesPage() {
  return (
    <>
      <header className="challenge-header">
        <h1 className="challenge-title">FB Challenges</h1>
        <p className="challenge-subtitle">Lista wyzwań do pokonania — bez showcase, czysta rywalizacja</p>
      </header>

      <ChallengeList />
    </>
  );
}
