import React from "react";
import { useCallback, useEffect, useState } from "react";
import { SETUP_PAGE, SET_NOTE_VISIBLE } from "../message/actions";
import StickyNote from "../../components/StickyNote/StickyNote";
import { Note } from "../../types/Note";
import { GlobalStyle, SContainer } from "./App.style";
import {
  sendFetchAllNotes,
  sendUpdateNote,
  sendDeleteNote,
  sendFetchNoteVisible,
} from "../message/sender/contentScript";
import { MessageRequest, MessageResponse } from "../message/message";

const Main: React.VFC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  const handleMessages = (
    request: MessageRequest,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: MessageResponse) => void
  ) => {
    console.log("=== onMessage ===", request, sender);
    const { method, payload } = request;
    const { notes, isVisible } = payload ?? {};

    switch (method) {
      case SETUP_PAGE:
        notes && setNotes(notes);
        isVisible !== undefined && setIsVisible(!!isVisible);
        break;
      case SET_NOTE_VISIBLE:
        isVisible !== undefined && setIsVisible(!!isVisible);
        break;
      default:
        break;
    }
    sendResponse();
    return;
  };

  const fetchAllNotes = useCallback(async () => {
    try {
      const { notes } = await sendFetchAllNotes();
      notes && setNotes(notes);
      return true;
    } catch (error) {
      // TODO
    }
    return false;
  }, []);

  const updateNote = useCallback(async (note: Note) => {
    try {
      const { notes } = await sendUpdateNote(note);
      notes && setNotes(notes);
      return true;
    } catch (error) {
      // TODO
    }
    return false;
  }, []);

  const deleteNote = useCallback(async (note: Note) => {
    try {
      const { notes } = await sendDeleteNote(note);
      notes && setNotes(notes);
      return true;
    } catch (error) {
      // TODO
    }
    return false;
  }, []);

  const fetchNoteVisible = useCallback(async () => {
    const { isVisible } = await sendFetchNoteVisible();
    setIsVisible(!!isVisible);
  }, []);

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
        {isVisible &&
          notes.map((note) => (
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
              onUpdateNote={updateNote}
              onDeleteNote={deleteNote}
            />
          ))}
      </SContainer>
    </>
  );
};

export default Main;