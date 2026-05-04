import { matchEvent } from '@/shared/shortcut';
import { useEffect, useRef } from 'react';

/**
 * ホストページの `document` で keydown を監視し、`shortcut` と一致したら `onTrigger` を呼ぶ。
 *
 * - capture phase で listen するため、ホストページのハンドラより先に発火し
 *   `<input>`/`<textarea>`/`contenteditable` 上にフォーカスがあっても発火する。
 * - IME 変換中 (`event.isComposing`) は発火しない。
 * - `rootElement` の `:focus-within` (= Shadow DOM 内のノート編集中) は発火しない。
 * - `shortcut` が空文字なら listener を登録しない。
 */
export const useShortcutCreateNote = (
  shortcut: string | undefined,
  onTrigger: () => void,
  rootElement: HTMLElement | null,
) => {
  const onTriggerRef = useRef(onTrigger);
  useEffect(() => {
    onTriggerRef.current = onTrigger;
  }, [onTrigger]);

  useEffect(() => {
    if (!shortcut) return;

    const handler = (e: KeyboardEvent) => {
      if (e.isComposing) return;
      // ノート編集中 (Shadow DOM 内にフォーカス) は発火しない
      if (rootElement && rootElement.matches(':focus-within')) return;
      if (!matchEvent(e, shortcut)) return;
      e.preventDefault();
      onTriggerRef.current();
    };

    document.addEventListener('keydown', handler, true);
    return () => {
      document.removeEventListener('keydown', handler, true);
    };
  }, [shortcut, rootElement]);
};
