'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 200,
}: UseInfiniteScrollOptions) {
  const observerTarget = useRef<HTMLDivElement | null>(null);

  const handleScroll = useCallback(() => {
    if (!observerTarget.current || isLoading || !hasMore) return;

    const rect = observerTarget.current.getBoundingClientRect();
    const isNearBottom = rect.top <= window.innerHeight + threshold;

    if (isNearBottom) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore, threshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return { observerTarget };
}
