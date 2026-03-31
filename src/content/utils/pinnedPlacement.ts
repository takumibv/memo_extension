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
 * - Element fully on-screen: align to element top
 * - Element partially visible (taller than viewport): clamp to visible portion
 * - Element fully off-screen: return raw element top (note goes off-screen too)
 *
 * For small elements scrolled partially off-screen, the note follows
 * the element's visible edge rather than staying pinned to a hidden top.
 */
const computeSideY = (
  elementRect: PlacementInput['elementRect'],
  noteHeight: number,
  viewportHeight: number,
): number => {
  const visibleTop = Math.max(0, elementRect.top);
  const visibleBottom = Math.min(viewportHeight, elementRect.bottom);

  // Element is fully off-screen (no overlap with viewport)
  if (visibleTop >= visibleBottom) return elementRect.top;

  // Element is fully within viewport — align to element top
  if (elementRect.top >= 0 && elementRect.bottom <= viewportHeight) {
    return elementRect.top;
  }

  // Element is partially visible — clamp note to visible portion
  // Ensure note stays within viewport bounds
  const y = Math.max(0, Math.min(visibleTop, visibleBottom - noteHeight));
  return Math.min(y, viewportHeight - noteHeight);
};

/**
 * Compute the best position for a pinned note relative to its target element.
 *
 * Priority: right → below → above → left → fallback (right with X clamped)
 *
 * The note should:
 * - Never overlap the target element when possible
 * - Stay within viewport bounds (X axis always clamped, Y follows element visibility)
 * - Move off-screen when the element is fully off-screen
 */
export const computePinnedPlacement = (input: PlacementInput): PlacementResult => {
  const { elementRect, noteWidth, noteHeight, viewportWidth, viewportHeight, gap = 8 } = input;

  const sideY = () => computeSideY(elementRect, noteHeight, viewportHeight);

  // 1. Right side of element
  const rightX = elementRect.right + gap;
  if (rightX + noteWidth <= viewportWidth) {
    return { x: rightX, y: sideY(), placement: 'right' };
  }

  // 2. Below element
  const belowY = elementRect.bottom + gap;
  if (belowY + noteHeight <= viewportHeight) {
    // Clamp X to viewport
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
