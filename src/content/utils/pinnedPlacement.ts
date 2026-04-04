export type Placement = 'right' | 'below' | 'above' | 'left' | 'fallback';

export type PlacementResult = {
  /** X position (document coords when sticky=false, viewport coords when sticky=true) */
  x: number;
  /** Y position (document coords when sticky=false, viewport coords when sticky=true) */
  y: number;
  placement: Placement;
  /** When true, note should use position:fixed (viewport coords) for smooth sticky */
  sticky: boolean;
};

export type PlacementInput = {
  /** Element's bounding rect in document coordinates */
  elementRect: { top: number; bottom: number; left: number; right: number };
  /** Note dimensions */
  noteWidth: number;
  noteHeight: number;
  /** Viewport dimensions */
  viewportWidth: number;
  viewportHeight: number;
  /** Current scroll position */
  scrollX: number;
  scrollY: number;
  /** Gap between element and note */
  gap?: number;
};

/**
 * Calculate the Y position for side placements (right/left) in document coords.
 *
 * Behaves like CSS position:sticky — the note aligns to the element top,
 * but sticks to the viewport top edge when the element extends above the viewport.
 * The note exits with the element when it scrolls fully off-screen.
 */
type SideYResult = { y: number; sticky: boolean };

const computeSideY = (
  elementRect: PlacementInput['elementRect'],
  noteHeight: number,
  scrollX: number,
  scrollY: number,
  viewportHeight: number,
  gap: number,
): SideYResult => {
  // Viewport range in document coordinates
  const vpDocTop = scrollY;
  const vpDocBottom = scrollY + viewportHeight;

  // Element is fully off-screen — follow it (document coords, not sticky)
  const elementOverlapsViewport = elementRect.bottom > vpDocTop && elementRect.top < vpDocBottom;
  if (!elementOverlapsViewport) return { y: elementRect.top, sticky: false };

  // Is element top above viewport? → sticky mode
  if (elementRect.top < vpDocTop + gap) {
    // Return viewport coords (for position:fixed) — gap from top
    return { y: gap, sticky: true };
  }

  // Element top is in viewport — follow it (document coords)
  return { y: elementRect.top, sticky: false };
};

/**
 * Compute the best position for a pinned note relative to its target element.
 * All coordinates are in document space (for position:absolute).
 *
 * Priority: right → below → above → left → fallback (right with X clamped)
 *
 * Placement decisions use viewport-relative positions to determine which
 * direction has space, but the returned x/y are document coordinates.
 */
export const computePinnedPlacement = (input: PlacementInput): PlacementResult => {
  const { elementRect, noteWidth, noteHeight, viewportWidth, viewportHeight, scrollX, scrollY, gap = 8 } = input;

  // Convert element rect to viewport coordinates for space checks
  const vpRect = {
    top: elementRect.top - scrollY,
    bottom: elementRect.bottom - scrollY,
    left: elementRect.left - scrollX,
    right: elementRect.right - scrollX,
  };

  const side = () => computeSideY(elementRect, noteHeight, scrollX, scrollY, viewportHeight, gap);

  // Helper: build result with sideY, converting X to match sticky mode
  const sideResult = (docX: number, placement: Placement): PlacementResult => {
    const { y, sticky } = side();
    const x = sticky ? docX - scrollX : docX;
    return { x, y, placement, sticky };
  };

  // 1. Right side of element
  if (vpRect.right + gap + noteWidth <= viewportWidth) {
    return sideResult(elementRect.right + gap, 'right');
  }

  // 2. Below element (always absolute — no sticky needed)
  if (vpRect.bottom + gap + noteHeight <= viewportHeight) {
    const vpX = Math.max(0, Math.min(vpRect.left, viewportWidth - noteWidth));
    return { x: scrollX + vpX, y: elementRect.bottom + gap, placement: 'below', sticky: false };
  }

  // 3. Above element (always absolute)
  if (vpRect.top - gap - noteHeight >= 0) {
    const vpX = Math.max(0, Math.min(vpRect.left, viewportWidth - noteWidth));
    return { x: scrollX + vpX, y: elementRect.top - noteHeight - gap, placement: 'above', sticky: false };
  }

  // 4. Left side of element
  if (vpRect.left - gap - noteWidth >= 0) {
    return sideResult(elementRect.left - noteWidth - gap, 'left');
  }

  // 5. Fallback: right side, clamp X to viewport
  const vpFallbackX = Math.max(gap, Math.min(vpRect.right + gap, viewportWidth - noteWidth - gap));
  return sideResult(scrollX + vpFallbackX, 'fallback');
};
