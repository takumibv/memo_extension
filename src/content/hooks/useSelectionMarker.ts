import { useEffect, useRef } from 'react';

const MARKER_STYLE: Partial<CSSStyleDeclaration> = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: '2147483645',
  outline: '2px solid rgba(59, 130, 246, 0.3)',
  outlineOffset: '-1px',
  backgroundColor: 'rgba(59, 130, 246, 0.04)',
  borderRadius: '2px',
  transition: 'opacity 0.15s ease',
};

/**
 * Renders a highlight overlay on a tracked element's position.
 * The overlay is shown only when `visible` is true (e.g., on note hover/focus).
 * Uses a fixed-position div in the host DOM (outside Shadow DOM) so
 * no host-page element styles are modified.
 */
export const useSelectionHighlight = (rect: DOMRect | null, visible: boolean) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const overlay = document.createElement('div');
    overlay.dataset.noteHighlight = 'true';
    Object.assign(overlay.style, MARKER_STYLE);
    overlay.style.opacity = '0';
    overlay.style.display = 'none';
    document.body.appendChild(overlay);
    overlayRef.current = overlay;

    return () => {
      overlay.remove();
      overlayRef.current = null;
    };
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    if (!visible || !rect) {
      overlay.style.opacity = '0';
      overlay.style.display = 'none';
      return;
    }

    overlay.style.display = 'block';
    overlay.style.top = `${rect.top}px`;
    overlay.style.left = `${rect.left}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.opacity = '1';
  }, [rect, visible]);
};
