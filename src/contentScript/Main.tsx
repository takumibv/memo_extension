import React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  DELETE_NOTE,
  GET_ALL_NOTES,
  OPEN_OPTION_PAGE,
  SET_ALL_NOTES,
  UPDATE_NOTE,
} from "../actions";
import StickyNote from "../components/StickyNote/StickyNote";
import {
  ToBackgroundMessage,
  ToBackgroundMessageMethodType,
  ToContentScriptMessage,
} from "../types/Actions";
import { Note } from "../types/Note";
import { GlobalStyle, SContainer } from "./Main.style";

const Main: React.VFC = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  const sendAction = useCallback(
    (method: ToBackgroundMessageMethodType, newNote?: Note): Promise<boolean> => {
      console.log("sendMessage ======", method, newNote);
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage<ToBackgroundMessage>(
          {
            method: method,
            type: "App",
            page_url: window.location.href, // newNote.page_info.page_url,
            pageInfo: {
              page_url: window.location.href,
              page_title: document.title,
            },
            note: newNote,
          },
          (response: Note[]) => {
            console.log("response ======", response, chrome.runtime.lastError);
            if (chrome.runtime.lastError) {
              reject();
            } else {
              setNotes(response);
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
    chrome.runtime.sendMessage<ToBackgroundMessage>({
      method: OPEN_OPTION_PAGE,
      type: "App",
      page_url: "",
    });
  };

  useEffect(() => {
    getAllNotes();
    chrome.runtime.onMessage.addListener(function (request: ToContentScriptMessage, sender) {
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
    });
  }, []);

  return (
    <>
      <GlobalStyle />
      <SContainer>
        {notes.map((note: Note) => (
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
