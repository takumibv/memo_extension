import React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  CONTENT_SCRIPT,
  DELETE_NOTE,
  GET_ALL_NOTES,
  OPEN_OPTION_PAGE,
  SET_ALL_NOTES,
  UPDATE_NOTE,
} from "../message/actions";
import StickyNote from "../../components/StickyNote/StickyNote";
import {
  ToBackgroundMessage,
  ToBackgroundMessageMethod,
  ToBackgroundMessageResponse,
  ToContentScriptMessage,
} from "../../types/Actions";
import { Note } from "../../types/Note";
import { GlobalStyle, SContainer } from "./App.style";
import { sendFetchAllNotes, sendUpdateNote, sendDeleteNote } from "../message/sender/contentScript";

const Main: React.VFC = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  const handleMessages = (
    request: ToContentScriptMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    // TODO background → contentScript のアクションを受け取る
    console.log("=== onMessage ===", request, sender);
    const { method, notes } = request;

    switch (method) {
      case SET_ALL_NOTES:
        console.log("SET_ALL_NOTES==");
        setNotes(notes);
        break;
      default:
        break;
    }
    sendResponse();
    return;
  };

  const fetchAllNotes = useCallback(async () => {
    try {
      const notes = await sendFetchAllNotes();
      setNotes(notes);
      return true;
    } catch (error) {
      // TODO
    }
    return false;
  }, []);

  const updateNote = useCallback(async (note: Note) => {
    try {
      const notes = await sendUpdateNote(note);
      setNotes(notes);
      return true;
    } catch (error) {
      // TODO
    }
    return false;
  }, []);

  const deleteNote = useCallback(async (note: Note) => {
    try {
      const notes = await sendDeleteNote(note);
      setNotes(notes);
      return true;
    } catch (error) {
      // TODO
    }
    return false;
  }, []);

  useEffect(() => {
    fetchAllNotes();
    chrome.runtime.onMessage.addListener(handleMessages);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessages);
    };
  }, []);

  return (
    <>
      <GlobalStyle />
      <SContainer>
        {notes.map((note) => (
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
