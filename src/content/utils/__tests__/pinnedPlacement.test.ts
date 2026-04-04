import { computePinnedPlacement } from '../pinnedPlacement';
import { describe, it, expect } from 'vitest';
import type { PlacementInput } from '../pinnedPlacement';

const defaults: PlacementInput = {
  elementRect: { top: 100, bottom: 120, left: 50, right: 200 },
  noteWidth: 300,
  noteHeight: 180,
  viewportWidth: 1200,
  viewportHeight: 800,
  scrollX: 0,
  scrollY: 0,
  gap: 8,
};

const compute = (overrides: Partial<PlacementInput>) => computePinnedPlacement({ ...defaults, ...overrides });

const rect = (top: number, bottom: number, left: number, right: number) => ({
  top,
  bottom,
  left,
  right,
});

describe('computePinnedPlacement', () => {
  describe('priority: right → below → above → left → fallback', () => {
    it('右側にスペースがある場合、rightに配置', () => {
      const result = compute({
        elementRect: rect(100, 120, 50, 200),
      });
      expect(result.placement).toBe('right');
      expect(result.x).toBe(208); // 200 + 8
      expect(result.y).toBe(100); // element top
    });

    it('右側にスペースがない場合、belowにフォールバック', () => {
      const result = compute({
        elementRect: rect(100, 120, 50, 950),
        viewportWidth: 1000,
      });
      expect(result.placement).toBe('below');
      expect(result.y).toBe(128); // 120 + 8
    });

    it('右・下にスペースがない場合、aboveにフォールバック', () => {
      const result = compute({
        elementRect: rect(300, 700, 50, 950),
        viewportWidth: 1000,
        viewportHeight: 800,
      });
      expect(result.placement).toBe('above');
      expect(result.y).toBe(112); // 300 - 180 - 8
    });

    it('右・下・上にスペースがない場合、leftにフォールバック', () => {
      const result = compute({
        elementRect: rect(50, 750, 400, 950),
        viewportWidth: 1000,
        viewportHeight: 800,
      });
      expect(result.placement).toBe('left');
      expect(result.x).toBe(92); // 400 - 300 - 8
    });

    it('どの方向にもスペースがない場合、fallbackに配置', () => {
      const result = compute({
        elementRect: rect(50, 750, 100, 950),
        noteWidth: 300,
        viewportWidth: 1000,
        viewportHeight: 800,
      });
      expect(result.placement).toBe('fallback');
    });
  });

  describe('X方向のviewportクランプ', () => {
    it('rightに配置した時、Xがviewport外にはみ出さない', () => {
      const result = compute({
        elementRect: rect(100, 120, 50, 850),
        noteWidth: 300,
        viewportWidth: 1000,
      });
      // 850 + 8 + 300 = 1158 > 1000 → right fails → below
      expect(result.placement).toBe('below');
    });

    it('belowに配置した時、Xがviewport右端にクランプされる', () => {
      const result = compute({
        elementRect: rect(100, 120, 800, 950),
        noteWidth: 300,
        viewportWidth: 1000,
      });
      expect(result.placement).toBe('below');
      expect(result.x).toBe(700); // 1000 - 300
    });

    it('belowに配置した時、Xが負にならない', () => {
      const result = compute({
        elementRect: rect(100, 120, -50, 50),
        noteWidth: 300,
        viewportWidth: 1000,
      });
      expect(result.placement).toBe('right');
      expect(result.x).toBe(58); // 50 + 8
    });

    it('fallbackのXがviewport内にクランプされる', () => {
      const result = compute({
        elementRect: rect(50, 750, 100, 950),
        noteWidth: 300,
        viewportWidth: 1000,
        viewportHeight: 800,
      });
      expect(result.placement).toBe('fallback');
      expect(result.x).toBeLessThanOrEqual(700); // 1000 - 300
      expect(result.x).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Y方向: 要素追従 + 大きい要素でsticky', () => {
    it('要素が画面内: element topに合わせる (absolute)', () => {
      const result = compute({
        elementRect: rect(200, 220, 50, 200),
      });
      expect(result.placement).toBe('right');
      expect(result.sticky).toBe(false);
      expect(result.y).toBe(200);
    });

    it('要素が完全に画面上に消えた: Noteも一緒に画面外 (absolute)', () => {
      const result = compute({
        elementRect: rect(-30, -10, 50, 200),
        viewportHeight: 800,
      });
      expect(result.placement).toBe('right');
      expect(result.sticky).toBe(false);
      expect(result.y).toBe(-30);
    });

    it('要素が完全に画面下に消えた: Noteも一緒に画面外 (absolute)', () => {
      const result = compute({
        elementRect: rect(810, 830, 50, 200),
        viewportHeight: 800,
      });
      expect(result.placement).toBe('right');
      expect(result.sticky).toBe(false);
      expect(result.y).toBe(810);
    });

    it('大きい要素の上が見切れ: sticky=true, y=gap (fixed/viewport coords)', () => {
      const result = compute({
        elementRect: rect(-200, 600, 50, 200),
        viewportHeight: 800,
      });
      expect(result.placement).toBe('right');
      expect(result.sticky).toBe(true);
      expect(result.y).toBe(8); // viewport gap
    });

    it('大きい要素が画面内: Noteはelement topに合わせる (absolute)', () => {
      const result = compute({
        elementRect: rect(100, 1200, 50, 200),
        viewportHeight: 800,
      });
      expect(result.placement).toBe('right');
      expect(result.sticky).toBe(false);
      expect(result.y).toBe(100);
    });

    it('Noteが大きくリサイズ + 要素topが画面上: sticky=true', () => {
      const result = compute({
        elementRect: rect(-100, 600, 50, 200),
        noteHeight: 500,
        viewportHeight: 800,
      });
      expect(result.placement).toBe('right');
      expect(result.sticky).toBe(true);
      expect(result.y).toBe(8);
    });

    it('Noteが大きくリサイズ + 要素が画面内: 要素topに追従 (absolute)', () => {
      const result = compute({
        elementRect: rect(400, 420, 50, 200),
        noteHeight: 500,
        viewportHeight: 800,
      });
      expect(result.placement).toBe('right');
      expect(result.sticky).toBe(false);
      expect(result.y).toBe(400);
    });

    it('Noteが画面とほぼ同じ高さ + 要素が画面下に消える: Noteも追従 (absolute)', () => {
      const result = compute({
        elementRect: rect(460, 480, 50, 200),
        noteHeight: 479,
        viewportHeight: 480,
      });
      expect(result.placement).toBe('right');
      expect(result.sticky).toBe(false);
      expect(result.y).toBe(460);
    });

    it('Noteが画面とほぼ同じ高さ + 要素が画面上に消える: Noteも追従 (absolute)', () => {
      const result = compute({
        elementRect: rect(-20, -1, 50, 200),
        noteHeight: 479,
        viewportHeight: 480,
      });
      expect(result.placement).toBe('right');
      expect(result.sticky).toBe(false);
      expect(result.y).toBe(-20);
    });

    it('大きい要素が完全に画面上に消えた: Noteも一緒に画面外 (absolute)', () => {
      const result = compute({
        elementRect: rect(-1000, -100, 50, 200),
        viewportHeight: 800,
      });
      expect(result.placement).toBe('right');
      expect(result.sticky).toBe(false);
      expect(result.y).toBe(-1000);
    });

    it('要素の下部だけ画面内: sticky=true (y=gap)', () => {
      const result = compute({
        elementRect: rect(-500, 300, 50, 200),
        viewportHeight: 800,
      });
      expect(result.placement).toBe('right');
      expect(result.y).toBe(8); // gap margin from top
    });
  });

  describe('gap パラメータ', () => {
    it('gapが配置距離に反映される', () => {
      const result = compute({
        elementRect: rect(100, 120, 50, 200),
        gap: 16,
      });
      expect(result.placement).toBe('right');
      expect(result.x).toBe(216); // 200 + 16
    });

    it('デフォルトgapは8', () => {
      const result = computePinnedPlacement({
        elementRect: rect(100, 120, 50, 200),
        noteWidth: 300,
        noteHeight: 180,
        viewportWidth: 1200,
        viewportHeight: 800,
        scrollX: 0,
        scrollY: 0,
      });
      expect(result.x).toBe(208); // 200 + 8
    });
  });
});
