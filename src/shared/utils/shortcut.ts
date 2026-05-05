/**
 * `chrome.commands` が返すショートカット文字列をキーごとに分解する。
 * Mac: "⌃⇧N" (区切りなし、Unicode 修飾キー記号 + 末尾の通常キー)
 * Win/Linux: "Ctrl+Shift+N" ("+" 区切り)
 */
const MAC_MODIFIER_SYMBOLS = new Set(['⌃', '⌥', '⇧', '⌘']);

export const splitShortcut = (shortcut: string): string[] => {
  if (shortcut.includes('+'))
    return shortcut
      .split('+')
      .map(s => s.trim())
      .filter(Boolean);
  // Mac: 各文字を走査、修飾キー記号は単独トークン、それ以外は連結して末尾キー扱い
  const tokens: string[] = [];
  let buffer = '';
  for (const ch of shortcut) {
    if (MAC_MODIFIER_SYMBOLS.has(ch)) {
      if (buffer) {
        tokens.push(buffer);
        buffer = '';
      }
      tokens.push(ch);
    } else {
      buffer += ch;
    }
  }
  if (buffer) tokens.push(buffer);
  return tokens;
};
