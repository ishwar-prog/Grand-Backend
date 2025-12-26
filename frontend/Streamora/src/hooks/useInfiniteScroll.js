import { useEffect, useRef, useCallback } from "react";

/**
 * useInfiniteScroll - Triggers callback when element enters viewport
 * @param {Function} onLoadMore - Callback to load more items
 * @param {Object} options - Configuration options
 * @returns {Object} - ref to attach to sentinel element, reset function
 */
const useInfiniteScroll = (onLoadMore, options = {}) => {
  const {
    threshold = 0.1,        // How much of element must be visible (0-1)
    rootMargin = "100px",   // Load before reaching bottom
    enabled = true,         // Enable/disable the observer
    hasMore = true,         // Are there more items to load?
    loading = false,        // Is currently loading?
  } = options;

  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  const handleIntersect = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && enabled && hasMore && !loading) {
        onLoadMore();
      }
    },
    [onLoadMore, enabled, hasMore, loading]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Cleanup previous observer
    observerRef.current?.disconnect();

    // Don't observe if disabled or no more items
    if (!enabled || !hasMore) return;

    observerRef.current = new IntersectionObserver(handleIntersect, {
      root: null, // viewport
      rootMargin,
      threshold,
    });

    observerRef.current.observe(sentinel);

    return () => observerRef.current?.disconnect();
  }, [handleIntersect, threshold, rootMargin, enabled, hasMore]);

  // Reset observer (useful after filter changes)
  const reset = useCallback(() => {
    observerRef.current?.disconnect();
    const sentinel = sentinelRef.current;
    if (sentinel && enabled && hasMore) {
      observerRef.current?.observe(sentinel);
    }
  }, [enabled, hasMore]);

  return { sentinelRef, reset };
};

export default useInfiniteScroll;
