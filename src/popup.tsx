import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import { ToBackgroundMessage, ToBackgroundMessageMethod } from "./types/Actions";
import { Note } from "./types/Note";
import { CREATE_NOTE, DELETE_NOTE, GET_ALL_NOTES, POPUP } from "./actions";
import IconButton from "./components/Button/IconButton";
import { EyeIcon, PlusIcon, TrashIcon } from "./components/Icon";

type FormData = {
  username: string;
};

const Popup = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentUrl, setCurrentUrl] = useState("");
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab>();

  const sendAction = useCallback(
    (
      method: ToBackgroundMessageMethod,
      tab: chrome.tabs.Tab,
      targetNote?: Note
    ): Promise<boolean> => {
      console.log("sendMessage ======", method, targetNote);

      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage<ToBackgroundMessage>(
          {
            method: method,
            senderType: POPUP,
            page_url: tab?.url || "",
            tab,
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
    if (currentTab) sendAction(CREATE_NOTE, currentTab);
  };

  const onClickDelete = (noteId: number) => {
    if (currentTab) sendAction(DELETE_NOTE, currentTab, { id: noteId });
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      console.log("tab", tab);
      if (tab && tab.url) {
        setCurrentUrl(tab.url);
        setCurrentTab(tab);
        sendAction(GET_ALL_NOTES, tab);
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
