import StickyNote from '@/content/components/StickyNote/StickyNote';
import { sendUpdateNote, sendDeleteNote } from '@/message/sender/contentScript';
import { useCallback, useEffect, useState } from 'react';
import type { Note } from '@/shared/types/Note';

type StateRef = {
  setNotes: ((notes: Note[]) => void) | null;
  setDefaultColor: ((color: string) => void) | null;
};

type Props = {
  stateRef: StateRef;
};

const ContentApp: React.FC<Props> = ({ stateRef }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [defaultColor, setDefaultColor] = useState<string>();

  // Bind React state setters to the external state ref
  // so the message handler (registered before React) can update state
  useEffect(() => {
    stateRef.setNotes = setNotes;
    stateRef.setDefaultColor = setDefaultColor;

    return () => {
      stateRef.setNotes = null;
      stateRef.setDefaultColor = null;
    };
  }, [stateRef]);

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

  useEffect(() => {
    console.log('どこでもメモ Extension is Running.');
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
        />
      ))}
    </div>
  );
};

export default ContentApp;
