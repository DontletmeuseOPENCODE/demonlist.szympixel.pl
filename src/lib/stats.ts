import { readDemons, type Demon } from './yaml';
import { readFbChallenges, type FbChallenge } from './fb-challenges';
import { getYouTubeThumbnail } from './youtube';

export type DemonList = 'main' | 'extended';

export interface CompletedDemonEntry {
  id: number;
  name: string;
  rank: number;
  creator: string;
  thumbnail: string;
  video: string;
  date: string;
  progress?: number;
  list: DemonList;
}

export interface VerifiedDemonEntry {
  id: number;
  name: string;
  rank: number;
  creator: string;
  thumbnail: string;
  video: string;
  date: string;
}

export interface CreatedDemonEntry {
  id: number;
  name: string;
  rank: number;
  thumbnail: string;
  list: DemonList;
}

export interface HardestDemonEntry {
  id: number;
  name: string;
  rank: number;
  creator: string;
  thumbnail: string;
}

export interface PlayerStats {
  player: string;             // oryginalna pisownia (z pierwszego wystąpienia)
  main_completed: number;
  extended_completed: number;
  verified_count: number;
  created_count: number;
  score: number;
  hardest_demon?: HardestDemonEntry;
  demons_completed: CompletedDemonEntry[];
  demons_verified: VerifiedDemonEntry[];
  demons_created: CreatedDemonEntry[];
  /** Mapa nazw pól na `true` gdy wartość jest ręcznie nadpisana w stats-overrides.yml. */
  _override?: {
    main_completed?: boolean;
    verified_count?: boolean;
    created_count?: boolean;
    score?: boolean;
    hardest_demon?: boolean;
  };
}

export interface LeaderboardEntry {
  player: string;
  score: number;
  rank: number;
  main_completed: number;
  verified_count: number;
  _override?: {
    main_completed?: boolean;
    verified_count?: boolean;
    score?: boolean;
  };
}

function thumbnailFor(video: string, fallback: string): string {
  return getYouTubeThumbnail(video) || fallback || '';
}

function completedFromMain(demons: Demon[], playerLower: string): { entries: CompletedDemonEntry[]; score: number; verified: VerifiedDemonEntry[]; hardest?: HardestDemonEntry; verifiedCount: number; mainCount: number } {
  const entries: CompletedDemonEntry[] = [];
  const verified: VerifiedDemonEntry[] = [];
  let score = 0;
  let mainCount = 0;
  let verifiedCount = 0;
  let hardest: HardestDemonEntry | undefined;

  for (const d of demons) {
    for (const v of d.victors || []) {
      if ((v.player || '').toLowerCase() !== playerLower) continue;
      if (v.isVerifier) {
        // Potential verifier: liczy się do verified_count (to nie jest "ukonczenie gracza"),
        // ale pomijamy w score/main/hardest (są obsłużone niżej w else).
        verifiedCount += 1;
        verified.push({
          id: d.id,
          name: d.name,
          rank: d.rank,
          creator: d.creator,
          thumbnail: thumbnailFor(d.video, d.thumbnail),
          video: d.video,
          date: v.date,
        });
      } else if (!v.is_potential) {
        // Potential victor: NIE liczy się do stats (score, main, hardest).
        mainCount += 1;
        score += 100 * (1 - (d.rank - 1) / 100);
        entries.push({
          id: d.id,
          name: d.name,
          rank: d.rank,
          creator: d.creator,
          thumbnail: thumbnailFor(d.video, d.thumbnail),
          video: d.video,
          date: v.date,
          progress: v.progress,
          list: 'main',
        });
        if (!hardest || d.rank < hardest.rank) {
          hardest = {
            id: d.id,
            name: d.name,
            rank: d.rank,
            creator: d.creator,
            thumbnail: thumbnailFor(d.video, d.thumbnail),
          };
        }
      }
    }
  }

  return { entries, score, verified, hardest, verifiedCount, mainCount };
}

function completedFromExtended(challenges: FbChallenge[], _playerLower: string): { entries: CompletedDemonEntry[]; count: number } {
  // FB Challenges w obecnym modelu nie mają listy victors — nie ma skąd wziąć completed.
  // Creator jest już wliczany w demons_created.
  void challenges;
  return { entries: [], count: 0 };
}

function createdFromBoth(demons: Demon[], challenges: FbChallenge[], playerLower: string): { entries: CreatedDemonEntry[]; count: number } {
  const entries: CreatedDemonEntry[] = [];
  for (const d of demons) {
    if ((d.creator || '').toLowerCase() === playerLower) {
      entries.push({
        id: d.id,
        name: d.name,
        rank: d.rank,
        thumbnail: thumbnailFor(d.video, d.thumbnail),
        list: 'main',
      });
    }
  }
  for (const c of challenges) {
    if ((c.creator || '').toLowerCase() === playerLower) {
      entries.push({
        id: c.id,
        name: c.name,
        rank: c.rank,
        thumbnail: thumbnailFor(c.video, c.thumbnail),
        list: 'extended',
      });
    }
  }
  // sortuj po (main first, potem rank)
  entries.sort((a, b) => {
    if (a.list !== b.list) return a.list === 'main' ? -1 : 1;
    return a.rank - b.rank;
  });
  return { entries, count: entries.length };
}

