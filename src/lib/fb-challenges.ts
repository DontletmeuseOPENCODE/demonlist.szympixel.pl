import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

/**
 * FbChallenge — pozycja na liście FB Challenges.
 * Identyczny zestaw pól co Demon, ale bez victors.
 * Pole `video` jest opcjonalne (pusty string = brak showcase).
 */
export interface FbChallenge {
  id: number;
  rank: number;
  name: string;
  creator: string;
  level_id: number;
  video: string;
  thumbnail: string;
  added_at: string;
}

const FB_CHALLENGES_PATH = path.join(process.cwd(), 'data', 'fb-challenges.yml');

export function readFbChallenges(): FbChallenge[] {
  if (!fs.existsSync(FB_CHALLENGES_PATH)) {
    return [];
  }
  const raw = fs.readFileSync(FB_CHALLENGES_PATH, 'utf8');
  const data = yaml.load(raw) as FbChallenge[] | null;
  return (data || []).sort((a, b) => a.rank - b.rank);
}

export function writeFbChallenges(challenges: FbChallenge[]): void {
  const sorted = challenges.sort((a, b) => a.rank - b.rank);
  const raw = yaml.dump(sorted, { lineWidth: -1, quotingType: '"' });
  fs.writeFileSync(FB_CHALLENGES_PATH, raw, 'utf8');
}

export function getFbChallengeById(id: number): FbChallenge | undefined {
  return readFbChallenges().find((c) => c.id === id);
}

export function getNextFbChallengeId(): number {
  const challenges = readFbChallenges();
  return challenges.length > 0 ? Math.max(...challenges.map((c) => c.id)) + 1 : 1;
}

export function addFbChallenge(challenge: Omit<FbChallenge, 'id'>): FbChallenge {
  const challenges = readFbChallenges();
  const newChallenge: FbChallenge = { id: getNextFbChallengeId(), ...challenge };
  // Przesuń challenge'e poniżej nowej pozycji
  challenges.forEach((c) => {
    if (c.rank >= newChallenge.rank) c.rank += 1;
  });
  challenges.push(newChallenge);
  writeFbChallenges(challenges);
  return newChallenge;
}

export function updateFbChallenge(id: number, updates: Partial<Omit<FbChallenge, 'id'>>): FbChallenge | null {
  const challenges = readFbChallenges();
  const idx = challenges.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  const oldRank = challenges[idx].rank;
  const newRank = updates.rank;

  if (newRank !== undefined && newRank !== oldRank) {
    challenges.forEach((c) => {
      if (c.id === id) return;
      if (newRank < oldRank) {
        if (c.rank >= newRank && c.rank < oldRank) c.rank += 1;
      } else {
        if (c.rank > oldRank && c.rank <= newRank) c.rank -= 1;
      }
    });
  }

  challenges[idx] = { ...challenges[idx], ...updates };
  writeFbChallenges(challenges);
  return challenges[idx];
}

export function deleteFbChallenge(id: number): boolean {
  const challenges = readFbChallenges();
  const idx = challenges.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  const deleted = challenges.splice(idx, 1)[0];
  // Napraw ranki po usunięciu
  challenges.forEach((c) => {
    if (c.rank > deleted.rank) c.rank -= 1;
  });
  writeFbChallenges(challenges);
  return true;
}