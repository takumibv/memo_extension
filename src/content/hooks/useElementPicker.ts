import { useEffect, useRef } from 'react';

type PickResult = {
  element: Element;
  rect: DOMRect;
};

/**
 * Element picker hook - activates an inspector-style overlay for selecting page elements.
 * Renders outside Shadow DOM to interact with host page elements.
 */
export const useElementPicker = (isActive: boolean, onPick: (result: PickResult) => void, onCancel: () => void) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const hoveredElementRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // Create overlay element in host DOM (outside Shadow DOM)
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: '2147483646',
      border: '2px solid #3b82f6',
      background: 'rgba(59,130,246,0.08)',
      borderRadius: '2px',
      transition: 'all 0.1s ease',
      display: 'none',
    });
    document.body.appendChild(overlay);
    overlayRef.current = overlay;

    // Create label element to show tag name
    const label = document.createElement('div');
    Object.assign(label.style, {
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: '2147483647',
      background: '#3b82f6',
      color: '#fff',
      fontSize: '11px',
      fontFamily: 'monospace',
      padding: '2px 6px',
      borderRadius: '2px',
      display: 'none',
    });
    document.body.appendChild(label);

    const updateOverlay = (el: Element) => {
      const rect = el.getBoundingClientRect();
      Object.assign(overlay.style, {
        display: 'block',
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      });
      // Position label above the element
      const labelText =
        el.tagName.toLowerCase() +
        (el.id ? `#${el.id}` : '') +
        (el.className && typeof el.className === 'string'
          ? `.${el.className.split(' ').filter(Boolean).slice(0, 2).join('.')}`
          : '');
      label.textContent = labelText;
      Object.assign(label.style, {
        display: 'block',
        top: `${Math.max(0, rect.top - 22)}px`,
        left: `${rect.left}px`,
      });
    };

    const onMouseMove = (e: MouseEvent) => {
      const target = e.target as Element;
      // Ignore our own overlay and label elements, and the extension's Shadow DOM container
      if (target === overlay || target === label) return;
      if (target.id === 'react-container-for-note-extension') return;
      if (target.closest('#react-container-for-note-extension')) return;

      hoveredElementRef.current = target;
      updateOverlay(target);
    };

    const onClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const el = hoveredElementRef.current ?? (e.target as Element);
      if (el) {
        onPick({ element: el, rect: el.getBoundingClientRect() });
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    };

    // Use capture phase to intercept before page handlers
    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeyDown, true);

    // Set cursor style
    const prevCursor = document.body.style.cursor;
    document.body.style.cursor = 'crosshair';

    return () => {
      document.removeEventListener('mousemove', onMouseMove, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.cursor = prevCursor;
      overlay.remove();
      label.remove();
      overlayRef.current = null;
      hoveredElementRef.current = null;
    };
  }, [isActive, onPick, onCancel]);
};
