/**
 * Keyboard shortcut handling.
 *
 * Internal representation: a serialized string with `+`-separated tokens, e.g.
 *   "Alt+Shift+KeyN", "Ctrl+Digit1", "F5", "Meta+Slash".
 *
 * Modifiers are recorded with `event.code`-style names for letters/digits/etc
 * (layout-independent), and `event.key` for special keys.
 *
 * Empty string means "shortcut disabled" (= OFF).
 */

const MODIFIER_KEYS = new Set(['Control', 'Alt', 'Shift', 'Meta']);

const MODIFIER_ORDER = ['Ctrl', 'Alt', 'Shift', 'Meta'] as const;

type ModifierName = (typeof MODIFIER_ORDER)[number];

const isMacPlatform = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  // navigator.platform is deprecated but still the most reliable on Mac
  return /Mac|iPhone|iPad/.test(navigator.platform);
};

/**
 * Build the "key" portion of a shortcut from a KeyboardEvent.
 * Uses event.code for printable keys (layout-independent),
 * event.key for special keys.
 *
 * Returns null if the event is a pure modifier (no main key yet).
 */
const extractKeyToken = (e: KeyboardEvent): string | null => {
  if (MODIFIER_KEYS.has(e.key)) return null;
  if (e.key === 'Dead' || e.key === 'Unidentified' || e.key === 'Process') return null;

  // event.code is layout-independent for letter/digit/symbol keys.
  // It's "KeyN", "Digit1", "Slash", "Space", "ArrowUp", "F5", "Enter", "Escape", etc.
  if (e.code) return e.code;

  // Fallback: event.key (older browsers / synthetic events)
  if (e.key === ' ') return 'Space';
  return e.key;
};

/**
 * Convert a KeyboardEvent into a serialized shortcut string.
 * Returns null when only modifiers are pressed (waiting for the main key).
 */
export const eventToShortcut = (e: KeyboardEvent): string | null => {
  const key = extractKeyToken(e);
  if (!key) return null;

  const tokens: string[] = [];
  if (e.ctrlKey) tokens.push('Ctrl');
  if (e.altKey) tokens.push('Alt');
  if (e.shiftKey) tokens.push('Shift');
  if (e.metaKey) tokens.push('Meta');
  tokens.push(key);
  return tokens.join('+');
};

/**
 * Compare a runtime KeyboardEvent against a stored shortcut string.
 */
export const matchEvent = (e: KeyboardEvent, shortcut: string): boolean => {
  if (!shortcut) return false;
  const candidate = eventToShortcut(e);
  return candidate === shortcut;
};

/**
 * Format a stored shortcut into a human-readable label, VS Code style.
 *
 * Modifier ordering: Ctrl → Alt → Shift → Meta → Key.
 * On macOS, Meta is rendered as ⌘. Elsewhere as "Win".
 *
 * Examples:
 *   "Alt+Shift+KeyN" → "Alt + Shift + N"
 *   "Meta+Slash" on Mac → "⌘ + /"
 *   "Ctrl+F5"      → "Ctrl + F5"
 */
export const formatShortcut = (shortcut: string, opts?: { isMac?: boolean }): string => {
  if (!shortcut) return '';
  const isMac = opts?.isMac ?? isMacPlatform();

  const parts = shortcut.split('+');
  const modifiers = new Set<ModifierName>();
  let key = '';
  for (const part of parts) {
    if (part === 'Ctrl' || part === 'Alt' || part === 'Shift' || part === 'Meta') {
      modifiers.add(part);
    } else {
      key = part;
    }
  }

  const labels: string[] = [];
  for (const mod of MODIFIER_ORDER) {
    if (!modifiers.has(mod)) continue;
    if (mod === 'Meta') {
      labels.push(isMac ? '⌘' : 'Win');
    } else if (mod === 'Alt') {
      labels.push(isMac ? '⌥' : 'Alt');
    } else if (mod === 'Shift') {
      labels.push(isMac ? '⇧' : 'Shift');
    } else if (mod === 'Ctrl') {
      labels.push(isMac ? '⌃' : 'Ctrl');
    }
  }

  labels.push(formatKeyToken(key));
  return labels.join(' + ');
};

/**
 * Convert a stored key token into a display label.
 *   "KeyN"   → "N"
 *   "Digit1" → "1"
 *   "Space"  → "Space"
 *   "ArrowUp"→ "↑"
 *   "F5"     → "F5"
 */
const formatKeyToken = (token: string): string => {
  if (!token) return '';
  if (/^Key[A-Z]$/.test(token)) return token.slice(3);
  if (/^Digit\d$/.test(token)) return token.slice(5);
  if (token === 'ArrowUp') return '↑';
  if (token === 'ArrowDown') return '↓';
  if (token === 'ArrowLeft') return '←';
  if (token === 'ArrowRight') return '→';
  if (token === 'Slash') return '/';
  if (token === 'Backslash') return '\\';
  if (token === 'Backquote') return '`';
  if (token === 'Minus') return '-';
  if (token === 'Equal') return '=';
  if (token === 'Comma') return ',';
  if (token === 'Period') return '.';
  if (token === 'Semicolon') return ';';
  if (token === 'Quote') return "'";
  if (token === 'BracketLeft') return '[';
  if (token === 'BracketRight') return ']';
  return token;
};
