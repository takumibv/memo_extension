export type Placement = 'right' | 'below' | 'above' | 'left' | 'fallback';

export type PlacementResult = {
  x: number;
  y: number;
  placement: Placement;
};

export type PlacementInput = {
  /** Element's bounding rect (viewport coords) */
  elementRect: { top: number; bottom: number; left: number; right: number };
  /** Note dimensions */
  noteWidth: number;
  noteHeight: number;
  /** Viewport dimensions */
  viewportWidth: number;
  viewportHeight: number;
  /** Gap between element and note */
  gap?: number;
};

/**
 * Calculate the Y position for side placements (right/left).
 *
 * - Normal: aligns to element top, scrolls off-screen with element
 * - Sticky: when element is large and its top is above viewport,
 *   the note sticks to viewport top (y=0) as long as element is
 *   still partially visible. Once element scrolls fully off-screen,
 *   the note follows it out.
 */
const computeSideY = (
  elementRect: PlacementInput['elementRect'],
  noteHeight: number,
  viewportHeight: number,
  gap: number,
): number => {
  // Element is fully off-screen — follow it
  const elementOverlapsViewport = elementRect.bottom > 0 && elementRect.top < viewportHeight;
  if (!elementOverlapsViewport) return elementRect.top;

  // Sticky: clamp top to gap (keep margin from viewport top)
  return Math.max(gap, elementRect.top);
};

/**
 * Compute the best position for a pinned note relative to its target element.
 *
 * Priority: right → below → above → left → fallback (right with X clamped)
 *
 * The note should:
 * - Never overlap the target element when possible
 * - Behave like sticky positioning on the Y axis for side placements
 * - Stay within viewport bounds on X axis
 */
export const computePinnedPlacement = (input: PlacementInput): PlacementResult => {
  const { elementRect, noteWidth, noteHeight, viewportWidth, viewportHeight, gap = 8 } = input;

  const sideY = () => computeSideY(elementRect, noteHeight, viewportHeight, gap);

  // 1. Right side of element
  const rightX = elementRect.right + gap;
  if (rightX + noteWidth <= viewportWidth) {
    return { x: rightX, y: sideY(), placement: 'right' };
  }

  // 2. Below element
  const belowY = elementRect.bottom + gap;
  if (belowY + noteHeight <= viewportHeight) {
    const x = Math.min(elementRect.left, viewportWidth - noteWidth);
    return { x: Math.max(0, x), y: belowY, placement: 'below' };
  }

  // 3. Above element
  const aboveY = elementRect.top - noteHeight - gap;
  if (aboveY >= 0) {
    const x = Math.min(elementRect.left, viewportWidth - noteWidth);
    return { x: Math.max(0, x), y: aboveY, placement: 'above' };
  }

  // 4. Left side of element
  const leftX = elementRect.left - noteWidth - gap;
  if (leftX >= 0) {
    return { x: leftX, y: sideY(), placement: 'left' };
  }

  // 5. Fallback: right side but clamp X to viewport edge with margin
  const fallbackX = Math.min(rightX, viewportWidth - noteWidth - gap);
  return { x: Math.max(gap, fallbackX), y: sideY(), placement: 'fallback' };
};
