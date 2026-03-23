import { isToBackgroundMessage, isToContentMessage } from '../types';
import { describe, it, expect } from 'vitest';

describe('message type guards', () => {
  describe('isToBackgroundMessage', () => {
    it('popup:で始まるメッセージをtrueと判定', () => {
      expect(isToBackgroundMessage({ type: 'popup:getAllNotes', payload: {} })).toBe(true);
      expect(isToBackgroundMessage({ type: 'popup:createNote', payload: {} })).toBe(true);
      expect(isToBackgroundMessage({ type: 'popup:updateNote', payload: {} })).toBe(true);
      expect(isToBackgroundMessage({ type: 'popup:deleteNote', payload: {} })).toBe(true);
      expect(isToBackgroundMessage({ type: 'popup:scrollToNote', payload: {} })).toBe(true);
      expect(isToBackgroundMessage({ type: 'popup:getVisibility', payload: {} })).toBe(true);
      expect(isToBackgroundMessage({ type: 'popup:updateVisibility', payload: {} })).toBe(true);
    });

    it('content:で始まるメッセージをtrueと判定', () => {
      expect(isToBackgroundMessage({ type: 'content:getAllNotes', payload: {} })).toBe(true);
      expect(isToBackgroundMessage({ type: 'content:updateNote', payload: {} })).toBe(true);
      expect(isToBackgroundMessage({ type: 'content:deleteNote', payload: {} })).toBe(true);
      expect(isToBackgroundMessage({ type: 'content:getVisibility' })).toBe(true);
    });

    it('options:で始まるメッセージをtrueと判定', () => {
      expect(isToBackgroundMessage({ type: 'options:getAllData' })).toBe(true);
      expect(isToBackgroundMessage({ type: 'options:updateNote', payload: {} })).toBe(true);
      expect(isToBackgroundMessage({ type: 'options:deleteNote', payload: {} })).toBe(true);
      expect(isToBackgroundMessage({ type: 'options:updatePageInfo', payload: {} })).toBe(true);
      expect(isToBackgroundMessage({ type: 'options:getSetting' })).toBe(true);
      expect(isToBackgroundMessage({ type: 'options:updateDefaultColor', payload: {} })).toBe(true);
    });

    it('bg:で始まるメッセージをfalseと判定', () => {
      expect(isToBackgroundMessage({ type: 'bg:setupPage', payload: {} })).toBe(false);
      expect(isToBackgroundMessage({ type: 'bg:setVisibility', payload: {} })).toBe(false);
    });

    it('無効な入力をfalseと判定', () => {
      expect(isToBackgroundMessage(null)).toBe(false);
      expect(isToBackgroundMessage(undefined)).toBe(false);
      expect(isToBackgroundMessage(42)).toBe(false);
      expect(isToBackgroundMessage('string')).toBe(false);
      expect(isToBackgroundMessage({})).toBe(false);
      expect(isToBackgroundMessage({ type: 123 })).toBe(false);
      expect(isToBackgroundMessage({ type: 'unknown:message' })).toBe(false);
    });
  });

  describe('isToContentMessage', () => {
    it('bg:で始まるメッセージをtrueと判定', () => {
      expect(isToContentMessage({ type: 'bg:setupPage', payload: {} })).toBe(true);
      expect(isToContentMessage({ type: 'bg:setVisibility', payload: {} })).toBe(true);
    });

    it('popup:/content:/options:で始まるメッセージをfalseと判定', () => {
      expect(isToContentMessage({ type: 'popup:getAllNotes', payload: {} })).toBe(false);
      expect(isToContentMessage({ type: 'content:getAllNotes', payload: {} })).toBe(false);
      expect(isToContentMessage({ type: 'options:getAllData' })).toBe(false);
    });

    it('無効な入力をfalseと判定', () => {
      expect(isToContentMessage(null)).toBe(false);
      expect(isToContentMessage(undefined)).toBe(false);
      expect(isToContentMessage(42)).toBe(false);
      expect(isToContentMessage('string')).toBe(false);
      expect(isToContentMessage({})).toBe(false);
      expect(isToContentMessage({ type: 123 })).toBe(false);
    });
  });
});
