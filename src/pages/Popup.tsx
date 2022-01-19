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

  const onClickNotesButton = () => {
    if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
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
          <SHeaderLeft>
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
          </SHeaderLeft>
          <SHeaderRight>
            <SIconButton onClick={onClickNotesButton}>
              <NotesIcon fill="rgba(0, 0, 0, 0.4)" />
            </SIconButton>
          </SHeaderRight>
        </SHeader>
        <SContent>
          {!isEnabled && (
            <SOptionMessageText>この画面ではメモの作成はできません</SOptionMessageText>
          )}
          {isEnabled && notes.length === 0 && (
            <>
              <SOptionActionMessageText>
                <SSubdirectoryArrowLeftIcon />
                <SOptionActionMessageSpan>メモを作成する。</SOptionActionMessageSpan>
              </SOptionActionMessageText>
              <SOptionMessageText>
                もしくは、右クリック「メモを追加する」から作成できます。
              </SOptionMessageText>
            </>
          )}
          {isEnabled && notes.length !== 0 && (
            <ul>
              {notes.map((note) => (
                <SOptionListItem key={note.id}>
                  <SOptionListItemLeft disabled={note.is_fixed}>{note.title}</SOptionListItemLeft>
                  <SOptionListItemRight>
                    <SOptionPinIconButton
                      onClick={() => onClickPin(note)}
                      isPin={!!note.is_fixed}
                      disabled={!note.is_fixed}
                    >
                      <PinIcon fill="rgba(0, 0, 0, 0.4)" />
                    </SOptionPinIconButton>

                    <SOptionIconButton onClick={() => onClickDelete(note)}>
                      <TrashIcon fill="rgba(0, 0, 0, 0.4)" />
                    </SOptionIconButton>
                  </SOptionListItemRight>
                </SOptionListItem>
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

const SOptionMessageText = styled.p`
  padding: 1em;
  color: #aaa;
`;

const SOptionActionMessageText = styled.p`
  padding: 1em;
`;

const SOptionActionMessageSpan = styled.span`
  font-size: 1.25em;
`;

const SSubdirectoryArrowLeftIcon = styled(SubdirectoryArrowLeftIcon)`
  width: 2em;
  height: 2em;
  transform: rotate(90deg);
  margin-left: 0.75em;
  margin-right: 0.5em;
`;

const SOptionListItem = styled.li`
  display: flex;
  justify-content: space-between;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const SOptionListItemLeft = styled.div<{ disabled?: boolean }>`
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
const SOptionListItemRight = styled.div`
  padding: 1em;
`;

const SIconButton = styled(IconButton)`
  margin-left: 1em;
  width: 2em;
  height: 2em;
  padding: 0.25em;
`;

const SOptionPinIconButton = styled(IconButton)<{ isPin: boolean }>`
  margin: 0 0.5em;

  ${({ isPin }) =>
    isPin &&
    css`
      opacity: 0;

      &:hover {
        opacity: 1;
      }
    `}

  ${({ disabled }) => css``}
`;

const SOptionIconButton = styled(IconButton)`
  margin: 0 0.5em;
`;

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
