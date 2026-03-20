import StickyNote from '@/content/components/StickyNote/StickyNote';
import { SETUP_PAGE, SET_NOTE_VISIBLE } from '@/message/actions';
import { sendUpdateNote, sendDeleteNote } from '@/message/sender/contentScript';
import { useCallback, useEffect, useState } from 'react';
import type { MessageRequest, MessageResponse } from '@/message/message';
import type { Note } from '@/shared/types/Note';

const ContentApp: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [defaultColor, setDefaultColor] = useState<string>();

  const handleMessages = (
    request: MessageRequest,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: MessageResponse) => void,
  ): boolean => {
    const { method, payload } = request;
    const { notes, defaultColor } = payload ?? {};

    switch (method) {
      case SETUP_PAGE:
        if (notes) setNotes(notes);
        if (defaultColor) setDefaultColor(defaultColor);
        break;
      case SET_NOTE_VISIBLE:
        if (defaultColor) setDefaultColor(defaultColor);
        break;
      default:
        break;
    }
    sendResponse();
    return true;
  };

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
    chrome.runtime.onMessage.addListener(handleMessages);

    chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_READY' }).catch(() => {});

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessages);
    };
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
