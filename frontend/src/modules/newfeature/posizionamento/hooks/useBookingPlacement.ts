"use client";

import { useState, useEffect } from 'react';
import { placementService } from '../service/placement.service';

export function useBookingPlacement(
  bookingId: number | undefined,
  showPosizionamento: boolean,
  initialPlacementFallback: any
) {
  const [placement, setPlacement] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setPlacement(null);
      return;
    }

    if (showPosizionamento) {
      setLoading(true);
      placementService.getByBookingId(bookingId)
        .then((dbPlacement) => {
          if (dbPlacement) {
            setPlacement({
              view: dbPlacement.view || 'FRONT',
              zone: dbPlacement.bodyZone,
              x: dbPlacement.x,
              y: dbPlacement.y,
              sizeCm: dbPlacement.sizeWidth || 15,
              notes: dbPlacement.notes || '',
            });
          } else {
            setPlacement(initialPlacementFallback || null);
          }
        })
        .catch(() => {
          setPlacement(initialPlacementFallback || null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setPlacement(initialPlacementFallback || null);
    }
  }, [bookingId, showPosizionamento, initialPlacementFallback]);

  const savePlacement = async (targetBookingId: number) => {
    if (!showPosizionamento || !placement) return null;
    
    setLoading(true);
    try {
      const saved = await placementService.save(targetBookingId, {
        bodyZone: placement.zone || 'Corpo Generico',
        view: placement.view || 'FRONT',
        x: placement.x,
        y: placement.y,
        sizeWidth: placement.sizeCm,
        notes: placement.notes,
      });
      return saved;
    } catch (err) {
      console.error('Failed to save placement:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    placement,
    setPlacement,
    loading,
    savePlacement,
  };
}
