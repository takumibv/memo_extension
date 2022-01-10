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
import { CREATE_NOTE, DELETE_NOTE, GET_ALL_NOTES, POPUP, UPDATE_NOTE } from "../actions";
import IconButton from "../components/Button/IconButton";
import { EyeIcon, EyeOffIcon, PinIcon, PlusIcon, TrashIcon } from "../components/Icon";
import FabIconButton from "../components/Button/FabIconButton";
import styled, { createGlobalStyle } from "styled-components";
import { resetCSS } from "../resetCSS";

type FormData = {
  username: string;
};

const Popup = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
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
        chrome.runtime.sendMessage<ToBackgroundMessage, ToBackgroundMessageResponse>(
          {
            method: method,
            senderType: POPUP,
            page_url: tab?.url || "",
            tab,
            targetNote,
          },
          ({ notes, error }) => {
            console.log("response ======", notes, chrome.runtime.lastError);
            if (chrome.runtime.lastError) {
              setIsEnabled(false);
              reject(chrome.runtime.lastError.message);
            } else if (error) {
              setIsEnabled(false);
              reject(error.message);
            } else {
              setNotes(notes || []);
              setIsEnabled(true);
              resolve(true);
            }
          }
        );
      });
    },
    []
  );

  const onClickAddNote = () => {
    if (currentTab) {
      sendAction(CREATE_NOTE, currentTab).then((result) => {
        window.close();
      });
    }
  };

  const onClickDelete = (note: Note) => {
    const { id, title } = note;
    if (currentTab && confirm(`${title ? `「${title}」` : "メモ"}を削除してよろしいですか？`)) {
      sendAction(DELETE_NOTE, currentTab, note);
    }
  };

  const onClickPin = (note: Note) => {
    if (currentTab) {
      sendAction(UPDATE_NOTE, currentTab, { ...note, is_fixed: !note.is_fixed });
    }
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
      }
    });
  }, []);

  return (
    <>
      <GlobalStyle />
      <div style={{ width: "320px" }}>
        <SHeader>
          <FabIconButton onClick={onClickAddNote} disabled={!isEnabled}>
            <PlusIcon fill="#fff" />
          </FabIconButton>
          <SIconButton onClick={() => setIsVisible(!isVisible)} disabled={!isEnabled}>
            {isVisible ? (
              <EyeIcon fill="rgba(0, 0, 0, 0.4)" />
            ) : (
              <EyeOffIcon fill="rgba(0, 0, 0, 0.4)" />
            )}
          </SIconButton>
        </SHeader>
        <SContent>
          {!isEnabled && <p>この画面ではメモの作成はできません</p>}
          {isEnabled && notes.length === 0 && <p>メモがありません</p>}
          {isEnabled && notes.length !== 0 && (
            <ul>
              {notes.map((note) => (
                <li key={note.id}>
                  <p>
                    {note.title}:{note.description}
                    {note.is_fixed && (
                      <IconButton onClick={() => onClickPin(note)}>
                        <PinIcon />
                      </IconButton>
                    )}
                    <IconButton onClick={() => onClickDelete(note)}>
                      <TrashIcon />
                    </IconButton>
                  </p>
                  <hr />
                </li>
              ))}
            </ul>
          )}
        </SContent>
      </div>
    </>
  );
};

const GlobalStyle = createGlobalStyle`
  ${resetCSS}
`;

const SHeader = styled.header`
  padding: 1em;
  display: flex;
  align-items: center;
`;

const SContent = styled.div`
  padding: 1em 1em 2em;
`;

const SIconButton = styled(IconButton)`
  margin-left: 1em;
  width: 2em;
  height: 2em;
  padding: 0.25em;
`;

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
