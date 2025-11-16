import { DEAULT_NOTE_WIDTH, DEAULT_NOTE_HEIGHT } from '../../types/Note.js';
import {
  useNoteEdit,
  useNotePosition,
  useNoteSize,
  initialPositionX,
  initialPositionY,
  MIN_NOTE_WIDTH,
  MIN_NOTE_HEIGHT,
  NOTE_TOP_POSITION,
  NOTE_LEFT_POSITION,
} from '../useNote.js';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import type { Note } from '../../types/Note.js';

describe('useNote hooks', () => {
  beforeEach(() => {
    // ウィンドウサイズをモック
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
    Object.defineProperty(window, 'scrollX', {
      writable: true,
      configurable: true,
      value: 0,
    });
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  describe('initialPositionX', () => {
    it('should calculate center X position', () => {
      const result = initialPositionX();
      expect(result).toBe((1024 - DEAULT_NOTE_WIDTH) / 2);
    });

    it('should recalculate when window width changes', () => {
      Object.defineProperty(window, 'innerWidth', { value: 800 });
      const result = initialPositionX();
      expect(result).toBe((800 - DEAULT_NOTE_WIDTH) / 2);
    });
  });

  describe('initialPositionY', () => {
    it('should calculate center Y position', () => {
      const result = initialPositionY();
      expect(result).toBe((768 - DEAULT_NOTE_HEIGHT) / 2);
    });

    it('should recalculate when window height changes', () => {
      Object.defineProperty(window, 'innerHeight', { value: 600 });
      const result = initialPositionY();
      expect(result).toBe((600 - DEAULT_NOTE_HEIGHT) / 2);
    });
  });

  describe('useNotePosition', () => {
    it('should initialize with default position', () => {
      const { result } = renderHook(() => useNotePosition(100, 200));

      expect(result.current.positionX).toBe(100);
      expect(result.current.positionY).toBe(200);
    });

    it('should initialize with undefined when no defaults provided', () => {
      const { result } = renderHook(() => useNotePosition());

      expect(result.current.positionX).toBeUndefined();
      expect(result.current.positionY).toBeUndefined();
    });

    it('should update position', () => {
      const { result } = renderHook(() => useNotePosition(100, 200));

      act(() => {
        result.current.setPosition(300, 400);
      });

      expect(result.current.positionX).toBe(300);
      expect(result.current.positionY).toBe(400);
    });

    it('should not allow position less than NOTE_LEFT_POSITION', () => {
      const { result } = renderHook(() => useNotePosition());

      act(() => {
        result.current.setPosition(-50, 100);
      });

      expect(result.current.positionX).toBe(NOTE_LEFT_POSITION);
      expect(result.current.positionY).toBe(100);
    });

    it('should not allow position less than NOTE_TOP_POSITION', () => {
      const { result } = renderHook(() => useNotePosition());

      act(() => {
        result.current.setPosition(100, -50);
      });

      expect(result.current.positionX).toBe(100);
      expect(result.current.positionY).toBe(NOTE_TOP_POSITION);
    });

    it('should set position to undefined when passed undefined', () => {
      const { result } = renderHook(() => useNotePosition(100, 200));

      act(() => {
        result.current.setPosition(undefined, undefined);
      });

      expect(result.current.positionX).toBeUndefined();
      expect(result.current.positionY).toBeUndefined();
    });

    it('should update when default props change', () => {
      const { result, rerender } = renderHook(({ x, y }) => useNotePosition(x, y), {
        initialProps: { x: 100, y: 200 },
      });

      expect(result.current.positionX).toBe(100);
      expect(result.current.positionY).toBe(200);

      rerender({ x: 300, y: 400 });

      expect(result.current.positionX).toBe(300);
      expect(result.current.positionY).toBe(400);
    });
  });

  describe('useNoteSize', () => {
    it('should initialize with default size', () => {
      const { result } = renderHook(() => useNoteSize(300, 200));

      expect(result.current.width).toBe(300);
      expect(result.current.height).toBe(200);
    });

    it('should initialize with MIN values when no defaults provided', () => {
      const { result } = renderHook(() => useNoteSize());

      expect(result.current.width).toBe(MIN_NOTE_WIDTH);
      expect(result.current.height).toBe(MIN_NOTE_HEIGHT);
    });

    it('should update size', () => {
      const { result } = renderHook(() => useNoteSize(300, 200));

      act(() => {
        result.current.setSize(400, 300);
      });

      expect(result.current.width).toBe(400);
      expect(result.current.height).toBe(300);
    });

    it('should not allow width less than MIN_NOTE_WIDTH', () => {
      const { result } = renderHook(() => useNoteSize());

      act(() => {
        result.current.setSize(50, 200);
      });

      expect(result.current.width).toBe(MIN_NOTE_WIDTH);
      expect(result.current.height).toBe(200);
    });

    it('should not allow height less than MIN_NOTE_HEIGHT', () => {
      const { result } = renderHook(() => useNoteSize());

      act(() => {
        result.current.setSize(300, 50);
      });

      expect(result.current.width).toBe(300);
      expect(result.current.height).toBe(MIN_NOTE_HEIGHT);
    });

    it('should enforce both min constraints simultaneously', () => {
      const { result } = renderHook(() => useNoteSize());

      act(() => {
        result.current.setSize(50, 50);
      });

      expect(result.current.width).toBe(MIN_NOTE_WIDTH);
      expect(result.current.height).toBe(MIN_NOTE_HEIGHT);
    });
  });

  describe('useNoteEdit', () => {
    const mockNote: Note = {
      id: 1,
      title: 'Test Title',
      description: 'Test Description',
      position_x: 100,
      position_y: 200,
      width: 300,
      height: 250,
      is_open: true,
      is_fixed: false,
    };

    it('should initialize with note values', () => {
      const { result } = renderHook(() => useNoteEdit(mockNote));

      expect(result.current.editTitle).toBe('Test Title');
      expect(result.current.editDescription).toBe('Test Description');
      expect(result.current.editIsOpen).toBe(true);
      expect(result.current.editPositionX).toBe(100);
      expect(result.current.editPositionY).toBe(200);
      expect(result.current.editWidth).toBe(300);
      expect(result.current.editHeight).toBe(250);
    });

    it('should update title', () => {
      const { result } = renderHook(() => useNoteEdit(mockNote));

      act(() => {
        result.current.setEditTitle('New Title');
      });

      expect(result.current.editTitle).toBe('New Title');
    });

    it('should update description', () => {
      const { result } = renderHook(() => useNoteEdit(mockNote));

      act(() => {
        result.current.setEditDescription('New Description');
      });

      expect(result.current.editDescription).toBe('New Description');
    });

    it('should update is_open state', () => {
      const { result } = renderHook(() => useNoteEdit(mockNote));

      act(() => {
        result.current.setEditIsOpen(false);
      });

      expect(result.current.editIsOpen).toBe(false);
    });

    it('should update position', () => {
      const { result } = renderHook(() => useNoteEdit(mockNote));

      act(() => {
        result.current.setEditPosition(500, 600);
      });

      expect(result.current.editPositionX).toBe(500);
      expect(result.current.editPositionY).toBe(600);
    });

    it('should update size', () => {
      const { result } = renderHook(() => useNoteEdit(mockNote));

      act(() => {
        result.current.setEditSize(400, 350);
      });

      expect(result.current.editWidth).toBe(400);
      expect(result.current.editHeight).toBe(350);
    });

    it('should sync when title prop changes', () => {
      const { result, rerender } = renderHook(({ note }) => useNoteEdit(note), {
        initialProps: { note: mockNote },
      });

      expect(result.current.editTitle).toBe('Test Title');

      rerender({ note: { ...mockNote, title: 'Updated Title' } });

      expect(result.current.editTitle).toBe('Updated Title');
    });

    it('should sync when description prop changes', () => {
      const { result, rerender } = renderHook(({ note }) => useNoteEdit(note), {
        initialProps: { note: mockNote },
      });

      expect(result.current.editDescription).toBe('Test Description');

      rerender({ note: { ...mockNote, description: 'Updated Description' } });

      expect(result.current.editDescription).toBe('Updated Description');
    });

    it('should sync when is_open prop changes', () => {
      const { result, rerender } = renderHook(({ note }) => useNoteEdit(note), {
        initialProps: { note: mockNote },
      });

      expect(result.current.editIsOpen).toBe(true);

      rerender({ note: { ...mockNote, is_open: false } });

      expect(result.current.editIsOpen).toBe(false);
    });

    it('should use MIN values when width/height not provided', () => {
      const noteWithoutSize: Note = {
        id: 1,
        title: 'Test',
      };

      const { result } = renderHook(() => useNoteEdit(noteWithoutSize));

      expect(result.current.editWidth).toBe(MIN_NOTE_WIDTH);
      expect(result.current.editHeight).toBe(MIN_NOTE_HEIGHT);
    });

    describe('getFixedPosition', () => {
      it('should calculate position for fixed note (isFixed: true)', () => {
        Object.defineProperty(window, 'scrollX', { value: 100 });
        Object.defineProperty(window, 'scrollY', { value: 200 });

        const { result } = renderHook(() => useNoteEdit(mockNote));

        const fixedPosition = result.current.getFixedPosition(true);

        // isFixed: true の場合、スクロール量を引く（fixPosition = -1）
        expect(fixedPosition.positionX).toBe(100 + 100 * -1); // 0
        expect(fixedPosition.positionY).toBe(200 + 200 * -1); // 0
      });

      it('should calculate position for non-fixed note (isFixed: false)', () => {
        Object.defineProperty(window, 'scrollX', { value: 100 });
        Object.defineProperty(window, 'scrollY', { value: 200 });

        const { result } = renderHook(() => useNoteEdit(mockNote));

        const nonFixedPosition = result.current.getFixedPosition(false);

        // isFixed: false の場合、スクロール量を足す（fixPosition = 1）
        expect(nonFixedPosition.positionX).toBe(100 + 100 * 1); // 200
        expect(nonFixedPosition.positionY).toBe(200 + 200 * 1); // 400
      });

      it('should use initial position when position is undefined', () => {
        const noteWithoutPosition: Note = {
          id: 1,
          title: 'Test',
        };

        Object.defineProperty(window, 'scrollX', { value: 50 });
        Object.defineProperty(window, 'scrollY', { value: 100 });

        const { result } = renderHook(() => useNoteEdit(noteWithoutPosition));

        const fixedPosition = result.current.getFixedPosition(true);

        // position_x/yがundefinedの場合、initialPosition()を使用
        const expectedX = initialPositionX() + 50 * -1;
        const expectedY = initialPositionY() + 100 * -1;

        expect(fixedPosition.positionX).toBe(expectedX);
        expect(fixedPosition.positionY).toBe(expectedY);
      });
    });
  });

  describe('Integration: useNoteEdit with all hooks', () => {
    it('should manage complete note state', () => {
      const note: Note = {
        id: 1,
        title: 'Integration Test',
        description: 'Testing all features',
        position_x: 150,
        position_y: 250,
        width: 350,
        height: 280,
        is_open: true,
        is_fixed: false,
      };

      const { result } = renderHook(() => useNoteEdit(note));

      // 初期値確認
      expect(result.current.editTitle).toBe('Integration Test');
      expect(result.current.editDescription).toBe('Testing all features');
      expect(result.current.editPositionX).toBe(150);
      expect(result.current.editPositionY).toBe(250);
      expect(result.current.editWidth).toBe(350);
      expect(result.current.editHeight).toBe(280);
      expect(result.current.editIsOpen).toBe(true);

      // 全てのプロパティを更新
      act(() => {
        result.current.setEditTitle('Updated Title');
        result.current.setEditDescription('Updated Description');
        result.current.setEditPosition(400, 500);
        result.current.setEditSize(450, 380);
        result.current.setEditIsOpen(false);
      });

      expect(result.current.editTitle).toBe('Updated Title');
      expect(result.current.editDescription).toBe('Updated Description');
      expect(result.current.editPositionX).toBe(400);
      expect(result.current.editPositionY).toBe(500);
      expect(result.current.editWidth).toBe(450);
      expect(result.current.editHeight).toBe(380);
      expect(result.current.editIsOpen).toBe(false);
    });
  });
});
