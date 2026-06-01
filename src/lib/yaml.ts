import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface Victor {
  player: string;
  link: string;
  date: string;
  isVerifier?: boolean;
}

export interface Demon {
  id: number;
  rank: number;
  name: string;
  creator: string;
  level_id: number;
  video: string;
  thumbnail: string;
  added_at: string;
  victors: Victor[];
}

export interface Submission {
  id: number;
  rank: number;
  name: string;
  creator: string;
  level_id: number;
  video: string;
  thumbnail: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Challenge {
  id: number;
  rank: number;
  name: string;
  creator: string;
  level_id: number;
  added_at: string;
  victors: Victor[];
}

const DEMONS_PATH = path.join(process.cwd(), 'data', 'demons.yml');
const SUBMISSIONS_PATH = path.join(process.cwd(), 'data', 'submissions.yml');
const CHALLENGES_PATH = path.join(process.cwd(), 'data', 'challenges.yml');

export function readDemons(): Demon[] {
  const raw = fs.readFileSync(DEMONS_PATH, 'utf8');
  const data = yaml.load(raw) as Demon[];
  return (data || []).sort((a, b) => a.rank - b.rank);
}

export function writeDemons(demons: Demon[]): void {
  const sorted = demons.sort((a, b) => a.rank - b.rank);
  const raw = yaml.dump(sorted, { lineWidth: -1, quotingType: '"' });
  fs.writeFileSync(DEMONS_PATH, raw, 'utf8');
}

export function getDemonById(id: number): Demon | undefined {
  return readDemons().find((d) => d.id === id);
}

export function getNextId(): number {
  const demons = readDemons();
  return demons.length > 0 ? Math.max(...demons.map((d) => d.id)) + 1 : 1;
}

export function addDemon(demon: Omit<Demon, 'id'>): Demon {
  const demons = readDemons();
  const newDemon: Demon = { id: getNextId(), ...demon };
  // Przesuń demony poniżej nowej pozycji
  demons.forEach((d) => {
    if (d.rank >= newDemon.rank) d.rank += 1;
  });
  demons.push(newDemon);
  writeDemons(demons);
  return newDemon;
}

export function updateDemon(id: number, updates: Partial<Omit<Demon, 'id'>>): Demon | null {
  const demons = readDemons();
  const idx = demons.findIndex((d) => d.id === id);
  if (idx === -1) return null;

  const oldRank = demons[idx].rank;
  const newRank = updates.rank;

  if (newRank !== undefined && newRank !== oldRank) {
    // Przesuń inne demony
    demons.forEach((d) => {
      if (d.id === id) return;
      if (newRank < oldRank) {
        if (d.rank >= newRank && d.rank < oldRank) d.rank += 1;
      } else {
        if (d.rank > oldRank && d.rank <= newRank) d.rank -= 1;
      }
    });
  }

  demons[idx] = { ...demons[idx], ...updates };
  writeDemons(demons);
  return demons[idx];
}

export function deleteDemon(id: number): boolean {
  const demons = readDemons();
  const idx = demons.findIndex((d) => d.id === id);
  if (idx === -1) return false;
  const deleted = demons.splice(idx, 1)[0];
  // Napraw ranki po usunięciu
  demons.forEach((d) => {
    if (d.rank > deleted.rank) d.rank -= 1;
  });
  writeDemons(demons);
  return true;
}

export function addVictor(demonId: number, victor: Victor): Demon | null {
  const demons = readDemons();
  const demon = demons.find((d) => d.id === demonId);
  if (!demon) return null;
  demon.victors.push(victor);
  writeDemons(demons);
  return demon;
}

export function deleteVictor(demonId: number, playerName: string): Demon | null {
  const demons = readDemons();
  const demon = demons.find((d) => d.id === demonId);
  if (!demon) return null;
  demon.victors = demon.victors.filter((v) => v.player !== playerName);
  writeDemons(demons);
  return demon;
}

export function readSubmissions(): Submission[] {
  if (!fs.existsSync(SUBMISSIONS_PATH)) {
    return [];
  }
  const raw = fs.readFileSync(SUBMISSIONS_PATH, 'utf8');
  const data = yaml.load(raw) as Submission[];
  return data || [];
}

export function writeSubmissions(submissions: Submission[]): void {
  const raw = yaml.dump(submissions, { lineWidth: -1, quotingType: '"' });
  fs.writeFileSync(SUBMISSIONS_PATH, raw, 'utf8');
}

export function addSubmission(submission: Omit<Submission, 'id'>): Submission {
  const submissions = readSubmissions();
  const nextId = submissions.length > 0 ? Math.max(...submissions.map((s) => s.id)) + 1 : 1;
  const newSubmission: Submission = { id: nextId, ...submission };
  submissions.push(newSubmission);
  writeSubmissions(submissions);
  return newSubmission;
}

export function getSubmissionById(id: number): Submission | undefined {
  return readSubmissions().find((s) => s.id === id);
}

export function updateSubmissionStatus(id: number, status: 'pending' | 'approved' | 'rejected'): Submission | null {
  const submissions = readSubmissions();
  const idx = submissions.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  submissions[idx].status = status;
  writeSubmissions(submissions);
  return submissions[idx];
}

export function deleteSubmission(id: number): boolean {
  const submissions = readSubmissions();
  const idx = submissions.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  submissions.splice(idx, 1);
  writeSubmissions(submissions);
  return true;
}

// ─── Challenges CRUD ───

export function readChallenges(): Challenge[] {
  if (!fs.existsSync(CHALLENGES_PATH)) {
    return [];
  }
  const raw = fs.readFileSync(CHALLENGES_PATH, 'utf8');
  const data = yaml.load(raw) as Challenge[];
  return (data || []).sort((a, b) => a.rank - b.rank);
}

export function writeChallenges(challenges: Challenge[]): void {
  const sorted = challenges.sort((a, b) => a.rank - b.rank);
  const raw = yaml.dump(sorted, { lineWidth: -1, quotingType: '"' });
  fs.writeFileSync(CHALLENGES_PATH, raw, 'utf8');
}

export function getChallengeById(id: number): Challenge | undefined {
  return readChallenges().find((c) => c.id === id);
}

export function getNextChallengeId(): number {
  const challenges = readChallenges();
  return challenges.length > 0 ? Math.max(...challenges.map((c) => c.id)) + 1 : 1;
}

export function addChallenge(challenge: Omit<Challenge, 'id'>): Challenge {
  const challenges = readChallenges();
  const newChallenge: Challenge = { id: getNextChallengeId(), ...challenge };
  challenges.forEach((c) => {
    if (c.rank >= newChallenge.rank) c.rank += 1;
  });
  challenges.push(newChallenge);
  writeChallenges(challenges);
  return newChallenge;
}

export function updateChallenge(id: number, updates: Partial<Omit<Challenge, 'id'>>): Challenge | null {
  const challenges = readChallenges();
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
  writeChallenges(challenges);
  return challenges[idx];
}

export function deleteChallenge(id: number): boolean {
  const challenges = readChallenges();
  const idx = challenges.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  const deleted = challenges.splice(idx, 1)[0];
  challenges.forEach((c) => {
    if (c.rank > deleted.rank) c.rank -= 1;
  });
  writeChallenges(challenges);
  return true;
}

export function addChallengeVictor(challengeId: number, victor: Victor): Challenge | null {
  const challenges = readChallenges();
  const challenge = challenges.find((c) => c.id === challengeId);
  if (!challenge) return null;
  challenge.victors.push(victor);
  writeChallenges(challenges);
  return challenge;
}

export function deleteChallengeVictor(challengeId: number, playerName: string): Challenge | null {
  const challenges = readChallenges();
  const challenge = challenges.find((c) => c.id === challengeId);
  if (!challenge) return null;
  challenge.victors = challenge.victors.filter((v) => v.player !== playerName);
  writeChallenges(challenges);
  return challenge;
}
