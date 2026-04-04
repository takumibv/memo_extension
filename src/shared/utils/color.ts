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
  return 0.2126 * linearize(r / 255) + 0.7152 * linearize(g / 255) + 0.0722 * linearize(b / 255);
};

/**
 * WCAG 2.1 contrast ratio between two luminances.
 */
const contrastRatio = (l1: number, l2: number): number => {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if a hex background color is "dark" (should use light text).
 */
export const isDarkColor = (hex: string): boolean => {
  const [r, g, b] = parseHex(hex);
  const bgLum = relativeLuminance(r, g, b);
  return contrastRatio(1, bgLum) > contrastRatio(bgLum, 0);
};

/**
 * Generate a complete color palette for text/UI on a given background color.
 * Colors are chosen to maintain sufficient contrast against the background,
 * including mid-tone backgrounds like pastels.
 */
export const getNoteColors = (bgColor: string) => {
  const dark = isDarkColor(bgColor);
  return {
    dark,
    textColor: dark ? '#f9fafb' : '#111827',
    subTextColor: dark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.6)',
    placeholderColor: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
    borderColor: dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
    iconColor: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
    activeIconColor: dark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,0.85)',
  };
};
