import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import {
  ToBackgroundMessage,
  ToBackgroundMessageMethod,
  ToBackgroundMessageResponse,
} from "../types/Actions";
import { Note } from "../types/Note";
import { CREATE_NOTE, DELETE_NOTE, GET_ALL_NOTES, OPTIONS, POPUP } from "../actions";
import IconButton from "../components/Button/IconButton";
import { EyeIcon, PlusIcon, TrashIcon } from "../components/Icon";

type FormData = {
  username: string;
};

const Options = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentUrl, setCurrentUrl] = useState("");
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab>();

  const sendAction = useCallback(
    (
      method: ToBackgroundMessageMethod,
      tab?: chrome.tabs.Tab,
      targetNote?: Note
    ): Promise<boolean> => {
      console.log("sendMessage ======", method, targetNote);

      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage<ToBackgroundMessage, ToBackgroundMessageResponse>(
          {
            method: method,
            senderType: OPTIONS,
            page_url: tab?.url || "",
            tab,
            targetNote,
          },
          ({ notes, error }) => {
            console.log("response ======", notes, chrome.runtime.lastError);
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError.message);
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

  const onClickAddNote = () => {
    if (currentTab) sendAction(CREATE_NOTE, currentTab);
  };

  const onClickDelete = (note: Note) => {
    if (currentTab) sendAction(DELETE_NOTE, currentTab, note);
  };

  useEffect(() => {
    sendAction(GET_ALL_NOTES);
  }, []);

  return (
    <>
      <div className="p-4" style={{ width: "320px" }}>
        <IconButton onClick={onClickAddNote}>
          <PlusIcon />
        </IconButton>
        <IconButton onClick={() => {}}>
          <EyeIcon />
        </IconButton>
        {notes.length === 0 ? (
          <p>メモがありません</p>
        ) : (
          <ul>
            {notes.map((note) => (
              <li key={note.id}>
                <p>
                  {note.title}:{note.description}
                  <IconButton onClick={() => note.id && onClickDelete(note)}>
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
    <Options />
  </React.StrictMode>,
  document.getElementById("root")
);
