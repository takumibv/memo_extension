import { encodeFormURL, decodeURL, formURL, formatDate, isSystemLink, isEqualsObject } from '../utils.js';
import { describe, it, expect } from 'vitest';

describe('utils', () => {
  describe('formURL', () => {
    it('should format URL correctly', () => {
      const url = 'https://example.com/path?query=test#hash';
      const result = formURL(url);
      expect(result).toBe('https://example.com/path?query=test');
    });

    it('should remove hash from URL', () => {
      const url = 'https://example.com/page#section';
      const result = formURL(url);
      expect(result).toBe('https://example.com/page');
    });

    it('should keep query parameters', () => {
      const url = 'https://example.com/?foo=bar&baz=qux';
      const result = formURL(url);
      expect(result).toBe('https://example.com/?foo=bar&baz=qux');
    });
  });

  describe('encodeFormURL', () => {
    it('should encode URL', () => {
      const url = 'https://example.com/path';
      const result = encodeFormURL(url);
      expect(result).toBe(encodeURIComponent('https://example.com/path'));
    });
  });

  describe('decodeURL', () => {
    it('should decode URL', () => {
      const encoded = encodeURIComponent('https://example.com/path');
      const result = decodeURL(encoded);
      expect(result).toBe('https://example.com/path');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-01-16T12:34:56');
      const result = formatDate(date);
      expect(result).toMatch(/2025\/1\/16 \d{2}:\d{2}/);
    });

    it('should return empty string for invalid date', () => {
      const invalidDate = new Date('invalid');
      const result = formatDate(invalidDate);
      expect(result).toBe('');
    });

    it('should pad hours and minutes with zero', () => {
      const date = new Date('2025-01-05T09:05:00');
      const result = formatDate(date);
      expect(result).toMatch(/09:05/);
    });
  });

  describe('isSystemLink', () => {
    it('should return true for chrome:// links', () => {
      expect(isSystemLink('chrome://extensions')).toBe(true);
      expect(isSystemLink('chrome://settings')).toBe(true);
    });

    it('should return true for chrome-extension:// links', () => {
      expect(isSystemLink('chrome-extension://abc123/popup.html')).toBe(true);
    });

    it('should return true for chrome-search:// links', () => {
      expect(isSystemLink('chrome-search://local-ntp/local-ntp.html')).toBe(true);
    });

    it('should return false for normal https:// links', () => {
      expect(isSystemLink('https://example.com')).toBe(false);
    });

    it('should return false for http:// links', () => {
      expect(isSystemLink('http://example.com')).toBe(false);
    });
  });

  describe('isEqualsObject', () => {
    it('should return true for identical objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      expect(isEqualsObject(obj1, obj2)).toBe(true);
    });

    it('should return true for same reference', () => {
      const obj = { a: 1, b: 2 };
      expect(isEqualsObject(obj, obj)).toBe(true);
    });

    it('should return false for different objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 3 };
      expect(isEqualsObject(obj1, obj2)).toBe(false);
    });

    it('should return false for different keys', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, c: 2 };
      expect(isEqualsObject(obj1, obj2)).toBe(false);
    });

    it('should handle nested objects', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 2 } };
      expect(isEqualsObject(obj1, obj2)).toBe(true);
    });

    it('should return false for different nested objects', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 3 } };
      expect(isEqualsObject(obj1, obj2)).toBe(false);
    });
  });
});
