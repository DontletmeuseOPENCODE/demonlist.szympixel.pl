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
}

export interface LeaderboardEntry {
  player: string;
  score: number;
  rank: number;
  main_completed: number;
  verified_count: number;
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
      } else {
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
 * Leaderboard — wszyscy gracze posortowani po score malejąco.
 */
export function getDemonlistLeaderboard(): LeaderboardEntry[] {
  const demons = readDemons();
  const playerMap = new Map<string, { score: number; main: number; verified: number; display: string }>();

  for (const d of demons) {
    for (const v of d.victors || []) {
      const key = (v.player || '').toLowerCase();
      if (!key) continue;
      if (!playerMap.has(key)) {
        playerMap.set(key, { score: 0, main: 0, verified: 0, display: v.player });
      }
      const entry = playerMap.get(key)!;
      if (v.isVerifier) {
        entry.verified += 1;
      } else {
        entry.main += 1;
        entry.score += 100 * (1 - (d.rank - 1) / 100);
      }
    }
  }

  const arr = Array.from(playerMap.entries()).map(([key, e]) => ({
    player: e.display,
    score: e.score,
    main_completed: e.main,
    verified_count: e.verified,
    rank: 0,
  }));
  arr.sort((a, b) => b.score - a.score);
  arr.forEach((e, i) => (e.rank = i + 1));
  return arr;
}
