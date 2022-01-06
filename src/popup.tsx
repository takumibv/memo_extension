import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import { ToBackgroundMessage, ToBackgroundMessageMethod } from "./types/Actions";
import { Note } from "./types/Note";
import { CREATE_NOTE, DELETE_NOTE, GET_ALL_NOTES, POPUP } from "./actions";
import IconButton from "./components/Button/IconButton";
import { PlusIcon, TrashIcon } from "./components/Icon";

type FormData = {
  username: string;
};

const Popup = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentUrl, setCurrentUrl] = useState("");

  const sendAction = useCallback(
    (method: ToBackgroundMessageMethod, page_url: string, targetNote?: Note): Promise<boolean> => {
      console.log("sendMessage ======", method, targetNote);

      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage<ToBackgroundMessage>(
          {
            method: method,
            senderType: POPUP,
            page_url,
            targetNote,
          },
          (notes: Note[]) => {
            console.log("response ======", notes, chrome.runtime.lastError);
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError.message);
            } else {
              setNotes(notes);
              resolve(true);
            }
          }
        );
      });
    },
    []
  );

  const onClickAddNote = () => {
    if (currentUrl !== "") sendAction(CREATE_NOTE, currentUrl);
  };

  const onClickDelete = (noteId: number) => {
    if (currentUrl !== "") sendAction(DELETE_NOTE, currentUrl, { id: noteId });
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      console.log("tab", tab);
      if (tab && tab.url) {
        setCurrentUrl(tab.url);
        sendAction(GET_ALL_NOTES, tab.url);
      } else {
        // TODO あとで消す
        chrome.action.setBadgeText({ text: "x" });
        chrome.action.setBadgeBackgroundColor({ color: "#DB1C21" });
      }
    });
  }, []);

  return (
    <>
      <div className="p-4" style={{ width: "320px" }}>
        <IconButton onClick={onClickAddNote}>
          <PlusIcon />
        </IconButton>
        {notes.length === 0 ? (
          <p>メモがありません</p>
        ) : (
          <ul>
            {notes.map((note) => (
              <li key={note.id}>
                <p>
                  {note.title}:{note.description}
                  <IconButton onClick={() => note.id && onClickDelete(note.id)}>
                    <TrashIcon />
                  </IconButton>
                </p>
                <hr />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
