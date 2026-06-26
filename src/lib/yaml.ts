import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface Victor {
  player: string;
  link: string;
  date: string;
  isVerifier?: boolean;
  // Potential = wpis istnieje, ale nie liczy się do stats gracza
  // (score / main_completed / hardest). Używane dla nie-graczy trzymających WR-y,
  // kontrowersyjnych zgłoszeń itp. Verified count nadal liczy jeśli też isVerifier.
  is_potential?: boolean;
  // Progress w % (80-100). Opcjonalny — weryfikatorzy i starsi victorzy mogą go nie mieć.
  progress?: number;
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
  // Pointercrate-style metadata (all optional, empty string = brak danych)
  level_password: string;
  level_length: string;
  object_count: number;
  difficulty: string;
  gd_version: string;
  song_name: string;
  song_author: string;
  song_id: number;
  song_url: string;
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
  // Pointercrate-style metadata (all optional)
  level_password?: string;
  level_length?: string;
  object_count?: number;
  difficulty?: string;
  gd_version?: string;
  song_name?: string;
  song_author?: string;
  song_id?: number;
  song_url?: string;
}

const DEMONS_PATH = path.join(process.cwd(), 'data', 'demons.yml');
const SUBMISSIONS_PATH = path.join(process.cwd(), 'data', 'submissions.yml');

export function readDemons(): Demon[] {
  const raw = fs.readFileSync(DEMONS_PATH, 'utf8');
  const data = (yaml.load(raw) as Demon[] | null) || [];
  // Defensywnie: stare wpisy mogą nie mieć pola victors (np. po banie ostatniego gracza).
  return data
    .map((d) => ({ ...d, victors: d.victors || [] }))
    .sort((a, b) => a.rank - b.rank);
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

/**
 * Usuwa WSZYSTKIE wpisy victora (completed + verified) dla danego gracza
 * ze wszystkich demonów. Case-insensitive match. Zwraca liczbę usuniętych wpisów.
 * Nie modyfikuje `creator` ani niczego innego — tylko tablicę `victors`.
 */
export function banPlayer(playerName: string): number {
  const target = (playerName || '').toLowerCase();
  if (!target) return 0;
  const demons = readDemons();
  let removed = 0;
  for (const d of demons) {
    const before = d.victors.length;
    d.victors = d.victors.filter((v) => (v.player || '').toLowerCase() !== target);
    removed += before - d.victors.length;
  }
  if (removed > 0) writeDemons(demons);
  return removed;
}

/**
 * Aktualizuje pojedynczego victora w demonie (player jest kluczem).
 * Wszystkie pola są opcjonalne; puste / null = nie zmieniaj.
 */
export function updateVictor(
  demonId: number,
  playerName: string,
  updates: { link?: string; date?: string; isVerifier?: boolean; progress?: number | null; is_potential?: boolean | null }
): { demon: Demon; victor: Victor } | null {
  const demons = readDemons();
  const demon = demons.find((d) => d.id === demonId);
  if (!demon) return null;
  const idx = demon.victors.findIndex((v) => v.player === playerName);
  if (idx === -1) return null;
  const v = demon.victors[idx];
  if (updates.link !== undefined) v.link = updates.link;
  if (updates.date !== undefined) v.date = updates.date;
  if (updates.isVerifier !== undefined) v.isVerifier = updates.isVerifier;
  if (updates.is_potential === null) {
    delete v.is_potential;
  } else if (updates.is_potential !== undefined) {
    v.is_potential = updates.is_potential;
  }
  if (updates.progress === null) {
    delete v.progress;
  } else if (updates.progress !== undefined) {
    v.progress = updates.progress;
  }
  writeDemons(demons);
  return { demon, victor: v };
}

/**
 * Przepisuje `rank` demonów według nowej kolejności id.
 * `order[0]` = id demona, który dostanie rank=1, itd.
 * Zachowuje wszystkie inne pola.
 */
export function reorderDemons(order: number[]): Demon[] {
  const demons = readDemons();
  const byId = new Map(demons.map((d) => [d.id, d]));
  const seen = new Set<number>();
  const next: Demon[] = [];
  order.forEach((id, idx) => {
    const d = byId.get(id);
    if (!d) return;
    seen.add(id);
    next.push({ ...d, rank: idx + 1 });
  });
  // Dorzuć demony spoza `order` na końcu (zachowaj obecne ranki powyżej)
  for (const d of demons) {
    if (!seen.has(d.id)) {
      next.push({ ...d, rank: next.length + 1 });
    }
  }
  writeDemons(next);
  return next;
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
