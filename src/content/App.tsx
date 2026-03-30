import StickyNote from '@/content/components/StickyNote/StickyNote';
import { useElementPicker } from '@/content/hooks/useElementPicker';
import { getXPathForElement } from '@/content/utils/xpath';
import { registerContentHandler, unregisterContentHandler, getLastContextMenuPosition } from '@/entrypoints/content';
import { sendUpdateNote, sendDeleteNote, sendCreatePinnedNote } from '@/message/sender/contentScript';
import { t } from '@/shared/i18n/i18n';
import { I18N } from '@/shared/i18n/keys';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ToContentMessage } from '@/message/types';
import type { Note } from '@/shared/types/Note';
import type { Selection } from '@/shared/types/Selection';

type Props = {
  portalContainer?: HTMLElement;
};

const ContentApp: React.FC<Props> = ({ portalContainer }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [defaultColor, setDefaultColor] = useState<string>();
  const [selections, setSelections] = useState<Map<string, Selection>>(new Map());
  const [isPickerActive, setIsPickerActive] = useState(false);
  const prevNoteIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    console.log(`${t(I18N.APP_NAME)} Extension is Running.`);

    const handleMessage = (msg: ToContentMessage) => {
      switch (msg.type) {
        case 'bg:setupPage':
          if (msg.payload.notes) {
            const incomingNotes = msg.payload.notes;
            const prevIds = prevNoteIdsRef.current;
            const contextMenuPos = getLastContextMenuPosition();

            // Apply right-click position to newly created notes and persist
            const notesWithPosition = contextMenuPos
              ? incomingNotes.map(note => {
                  if (
                    note.id !== undefined &&
                    !prevIds.has(note.id) &&
                    note.position_x === undefined &&
                    note.position_y === undefined
                  ) {
                    const positioned = { ...note, position_x: contextMenuPos.x, position_y: contextMenuPos.y };
                    sendUpdateNote(positioned).catch(() => {});
                    return positioned;
                  }
                  return note;
                })
              : incomingNotes;

            prevNoteIdsRef.current = new Set(notesWithPosition.flatMap(n => (n.id !== undefined ? [n.id] : [])));
            setNotes(notesWithPosition);
          }
          if (msg.payload.selections) {
            setSelections(new Map(msg.payload.selections.map(s => [s.id, s])));
          }
          if (msg.payload.defaultColor) setDefaultColor(msg.payload.defaultColor);
          break;
        case 'bg:setVisibility':
          // TODO: handle visibility toggle
          break;
        case 'bg:activateInspector':
          setIsPickerActive(true);
          break;
      }
    };

    // Register handler and replay any queued messages
    registerContentHandler(handleMessage);

    return () => {
      unregisterContentHandler();
    };
  }, []);

  // Element picker callbacks
  const handleElementPicked = useCallback(({ element, rect }: { element: Element; rect: DOMRect }) => {
    setIsPickerActive(false);

    const xpath = getXPathForElement(element);
    const text = (element as HTMLElement).innerText?.slice(0, 100) ?? element.tagName;
    const fallbackX = rect.left + window.scrollX;
    const fallbackY = rect.bottom + window.scrollY + 8; // 8px below element

    sendCreatePinnedNote(xpath, text, fallbackX, fallbackY).catch(err => {
      console.error('[ContentApp] Failed to create pinned note:', err);
    });
  }, []);

  const handlePickerCancel = useCallback(() => {
    setIsPickerActive(false);
  }, []);

  useElementPicker(isPickerActive, handleElementPicked, handlePickerCancel);

  const updateNote = useCallback(async (note: Note) => {
    try {
      const { notes } = await sendUpdateNote(note);
      if (notes) setNotes(notes);
      return true;
    } catch {
      // TODO: Error handling
    }
    return false;
  }, []);

  const deleteNote = useCallback(async (note: Note) => {
    try {
      const { notes } = await sendDeleteNote(note);
      if (notes) setNotes(notes);
      return true;
    } catch {
      // TODO: Error handling
    }
    return false;
  }, []);

  return (
    <div className="pointer-events-none absolute left-0 top-0" style={{ zIndex: 1250 }}>
      {notes.map(note => (
        <StickyNote
          key={note.id}
          id={note.id}
          page_info_id={note.page_info_id}
          title={note.title}
          description={note.description}
          position_x={note.position_x}
          position_y={note.position_y}
          width={note.width}
          height={note.height}
          is_open={note.is_open}
          is_fixed={note.is_fixed}
          created_at={note.created_at}
          updated_at={note.updated_at}
          color={note.color}
          selection_id={note.selection_id}
          selection={note.selection_id ? selections.get(note.selection_id) : undefined}
          onUpdateNote={updateNote}
          onDeleteNote={deleteNote}
          defaultColor={defaultColor}
          portalContainer={portalContainer}
        />
      ))}
    </div>
  );
};

export default ContentApp;
