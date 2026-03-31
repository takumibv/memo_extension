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
 * Simply aligns to element top — scrolls off-screen with the element.
 */
const computeSideY = (elementRect: PlacementInput['elementRect']): number => {
  return elementRect.top;
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

  const sideY = () => computeSideY(elementRect);

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

  // 5. Fallback: right side but clamp X to viewport edge
  const fallbackX = Math.min(rightX, viewportWidth - noteWidth);
  return { x: Math.max(0, fallbackX), y: sideY(), placement: 'fallback' };
};
