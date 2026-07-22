'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Demon } from '@/lib/yaml';
import { useRouter } from 'next/navigation';

interface Props {
  initialDemons: Demon[];
  /** Element renderowany dla każdego demona (po lewej stronie, w komórce drag-handle). */
  renderLeft?: (demon: Demon) => React.ReactNode;
  /** Element renderowany po prawej (zazwyczaj akcje). */
  renderRight?: (demon: Demon) => React.ReactNode;
  /** Klasy dodatkowe na wrap. */
  className?: string;
}

const ROW_HEIGHT = 56; // przybliżona wysokość wiersza tabelki, do snap-to-row

export default function DemonDragList({ initialDemons, renderLeft, renderRight, className }: Props) {
  const router = useRouter();
  const [order, setOrder] = useState<Demon[]>(initialDemons);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverDir, setDragOverDir] = useState<{ id: number; dir: 'up' | 'down' } | null>(null);
  const [saving, setSaving] = useState(false);
  const startY = useRef<number>(0);
  const draggedEl = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setOrder(initialDemons);
  }, [initialDemons]);

  const onPointerDown = useCallback((e: React.PointerEvent, id: number) => {
    e.preventDefault();
    setDraggingId(id);
    startY.current = e.clientY;
    draggedEl.current = (e.currentTarget as HTMLElement).closest('.drag-row') as HTMLElement;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (draggingId === null) return;
    const dy = e.clientY - startY.current;
    const steps = Math.round(dy / ROW_HEIGHT);
    if (steps === 0) {
      setDragOverDir(null);
      return;
    }
    const fromIdx = order.findIndex((d) => d.id === draggingId);
    let toIdx = fromIdx + steps;
    toIdx = Math.max(0, Math.min(order.length - 1, toIdx));
    if (toIdx === fromIdx) {
      setDragOverDir(null);
      return;
    }
    setDragOverDir({ id: order[toIdx].id, dir: steps > 0 ? 'up' : 'down' });
  }, [draggingId, order]);

  const onPointerUp = useCallback(async (e: React.PointerEvent) => {
    if (draggingId === null) return;
    const dy = e.clientY - startY.current;
    const steps = Math.round(dy / ROW_HEIGHT);
    const fromIdx = order.findIndex((d) => d.id === draggingId);
    let toIdx = fromIdx + steps;
    toIdx = Math.max(0, Math.min(order.length - 1, toIdx));
    setDraggingId(null);
    setDragOverDir(null);
    draggedEl.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);

    if (toIdx === fromIdx) return;
    const newOrder = [...order];
    const [moved] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, moved);
    setOrder(newOrder);

    setSaving(true);
    try {
      const res = await fetch('/api/demons/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder.map((d) => d.id) }),
      });
      if (!res.ok) throw new Error('Błąd zapisu');
      router.refresh();
    } catch (err) {
      // rollback
      setOrder(order);
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [draggingId, order, router]);

  return (
    <div className={className}>
      {saving && <div className="stats-empty" style={{ marginBottom: '0.5rem' }}>Zapisuję nową kolejność…</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {order.map((d) => {
          const isDragging = d.id === draggingId;
          const overDir = dragOverDir?.id === d.id ? dragOverDir.dir : null;
          return (
            <div
              key={d.id}
              className={`drag-row demon-card ${isDragging ? 'dragging' : ''} ${overDir === 'down' ? 'drag-over-down' : ''} ${overDir === 'up' ? 'drag-over-up' : ''}`}
              style={{ position: 'relative' }}
            >
              <div
                className="drag-handle"
                onPointerDown={(e) => onPointerDown(e, d.id)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                title="Przeciągnij, aby zmienić pozycję"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="4" cy="3" r="1.4" />
                  <circle cx="4" cy="8" r="1.4" />
                  <circle cx="4" cy="13" r="1.4" />
                  <circle cx="12" cy="3" r="1.4" />
                  <circle cx="12" cy="8" r="1.4" />
                  <circle cx="12" cy="13" r="1.4" />
                </svg>
              </div>
              {renderLeft && renderLeft(d)}
              {renderRight && (
                <div style={{ marginLeft: 'auto' }}>{renderRight(d)}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
