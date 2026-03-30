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

/**
 * Tracks a DOM element's position by resolving its XPath from a Selection.
 * Updates position on scroll, resize, and DOM mutations.
 * Retries XPath resolution if element not found initially (handles dynamic DOM).
 */
export const useElementTracker = (selection: Selection | undefined): ElementTrackResult => {
  const stateRef = useRef<TrackerState>(EMPTY_STATE);
  const listenersRef = useRef<Set<() => void>>(new Set());
  const elementRef = useRef<Element | null>(null);
  const rafRef = useRef<number>(0);

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
    if (elementRef.current) {
      const newRect = elementRef.current.getBoundingClientRect();
      const prev = stateRef.current.rect;
      // Only update if position/size actually changed to avoid excessive re-renders
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
    } else if (stateRef.current !== EMPTY_STATE) {
      stateRef.current = EMPTY_STATE;
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
    let cleaned = false;

    const startTracking = (element: Element) => {
      elementRef.current = element;
      stateRef.current = { rect: element.getBoundingClientRect(), element, elementFound: true, resolveFailed: false };
      notify();

      // Observe resize
      resizeObserver = new ResizeObserver(scheduleUpdate);
      resizeObserver.observe(element);

      // Listen to scroll (passive for performance)
      window.addEventListener('scroll', scheduleUpdate, { passive: true });
      window.addEventListener('resize', scheduleUpdate, { passive: true });

      // Observe DOM mutations on the element's parent to detect removal
      // Uses scheduleUpdate (RAF-throttled) to batch rapid DOM changes
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

      // Retry if element not found yet (DOM may still be loading)
      retryCount++;
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        retryTimerId = setTimeout(attemptResolve, RETRY_INTERVAL_MS);
      } else {
        // Give up — element not found after all retries
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
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      elementRef.current = null;
    };
  }, [xpath, scheduleUpdate, notify]);

  const state = useSyncExternalStore(subscribe, getSnapshot);
  return state;
};
