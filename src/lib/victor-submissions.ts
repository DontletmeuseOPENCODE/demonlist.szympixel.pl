import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

/**
 * VictorSubmission — zgłoszenie zwycięstwa nad demonem z community.
 * Trafia do kolejki (status: pending) i czeka na zatwierdzenie przez admina/modera.
 * Po zatwierdzeniu powstaje wpis w Demon.victors[] w data/demons.yml.
 */
export interface VictorSubmission {
  id: number;
  demon_id: number;
  player: string;
  progress: number;
  video: string;
  raw_footage: string;
  notes: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

const VICTOR_SUBMISSIONS_PATH = path.join(process.cwd(), 'data', 'victor-submissions.yml');

export function readVictorSubmissions(): VictorSubmission[] {
  if (!fs.existsSync(VICTOR_SUBMISSIONS_PATH)) {
    return [];
  }
  const raw = fs.readFileSync(VICTOR_SUBMISSIONS_PATH, 'utf8');
  const data = yaml.load(raw) as VictorSubmission[] | null;
  return data || [];
}

export function writeVictorSubmissions(subs: VictorSubmission[]): void {
  const raw = yaml.dump(subs, { lineWidth: -1, quotingType: '"' });
  fs.writeFileSync(VICTOR_SUBMISSIONS_PATH, raw, 'utf8');
}

export function getVictorSubmissionById(id: number): VictorSubmission | undefined {
  return readVictorSubmissions().find((s) => s.id === id);
}

export function getNextVictorSubmissionId(): number {
  const subs = readVictorSubmissions();
  return subs.length > 0 ? Math.max(...subs.map((s) => s.id)) + 1 : 1;
}

export function addVictorSubmission(sub: Omit<VictorSubmission, 'id'>): VictorSubmission {
  const subs = readVictorSubmissions();
  const newSub: VictorSubmission = { id: getNextVictorSubmissionId(), ...sub };
  subs.push(newSub);
  writeVictorSubmissions(subs);
  return newSub;
}

export function updateVictorSubmissionStatus(id: number, status: 'pending' | 'approved' | 'rejected'): VictorSubmission | null {
  const subs = readVictorSubmissions();
  const idx = subs.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  subs[idx].status = status;
  writeVictorSubmissions(subs);
  return subs[idx];
}

export function deleteVictorSubmission(id: number): boolean {
  const subs = readVictorSubmissions();
  const idx = subs.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  subs.splice(idx, 1);
  writeVictorSubmissions(subs);
  return true;
}