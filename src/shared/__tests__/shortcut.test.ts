import { eventToShortcut, matchEvent, formatShortcut } from '../shortcut';
import { describe, it, expect } from 'vitest';

const ke = (init: Partial<KeyboardEvent> & { key: string; code?: string }): KeyboardEvent =>
  new KeyboardEvent('keydown', {
    key: init.key,
    code: init.code ?? '',
    ctrlKey: init.ctrlKey ?? false,
    altKey: init.altKey ?? false,
    shiftKey: init.shiftKey ?? false,
    metaKey: init.metaKey ?? false,
  });

describe('eventToShortcut', () => {
  it('レターキーは event.code を使用する', () => {
    const e = ke({ key: 'n', code: 'KeyN', altKey: true, shiftKey: true });
    expect(eventToShortcut(e)).toBe('Alt+Shift+KeyN');
  });

  it('数字キーは event.code を使用する', () => {
    const e = ke({ key: '1', code: 'Digit1', ctrlKey: true });
    expect(eventToShortcut(e)).toBe('Ctrl+Digit1');
  });

  it('ファンクションキー単独でも記録できる', () => {
    const e = ke({ key: 'F5', code: 'F5' });
    expect(eventToShortcut(e)).toBe('F5');
  });

  it('修飾キー単独押下では null を返す', () => {
    expect(eventToShortcut(ke({ key: 'Control', code: 'ControlLeft', ctrlKey: true }))).toBeNull();
    expect(eventToShortcut(ke({ key: 'Alt', code: 'AltLeft', altKey: true }))).toBeNull();
    expect(eventToShortcut(ke({ key: 'Shift', code: 'ShiftLeft', shiftKey: true }))).toBeNull();
    expect(eventToShortcut(ke({ key: 'Meta', code: 'MetaLeft', metaKey: true }))).toBeNull();
  });

  it('IME 変換中のキーは無視する', () => {
    expect(eventToShortcut(ke({ key: 'Dead', code: 'KeyA' }))).toBeNull();
    expect(eventToShortcut(ke({ key: 'Process', code: 'KeyA' }))).toBeNull();
    expect(eventToShortcut(ke({ key: 'Unidentified', code: '' }))).toBeNull();
  });

  it('修飾キーの順序は Ctrl→Alt→Shift→Meta に正規化される', () => {
    const e = ke({
      key: 'a',
      code: 'KeyA',
      metaKey: true,
      shiftKey: true,
      altKey: true,
      ctrlKey: true,
    });
    expect(eventToShortcut(e)).toBe('Ctrl+Alt+Shift+Meta+KeyA');
  });

  it('event.code が空の場合はスペースを Space にフォールバックする', () => {
    const e = ke({ key: ' ', code: '' });
    expect(eventToShortcut(e)).toBe('Space');
  });
});

describe('matchEvent', () => {
  it('完全一致で true を返す', () => {
    const e = ke({ key: 'n', code: 'KeyN', altKey: true, shiftKey: true });
    expect(matchEvent(e, 'Alt+Shift+KeyN')).toBe(true);
  });

  it('修飾キーが不一致なら false を返す', () => {
    const e = ke({ key: 'n', code: 'KeyN', altKey: true });
    expect(matchEvent(e, 'Alt+Shift+KeyN')).toBe(false);
  });

  it('ショートカットが空文字なら false を返す', () => {
    const e = ke({ key: 'n', code: 'KeyN', altKey: true, shiftKey: true });
    expect(matchEvent(e, '')).toBe(false);
  });

  it('event.code 経由でレターキーは大小文字を問わない', () => {
    const e = ke({ key: 'N', code: 'KeyN', shiftKey: true });
    expect(matchEvent(e, 'Shift+KeyN')).toBe(true);
  });
});

describe('formatShortcut', () => {
  it('Mac では修飾キーを記号で表示する', () => {
    expect(formatShortcut('Alt+Shift+KeyN', { isMac: true })).toBe('⌥ + ⇧ + N');
    expect(formatShortcut('Meta+Slash', { isMac: true })).toBe('⌘ + /');
    expect(formatShortcut('Ctrl+KeyA', { isMac: true })).toBe('⌃ + A');
  });

  it('Mac 以外では修飾キーを名前で表示する', () => {
    expect(formatShortcut('Alt+Shift+KeyN', { isMac: false })).toBe('Alt + Shift + N');
    expect(formatShortcut('Meta+Slash', { isMac: false })).toBe('Win + /');
    expect(formatShortcut('Ctrl+KeyA', { isMac: false })).toBe('Ctrl + A');
  });

  it('数字キーを表示する', () => {
    expect(formatShortcut('Ctrl+Digit1', { isMac: false })).toBe('Ctrl + 1');
  });

  it('矢印キーを矢印グリフで表示する', () => {
    expect(formatShortcut('Alt+ArrowUp', { isMac: false })).toBe('Alt + ↑');
    expect(formatShortcut('Alt+ArrowDown', { isMac: false })).toBe('Alt + ↓');
  });

  it('ファンクションキーはそのまま表示する', () => {
    expect(formatShortcut('F5', { isMac: false })).toBe('F5');
  });

  it('空文字の入力は空文字を返す', () => {
    expect(formatShortcut('', { isMac: false })).toBe('');
  });

  it('入力順に関わらず修飾キーは正規順序で表示される', () => {
    expect(formatShortcut('Shift+Ctrl+Alt+KeyA', { isMac: false })).toBe('Ctrl + Alt + Shift + A');
  });
});
