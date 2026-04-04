import { resolveElementByXPath } from '@/content/utils/xpath';
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import type { Selection } from '@/shared/types/Selection';

/** Document-coordinate rect of the tracked element */
export type DocRect = {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
};

type ElementTrackResult = {
  /** Element rect in document coordinates, null if not found */
  docRect: DocRect | null;
  /** Whether the element was found in the DOM */
  elementFound: boolean;
  /** Whether XPath resolution failed after all retries */
  resolveFailed: boolean;
};

type TrackerState = {
  docRect: DocRect | null;
  elementFound: boolean;
  resolveFailed: boolean;
};

const EMPTY_STATE: TrackerState = { docRect: null, elementFound: false, resolveFailed: false };

const MAX_RETRY_ATTEMPTS = 10;
const RETRY_INTERVAL_MS = 500;

const toDocRect = (el: Element): DocRect => {
  const r = el.getBoundingClientRect();
  return {
    top: r.top + window.scrollY,
    bottom: r.bottom + window.scrollY,
    left: r.left + window.scrollX,
    right: r.right + window.scrollX,
    width: r.width,
    height: r.height,
  };
};

const docRectEqual = (a: DocRect | null, b: DocRect | null): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
};

/**
 * Tracks a DOM element's position by resolving its XPath from a Selection.
 * Returns document coordinates so the note can use position:absolute and
 * let the browser handle scroll tracking natively.
 *
 * Updates only on: ResizeObserver, MutationObserver, window resize.
 * No scroll listener needed — position:absolute handles scrolling.
 */
export const useElementTracker = (selection: Selection | undefined): ElementTrackResult => {
  const stateRef = useRef<TrackerState>(EMPTY_STATE);
  const listenersRef = useRef<Set<() => void>>(new Set());
  const elementRef = useRef<Element | null>(null);

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

  const updateDocRect = useCallback(() => {
    if (!elementRef.current) {
      if (stateRef.current !== EMPTY_STATE) {
        stateRef.current = EMPTY_STATE;
        notify();
      }
      return;
    }

    const newRect = toDocRect(elementRef.current);
    if (!docRectEqual(stateRef.current.docRect, newRect)) {
      stateRef.current = { docRect: newRect, elementFound: true, resolveFailed: false };
      notify();
    }
  }, [notify]);

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
      stateRef.current = { docRect: toDocRect(element), elementFound: true, resolveFailed: false };
      notify();

      // Observe element resize (layout changes)
      resizeObserver = new ResizeObserver(updateDocRect);
      resizeObserver.observe(element);

      // Observe window resize (viewport changes)
      window.addEventListener('resize', updateDocRect, { passive: true });

      // Observe DOM mutations on the element's parent to detect removal
      mutationObserver = new MutationObserver(() => {
        if (!document.contains(element)) {
          elementRef.current = null;
          if (stateRef.current !== EMPTY_STATE) {
            stateRef.current = EMPTY_STATE;
            notify();
          }
        } else {
          updateDocRect();
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
        stateRef.current = { docRect: null, elementFound: false, resolveFailed: true };
        notify();
      }
    };

    attemptResolve();

    return () => {
      cleaned = true;
      if (retryTimerId !== null) clearTimeout(retryTimerId);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener('resize', updateDocRect);
      elementRef.current = null;
    };
  }, [xpath, updateDocRect, notify]);

  const state = useSyncExternalStore(subscribe, getSnapshot);
  return state;
};
