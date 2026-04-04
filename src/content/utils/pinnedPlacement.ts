export type Placement = 'right' | 'below' | 'above' | 'left' | 'fallback';

export type PlacementResult = {
  /** X position in document coordinates */
  x: number;
  /** Y position in document coordinates */
  y: number;
  placement: Placement;
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
const computeSideY = (
  elementRect: PlacementInput['elementRect'],
  noteHeight: number,
  scrollY: number,
  viewportHeight: number,
  gap: number,
): number => {
  // Viewport range in document coordinates
  const vpDocTop = scrollY;
  const vpDocBottom = scrollY + viewportHeight;

  // Element is fully off-screen — follow it
  const elementOverlapsViewport = elementRect.bottom > vpDocTop && elementRect.top < vpDocBottom;
  if (!elementOverlapsViewport) return elementRect.top;

  // Viewport clamp boundaries with gap margin
  const clampTop = vpDocTop + gap;
  const clampBottom = vpDocTop + viewportHeight - noteHeight - gap;

  // Ideal: align to element top
  let y = elementRect.top;

  // Sticky top: keep gap margin from viewport top
  y = Math.max(clampTop, y);

  // Don't overflow below viewport (if note fits in viewport)
  if (clampBottom >= clampTop) {
    y = Math.min(y, clampBottom);
  }

  // Anchor: note must not float independently of element
  y = Math.max(y, elementRect.top);

  return y;
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

  const sideY = () => computeSideY(elementRect, noteHeight, scrollY, viewportHeight, gap);

  // 1. Right side of element
  if (vpRect.right + gap + noteWidth <= viewportWidth) {
    return { x: elementRect.right + gap, y: sideY(), placement: 'right' };
  }

  // 2. Below element
  if (vpRect.bottom + gap + noteHeight <= viewportHeight) {
    const vpX = Math.max(0, Math.min(vpRect.left, viewportWidth - noteWidth));
    return { x: scrollX + vpX, y: elementRect.bottom + gap, placement: 'below' };
  }

  // 3. Above element
  if (vpRect.top - gap - noteHeight >= 0) {
    const vpX = Math.max(0, Math.min(vpRect.left, viewportWidth - noteWidth));
    return { x: scrollX + vpX, y: elementRect.top - noteHeight - gap, placement: 'above' };
  }

  // 4. Left side of element
  if (vpRect.left - gap - noteWidth >= 0) {
    return { x: elementRect.left - noteWidth - gap, y: sideY(), placement: 'left' };
  }

  // 5. Fallback: right side, clamp X to viewport
  const vpFallbackX = Math.max(gap, Math.min(vpRect.right + gap, viewportWidth - noteWidth - gap));
  return { x: scrollX + vpFallbackX, y: sideY(), placement: 'fallback' };
};
