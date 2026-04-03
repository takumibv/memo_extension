/**
 * Parse a hex color (#RGB, #RRGGBB, or #RRGGBBAA) to [r, g, b] (0-255).
 */
const parseHex = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  if (h.length <= 4) {
    const r = h.charAt(0);
    const g = h.charAt(1);
    const b = h.charAt(2);
    return [parseInt(r + r, 16), parseInt(g + g, 16), parseInt(b + b, 16)];
  }
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

/**
 * WCAG 2.1 relative luminance.
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
const relativeLuminance = (r: number, g: number, b: number): number => {
  const linearize = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const rs = linearize(r / 255);
  const gs = linearize(g / 255);
  const bs = linearize(b / 255);
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * WCAG 2.1 contrast ratio between two colors.
 * Returns a value between 1 (no contrast) and 21 (max contrast).
 */
const contrastRatio = (l1: number, l2: number): number => {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if a hex background color is "dark" (should use light text).
 * Uses WCAG contrast ratio: picks whichever text color (white or black)
 * gives better contrast against the background.
 */
export const isDarkColor = (hex: string): boolean => {
  const [r, g, b] = parseHex(hex);
  const bgLum = relativeLuminance(r, g, b);
  const whiteContrast = contrastRatio(1, bgLum); // white luminance = 1
  const blackContrast = contrastRatio(bgLum, 0); // black luminance = 0
  return whiteContrast > blackContrast;
};

/**
 * Generate a complete color palette for text/UI on a given background color.
 * All colors are chosen to have sufficient contrast against the background.
 */
export const getNoteColors = (bgColor: string) => {
  const dark = isDarkColor(bgColor);
  return {
    dark,
    textColor: dark ? '#f9fafb' : '#111827',
    subTextColor: dark ? 'rgba(255,255,255,0.7)' : 'rgba(55,65,81,1)',
    placeholderColor: dark ? 'rgba(255,255,255,0.45)' : 'rgba(107,114,128,1)',
    borderColor: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)',
    iconColor: dark ? 'rgba(255,255,255,0.6)' : 'rgba(75,85,99,1)',
    activeIconColor: dark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)',
  };
};
