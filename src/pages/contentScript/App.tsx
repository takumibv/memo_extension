import React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  CONTENT_SCRIPT,
  DELETE_NOTE,
  GET_ALL_NOTES,
  OPEN_OPTION_PAGE,
  SET_ALL_NOTES,
  UPDATE_NOTE,
} from "../../actions";
import StickyNote from "../../components/StickyNote/StickyNote";
import {
  ToBackgroundMessage,
  ToBackgroundMessageMethod,
  ToBackgroundMessageResponse,
  ToContentScriptMessage,
} from "../../types/Actions";
import { Note } from "../../types/Note";
import { GlobalStyle, SContainer } from "./App.style";

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
        setNotes(notes);
        break;
      default:
        break;
    }
    sendResponse();
    return;
  };

  const sendAction = useCallback(
    (method: ToBackgroundMessageMethod, targetNote?: Note): Promise<boolean> => {
      console.log("sendMessage ======", method, window.location.href, targetNote);
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage<ToBackgroundMessage, ToBackgroundMessageResponse>(
          {
            method: method,
            senderType: CONTENT_SCRIPT,
            page_url: window.location.href, // targetNote.page_info.page_url,
            targetNote,
          },
          ({ notes, error }) => {
            console.log("response ======", notes, chrome.runtime.lastError);
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError.message);
            } else if (error) {
              reject(error.message);
            } else {
              setNotes(notes || []);
              resolve(true);
            }
          }
        );
      });
    },
    []
  );

  const getAllNotes = useCallback(async () => {
    return await sendAction(GET_ALL_NOTES);
  }, []);

  const updateNote = useCallback(async (note: Note) => {
    return await sendAction(UPDATE_NOTE, note);
  }, []);

  const deleteNote = useCallback(async (note: Note) => {
    return await sendAction(DELETE_NOTE, note);
  }, []);

  const open_option_page = () => {
    chrome.runtime.sendMessage<ToBackgroundMessage, ToBackgroundMessageResponse>({
      method: OPEN_OPTION_PAGE,
      senderType: CONTENT_SCRIPT,
      page_url: "",
    });
  };

  useEffect(() => {
    getAllNotes();
    chrome.runtime.onMessage.addListener(handleMessages);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessages);
    };
  }, []);

  return (
    <>
      <GlobalStyle />
      <SContainer>
        {notes.map((note: Note) => (
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
