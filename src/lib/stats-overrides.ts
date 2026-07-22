import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Ręczne nadpisanie statystyk gracza widocznych w /stats i /players/[name].
 * Każde pole opcjonalne — brak pola = użyj wartości obliczonej z YAML.
 * Ustawienie `hardest_demon_id: null` oznacza "brak hardest" (wymuszone).
 */
export interface StatsOverride {
  player: string;
  main_completed?: number;
  verified_count?: number;
  created_count?: number;
  score?: number;
  /** null = "Brak" wymuszone; liczba = id demona; undefined = obliczaj */
  hardest_demon_id?: number | null;
}

const OVERRIDES_PATH = path.join(process.cwd(), 'data', 'stats-overrides.yml');

export function readStatsOverrides(): StatsOverride[] {
  if (!fs.existsSync(OVERRIDES_PATH)) {
    return [];
  }
  const raw = fs.readFileSync(OVERRIDES_PATH, 'utf8');
  const data = yaml.load(raw) as StatsOverride[] | null;
  return data || [];
}

export function writeStatsOverrides(arr: StatsOverride[]): void {
  const raw = yaml.dump(arr, { lineWidth: -1, quotingType: '"' });
  fs.writeFileSync(OVERRIDES_PATH, raw, 'utf8');
}

/** Zwraca override dla gracza (case-insensitive lookup), albo null. */
export function getStatsOverride(player: string): StatsOverride | null {
  const all = readStatsOverrides();
  const target = (player || '').toLowerCase();
  return all.find((o) => (o.player || '').toLowerCase() === target) ?? null;
}

/**
 * Scal nowe pola z istniejącym wpisem dla gracza (albo tworzy nowy wpis).
 * Aby wyczyścić pole, wyślij `undefined` — zostanie usunięte z wpisu.
 * Wyjątek: `hardest_demon_id: null` (czyszczenie) vs `undefined` (nie ruszaj).
 */
export function setStatsOverride(player: string, fields: Partial<StatsOverride>): StatsOverride {
  const all = readStatsOverrides();
  const target = (player || '').trim();
  const idx = all.findIndex((o) => (o.player || '').toLowerCase() === target.toLowerCase());

  const current = idx >= 0 ? { ...all[idx] } : { player: target };
  const next: StatsOverride = { player: target };

  const keys: (keyof StatsOverride)[] = ['main_completed', 'verified_count', 'created_count', 'score', 'hardest_demon_id'];
  for (const k of keys) {
    if (!(k in fields)) continue;
    const v = (fields as any)[k];
    if (v === undefined) {
      // nie ruszaj istniejącego pola
      if (k in current) (next as any)[k] = (current as any)[k];
    } else {
      (next as any)[k] = v;
    }
  }

  // Zachowaj pozostałe pola jeśli nie było ich w `fields`
  for (const k of keys) {
    if (!(k in next) && k in current) (next as any)[k] = (current as any)[k];
  }

  if (idx >= 0) {
    all[idx] = next;
  } else {
    all.push(next);
  }
  writeStatsOverrides(all);
  return next;
}

/** Usuwa cały wpis dla gracza — wraca do obliczania. */
export function clearStatsOverride(player: string): boolean {
  const all = readStatsOverrides();
  const target = (player || '').toLowerCase();
  const next = all.filter((o) => (o.player || '').toLowerCase() !== target);
  if (next.length === all.length) return false;
  writeStatsOverrides(next);
  return true;
}

/** Resetuje wszystkie nadpisania. */
export function clearAllStatsOverrides(): void {
  writeStatsOverrides([]);
}