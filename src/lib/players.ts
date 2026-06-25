import { readDemons } from './yaml';

/**
 * Zwraca unikalne nicki holderów ze wszystkich demonów.
 * Deduplikacja case-insensitive, ale zwraca oryginalną pisownię (pierwsze wystąpienie).
 * Służy do autocomplete w formularzu zgłoszenia victora.
 */
export function listAllPlayers(): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const demon of readDemons()) {
    for (const v of demon.victors || []) {
      const key = v.player.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(v.player);
      }
    }
  }
  return result.sort((a, b) => a.localeCompare(b));
}