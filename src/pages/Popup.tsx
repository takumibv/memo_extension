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
import {
  CREATE_NOTE,
  DELETE_NOTE,
  GET_ALL_NOTES,
  POPUP,
  SCROLL_TO_TARGET_NOTE,
  UPDATE_NOTE,
} from "../actions";
import IconButton from "../components/Button/IconButton";
import {
  EyeIcon,
  EyeOffIcon,
  NotesIcon,
  PinIcon,
  PlusIcon,
  SubdirectoryArrowLeftIcon,
  TrashIcon,
} from "../components/Icon";
import FabIconButton from "../components/Button/FabIconButton";
import styled, { createGlobalStyle, css } from "styled-components";
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
              notes && setNotes(notes);
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

  const onClickNotesButton = () => {
    if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
  };

  const onClickDelete = (note: Note) => {
    const { id, title } = note;
    if (currentTab && confirm(`${title ? `「${title}」` : "メモ"}を削除してよろしいですか？`)) {
      sendAction(DELETE_NOTE, currentTab, note);
    }
  };

  const onClickNote = (note: Note) => {
    if (currentTab) {
      sendAction(SCROLL_TO_TARGET_NOTE, currentTab, note).then((result) => {
        window.close();
      });
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
          <SHeaderLeft>
            <FabIconButton onClick={onClickAddNote} disabled={!isEnabled}>
              <PlusIcon fill="#fff" />
            </FabIconButton>
            <SHeaderIconButton onClick={() => setIsVisible(!isVisible)} disabled={!isEnabled}>
              {isVisible ? (
                <EyeIcon fill="rgba(0, 0, 0, 0.4)" />
              ) : (
                <EyeOffIcon fill="rgba(0, 0, 0, 0.4)" />
              )}
            </SHeaderIconButton>
          </SHeaderLeft>
          <SHeaderRight>
            <SHeaderIconButton onClick={onClickNotesButton}>
              <NotesIcon fill="rgba(0, 0, 0, 0.4)" />
            </SHeaderIconButton>
          </SHeaderRight>
        </SHeader>
        <SContent>
          {!isEnabled && <SMessageText>この画面ではメモの作成はできません</SMessageText>}
          {isEnabled && notes.length === 0 && (
            <>
              <SActionMessageText>
                <SSubdirectoryArrowLeftIcon />
                <SActionMessageSpan>メモを作成する。</SActionMessageSpan>
              </SActionMessageText>
              <SMessageText>もしくは、右クリック「メモを追加する」から作成できます。</SMessageText>
            </>
          )}
          {isEnabled && notes.length !== 0 && (
            <ul>
              {notes.map((note) => (
                <SListItem key={note.id}>
                  <SListItemLeft
                    disabled={note.is_fixed}
                    onClick={() => !note.is_fixed && onClickNote(note)}
                  >
                    {note.title}
                  </SListItemLeft>
                  <SListItemRight>
                    <SPinIconButton
                      onClick={() => onClickPin(note)}
                      isPin={!!note.is_fixed}
                      disabled={!note.is_fixed}
                    >
                      <PinIcon fill="rgba(0, 0, 0, 1)" />
                    </SPinIconButton>

                    <SIconButton onClick={() => onClickDelete(note)}>
                      <TrashIcon fill="rgba(0, 0, 0, 0.4)" />
                    </SIconButton>
                  </SListItemRight>
                </SListItem>
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

const SHeaderLeft = styled.div`
  flex: 1;
`;

const SHeaderRight = styled.div``;

const SContent = styled.div``;

const SMessageText = styled.p`
  padding: 1em;
  color: #aaa;
`;

const SActionMessageText = styled.p`
  padding: 1em;
`;

const SActionMessageSpan = styled.span`
  font-size: 1.25em;
`;

const SSubdirectoryArrowLeftIcon = styled(SubdirectoryArrowLeftIcon)`
  width: 2em;
  height: 2em;
  transform: rotate(90deg);
  margin-left: 0.75em;
  margin-right: 0.5em;
`;

const SListItem = styled.li`
  display: flex;
  justify-content: space-between;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const SListItemLeft = styled.div<{ disabled?: boolean }>`
  padding: 1em;
  flex: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  ${({ disabled }) =>
    disabled &&
    css`
      cursor: default;

      &:hover {
        background-color: transparent;
      }
    `}
`;
const SListItemRight = styled.div`
  padding: 1em;
`;

const SHeaderIconButton = styled(IconButton)`
  margin-left: 1em;
  width: 2em;
  height: 2em;
  padding: 0.25em;
`;

const SPinIconButton = styled(IconButton)<{ isPin: boolean }>`
  margin: 0 0.5em;

  ${({ isPin }) =>
    isPin &&
    css`
      opacity: 0.2;

      &:hover {
        opacity: 1;
      }
    `}

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 1;
    `}
`;

const SIconButton = styled(IconButton)`
  margin: 0 0.5em;
`;

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
