import { NextResponse } from 'next/server';
import { reorderDemons } from '@/lib/yaml';

/**
 * POST /api/demons/reorder
 * Body: { order: number[] } — tablica id w nowej kolejności
 * Wymaga admina.
 */
export async function POST(request: Request) {
  try {
    const { order } = await request.json();
    if (!Array.isArray(order) || !order.every((x) => typeof x === 'number')) {
      return NextResponse.json({ error: 'Nieprawidłowy format order' }, { status: 400 });
    }
    const updated = reorderDemons(order);
    return NextResponse.json({ ok: true, count: updated.length });
  } catch {
    return NextResponse.json({ error: 'Błąd zapisu' }, { status: 500 });
  }
}
