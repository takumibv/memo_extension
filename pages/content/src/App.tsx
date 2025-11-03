import { GlobalStyle, SContainer } from './App.style.js';
import StickyNote from './components/StickyNote/StickyNote.js';
import { SETUP_PAGE, SET_NOTE_VISIBLE } from '../../../chrome-extension/src/message/actions.js';
import { sendUpdateNote, sendDeleteNote } from '../../../chrome-extension/src/message/sender/contentScript.js';
import { useCallback, useEffect, useState } from 'react';
import type { MessageRequest, MessageResponse } from '../../../chrome-extension/src/message/message.js';
import type { Note } from '@extension/shared/lib/types/Note.js';

const App: React.FC = () => {
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

  // const fetchAllNotes = useCallback(async () => {
  //   try {
  //     const { notes } = await sendFetchAllNotes();
  //     if (notes) setNotes(notes);
  //     return true;
  //     } catch {
  //       // TODO: Error handling
  //     }
  //   return false;
  // }, []);

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

  // const fetchNoteVisible = useCallback(async () => {
  //   const { isVisible } = await sendFetchNoteVisible();
  //   setIsVisible(!!isVisible);
  // }, []);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleMessages);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessages);
    };
  }, []);

  return (
    <>
      <GlobalStyle />
      <SContainer>
        {notes.map(note => (
          // TODO Focusの実施
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
      </SContainer>
    </>
  );
};

export default App;
