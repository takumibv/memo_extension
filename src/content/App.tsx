import StickyNote from '@/content/components/StickyNote/StickyNote';
import { registerContentHandler, unregisterContentHandler, getLastContextMenuPosition } from '@/entrypoints/content';
import { sendUpdateNote, sendDeleteNote } from '@/message/sender/contentScript';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ToContentMessage } from '@/message/types';
import type { Note } from '@/shared/types/Note';

type Props = {
  portalContainer?: HTMLElement;
};

const ContentApp: React.FC<Props> = ({ portalContainer }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [defaultColor, setDefaultColor] = useState<string>();
  const prevNoteIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    console.log('どこでもメモ Extension is Running.');

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
          if (msg.payload.defaultColor) setDefaultColor(msg.payload.defaultColor);
          break;
        case 'bg:setVisibility':
          // TODO: handle visibility toggle
          break;
      }
    };

    // Register handler and replay any queued messages
    registerContentHandler(handleMessage);

    return () => {
      unregisterContentHandler();
    };
  }, []);

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
