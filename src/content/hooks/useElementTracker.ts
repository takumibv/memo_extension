import { resolveElementByXPath } from '@/content/utils/xpath';
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import type { Selection } from '@/shared/types/Selection';

type ElementTrackResult = {
  /** Current bounding rect in viewport coords, null if element not found */
  rect: DOMRect | null;
  /** The resolved DOM element, null if not found */
  element: Element | null;
  /** Whether the element was found in the DOM */
  elementFound: boolean;
  /** Whether XPath resolution failed after all retries */
  resolveFailed: boolean;
};

type TrackerState = {
  rect: DOMRect | null;
  element: Element | null;
  elementFound: boolean;
  resolveFailed: boolean;
};

const EMPTY_STATE: TrackerState = { rect: null, element: null, elementFound: false, resolveFailed: false };

const MAX_RETRY_ATTEMPTS = 10;
const RETRY_INTERVAL_MS = 500;

// Viewport margin for IntersectionObserver — start updating slightly before element enters viewport
const VIEWPORT_MARGIN = '200px';

// ===== Shared scroll/resize listener =====
// All tracker instances share a single scroll/resize listener to avoid N listeners for N notes.
const scrollCallbacks = new Set<() => void>();
let scrollListenerActive = false;

const onScrollOrResize = () => {
  for (const cb of scrollCallbacks) cb();
};

const addScrollCallback = (cb: () => void) => {
  scrollCallbacks.add(cb);
  if (!scrollListenerActive) {
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    scrollListenerActive = true;
  }
};

const removeScrollCallback = (cb: () => void) => {
  scrollCallbacks.delete(cb);
  if (scrollCallbacks.size === 0 && scrollListenerActive) {
    window.removeEventListener('scroll', onScrollOrResize);
    window.removeEventListener('resize', onScrollOrResize);
    scrollListenerActive = false;
  }
};

/**
 * Tracks a DOM element's position by resolving its XPath from a Selection.
 *
 * Performance optimizations:
 * - IntersectionObserver skips updates when element is far off-screen
 * - Shared scroll/resize listener (1 listener for all tracker instances)
 * - RAF-throttled updates (max 1 getBoundingClientRect per frame per element)
 * - Rect value comparison to avoid unnecessary re-renders
 */
export const useElementTracker = (selection: Selection | undefined): ElementTrackResult => {
  const stateRef = useRef<TrackerState>(EMPTY_STATE);
  const listenersRef = useRef<Set<() => void>>(new Set());
  const elementRef = useRef<Element | null>(null);
  const rafRef = useRef<number>(0);
  const isNearViewportRef = useRef(false);

  // Stabilize the xpath to avoid effect re-runs when selection object reference changes
  const xpath = selection?.target.kind === 'element' ? selection.target.xpath : undefined;

  const notify = useCallback(() => {
    for (const listener of listenersRef.current) {
      listener();
    }
  }, []);

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const getSnapshot = useCallback(() => stateRef.current, []);

  const updateRect = useCallback(() => {
    if (!elementRef.current) {
      if (stateRef.current !== EMPTY_STATE) {
        stateRef.current = EMPTY_STATE;
        notify();
      }
      return;
    }

    // Skip expensive getBoundingClientRect when element is far off-screen
    if (!isNearViewportRef.current) return;

    const newRect = elementRef.current.getBoundingClientRect();
    const prev = stateRef.current.rect;
    if (
      !prev ||
      prev.top !== newRect.top ||
      prev.left !== newRect.left ||
      prev.width !== newRect.width ||
      prev.height !== newRect.height
    ) {
      stateRef.current = { rect: newRect, element: elementRef.current, elementFound: true, resolveFailed: false };
      notify();
    }
  }, [notify]);

  const scheduleUpdate = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateRect);
  }, [updateRect]);

  useEffect(() => {
    if (!xpath) {
      elementRef.current = null;
      stateRef.current = EMPTY_STATE;
      notify();
      return;
    }

    let retryCount = 0;
    let retryTimerId: ReturnType<typeof setTimeout> | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    let cleaned = false;

    const startTracking = (element: Element) => {
      elementRef.current = element;
      isNearViewportRef.current = true; // assume visible initially
      stateRef.current = { rect: element.getBoundingClientRect(), element, elementFound: true, resolveFailed: false };
      notify();

      // IntersectionObserver with margin to detect near-viewport elements
      intersectionObserver = new IntersectionObserver(
        entries => {
          const entry = entries[0];
          if (!entry) return;
          isNearViewportRef.current = entry.isIntersecting;
          if (entry.isIntersecting) scheduleUpdate();
        },
        { rootMargin: VIEWPORT_MARGIN },
      );
      intersectionObserver.observe(element);

      // Observe resize
      resizeObserver = new ResizeObserver(scheduleUpdate);
      resizeObserver.observe(element);

      // Shared scroll/resize listener
      addScrollCallback(scheduleUpdate);

      // Observe DOM mutations on the element's parent to detect removal
      mutationObserver = new MutationObserver(() => {
        if (!document.contains(element)) {
          elementRef.current = null;
          if (stateRef.current !== EMPTY_STATE) {
            stateRef.current = EMPTY_STATE;
            notify();
          }
        } else {
          scheduleUpdate();
        }
      });

      if (element.parentElement) {
        mutationObserver.observe(element.parentElement, { childList: true, subtree: true });
      }
    };

    const attemptResolve = () => {
      if (cleaned) return;

      const element = resolveElementByXPath(xpath);
      if (element) {
        startTracking(element);
        return;
      }

      retryCount++;
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        retryTimerId = setTimeout(attemptResolve, RETRY_INTERVAL_MS);
      } else {
        stateRef.current = { rect: null, element: null, elementFound: false, resolveFailed: true };
        notify();
      }
    };

    attemptResolve();

    return () => {
      cleaned = true;
      cancelAnimationFrame(rafRef.current);
      if (retryTimerId !== null) clearTimeout(retryTimerId);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      intersectionObserver?.disconnect();
      removeScrollCallback(scheduleUpdate);
      elementRef.current = null;
    };
  }, [xpath, scheduleUpdate, notify]);

  const state = useSyncExternalStore(subscribe, getSnapshot);
  return state;
};