/**
 * Oblicza statystyki gracza. Zwraca obiekt nawet dla gracza bez wpisów
 * (wszystkie sekcje puste) — Pointercrate pokazuje takie profile też.
 */
export function getPlayerStats(name: string): PlayerStats {
  const playerLower = name.toLowerCase();
  const demons = readDemons();
  const challenges = readFbChallenges();

  const mainResult = completedFromMain(demons, playerLower);
  const extResult = completedFromExtended(challenges, playerLower);
  const createdResult = createdFromBoth(demons, challenges, playerLower);

  // Posortuj demons_completed po dacie rosnąco (najszybsi pierwsi)
  const demonsCompleted = [...mainResult.entries, ...extResult.entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  // Demons verified po dacie rosnąco
  const demonsVerified = [...mainResult.verified].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return {
    player: name,
    main_completed: mainResult.mainCount,
    extended_completed: extResult.count,
    verified_count: mainResult.verifiedCount,
    created_count: createdResult.count,
    score: mainResult.score,
    hardest_demon: mainResult.hardest,
    demons_completed: demonsCompleted,
    demons_verified: demonsVerified,
    demons_created: createdResult.entries,
  };
}

/**
 * Łączy obliczone statystyki z ewentualnym ręcznym nadpisaniem.
 * Nadpisane pola oznacza przez `_override[field] = true`.
 * `hardest_demon_id === null` w override = wymuś "brak" (nie obliczaj).
 */
export function getEffectiveStats(name: string): PlayerStats {
  const computed = getPlayerStats(name);
  // Lazy import — unikamy cyklu zależności
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getStatsOverride } = require('./stats-overrides') as typeof import('./stats-overrides');
  const ov = getStatsOverride(name);
  if (!ov) return computed;

  const demons = readDemons();
  const overrideFlags: NonNullable<PlayerStats['_override']> = {};
  const merged: PlayerStats = { ...computed };

  if (ov.main_completed !== undefined) {
    merged.main_completed = ov.main_completed;
    overrideFlags.main_completed = true;
  }
  if (ov.verified_count !== undefined) {
    merged.verified_count = ov.verified_count;
    overrideFlags.verified_count = true;
  }
  if (ov.created_count !== undefined) {
    merged.created_count = ov.created_count;
    overrideFlags.created_count = true;
  }
  if (ov.score !== undefined) {
    merged.score = ov.score;
    overrideFlags.score = true;
  }
  if (ov.hardest_demon_id !== undefined) {
    if (ov.hardest_demon_id === null) {
      merged.hardest_demon = undefined;
    } else {
      const d = demons.find((x) => x.id === ov.hardest_demon_id);
      merged.hardest_demon = d
        ? {
            id: d.id,
            name: d.name,
            rank: d.rank,
            creator: d.creator,
            thumbnail: thumbnailFor(d.video, d.thumbnail),
          }
        : undefined;
    }
    overrideFlags.hardest_demon = true;
  }

  if (Object.keys(overrideFlags).length > 0) {
    merged._override = overrideFlags;
  }
  return merged;
}

/**
 * Leaderboard — wszyscy gracze posortowani po effective score malejąco.
 * Używa `getEffectiveStats` per gracz, więc honoruje ręczne nadpisania.
 */
export function getDemonlistLeaderboard(): LeaderboardEntry[] {
  const leaderboardMap = new Map<string, LeaderboardEntry>();

  for (const d of readDemons()) {
    for (const v of d.victors || []) {
      const key = (v.player || '').toLowerCase();
      if (!key) continue;
      if (!leaderboardMap.has(key)) {
        leaderboardMap.set(key, {
          player: v.player,
          score: 0,
          main_completed: 0,
          verified_count: 0,
          rank: 0,
          _override: { score: false, main_completed: false, verified_count: false },
        });
      }
      const e = leaderboardMap.get(key)!;
      if (v.isVerifier) e.verified_count += 1;
      else if (!v.is_potential) {
        e.main_completed += 1;
        e.score += 100 * (1 - (d.rank - 1) / 100);
      }
    }
  }

  const arr: LeaderboardEntry[] = Array.from(leaderboardMap.values()).map((e) => ({
    ...e,
    _override: { ...(e._override ?? {}) },
  }));
  // Zastosuj nadpisania do score i counts
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { readStatsOverrides } = require('./stats-overrides') as typeof import('./stats-overrides');
  const all = readStatsOverrides();
  for (const ov of all) {
    const key = (ov.player || '').toLowerCase();
    const entry = arr.find((e) => e.player.toLowerCase() === key);
    if (!entry) continue;
    if (!entry._override) entry._override = {};
    if (ov.score !== undefined) {
      entry.score = ov.score;
      entry._override.score = true;
    }
    if (ov.main_completed !== undefined) {
      entry.main_completed = ov.main_completed;
      entry._override.main_completed = true;
    }
    if (ov.verified_count !== undefined) {
      entry.verified_count = ov.verified_count;
      entry._override.verified_count = true;
    }
  }
  arr.sort((a, b) => b.score - a.score);
  arr.forEach((e, i) => (e.rank = i + 1));
  return arr;
}
