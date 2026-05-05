import { splitShortcut } from '../shortcut';
import { describe, it, expect } from 'vitest';

describe('splitShortcut', () => {
  describe('Mac 形式 (Unicode 修飾キー記号)', () => {
    it('修飾キー1つ + 英字を分解する', () => {
      expect(splitShortcut('⌃A')).toEqual(['⌃', 'A']);
      expect(splitShortcut('⌥A')).toEqual(['⌥', 'A']);
      expect(splitShortcut('⇧A')).toEqual(['⇧', 'A']);
      expect(splitShortcut('⌘A')).toEqual(['⌘', 'A']);
    });

    it('修飾キー2つ + 英字を分解する', () => {
      expect(splitShortcut('⌃⇧N')).toEqual(['⌃', '⇧', 'N']);
      expect(splitShortcut('⌘⇧N')).toEqual(['⌘', '⇧', 'N']);
    });

    it('修飾キー3つ + 英字を分解する', () => {
      expect(splitShortcut('⌃⇧⌘N')).toEqual(['⌃', '⇧', '⌘', 'N']);
    });

    it('修飾キー4つ + 英字を分解する', () => {
      expect(splitShortcut('⌃⌥⇧⌘N')).toEqual(['⌃', '⌥', '⇧', '⌘', 'N']);
    });

    it('修飾キー + ファンクションキーを分解する', () => {
      expect(splitShortcut('⌃F1')).toEqual(['⌃', 'F1']);
      expect(splitShortcut('⌃⇧F12')).toEqual(['⌃', '⇧', 'F12']);
    });
  });

  describe('Win/Linux 形式 (+ 区切り)', () => {
    it('修飾キー1つ + 英字を分解する', () => {
      expect(splitShortcut('Ctrl+N')).toEqual(['Ctrl', 'N']);
      expect(splitShortcut('Alt+N')).toEqual(['Alt', 'N']);
      expect(splitShortcut('Shift+N')).toEqual(['Shift', 'N']);
    });

    it('修飾キー2つ + 英字を分解する', () => {
      expect(splitShortcut('Ctrl+Shift+N')).toEqual(['Ctrl', 'Shift', 'N']);
      expect(splitShortcut('Ctrl+Alt+N')).toEqual(['Ctrl', 'Alt', 'N']);
    });

    it('修飾キー3つ + 英字を分解する', () => {
      expect(splitShortcut('Ctrl+Alt+Shift+N')).toEqual(['Ctrl', 'Alt', 'Shift', 'N']);
    });

    it('修飾キー + ファンクションキーを分解する', () => {
      expect(splitShortcut('Ctrl+F1')).toEqual(['Ctrl', 'F1']);
      expect(splitShortcut('Ctrl+Shift+F12')).toEqual(['Ctrl', 'Shift', 'F12']);
    });
  });

  describe('単独キー', () => {
    it('ファンクションキー単独', () => {
      expect(splitShortcut('F1')).toEqual(['F1']);
      expect(splitShortcut('F12')).toEqual(['F12']);
    });
  });

  describe('空文字列', () => {
    it('空文字列は空配列を返す', () => {
      expect(splitShortcut('')).toEqual([]);
    });
  });
});
