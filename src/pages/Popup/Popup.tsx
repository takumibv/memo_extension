import React, { useEffect, useState } from "react";
import { Note } from "../../types/Note";
import {
  EyeIcon,
  EyeOffIcon,
  NotesIcon,
  PinIcon,
  PlusIcon,
  TrashIcon,
} from "../../components/Icon";
import FabIconButton from "../../components/Button/FabIconButton";
import { Tooltip } from "@mui/material";
import {
  GlobalStyle,
  SHeader,
  SHeaderIconButton,
  SHeaderLeft,
  SHeaderRight,
  SContent,
  SMessageText,
  SActionMessageText,
  SSubdirectoryArrowLeftIcon,
  SActionMessageSpan,
  SListItem,
  SListItemLeft,
  SPinIconButton,
  SListItemRight,
  SIconButton,
} from "./Popup.style";
import * as sender from "../message/sender/popup";

export const Popup = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab>();

  const onClickAddNote = () => {
    if (currentTab) {
      sender
        .sendCreateNote(currentTab)
        .then(({ notes }) => {
          notes && setNotes(notes);
          setIsEnabled(true);
        })
        .catch((error) => {
          setIsEnabled(false);
        })
        .finally(() => {
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
      sender
        .sendDeleteNote(currentTab, note)
        .then(({ notes }) => {
          notes && setNotes(notes);
          setIsEnabled(true);
        })
        .catch((error) => {
          setIsEnabled(false);
        });
    }
  };

  const onClickNote = (note: Note) => {
    if (currentTab) {
      sender
        .sendScrollToTargetNote(currentTab, note)
        .then(({ notes }) => {
          notes && setNotes(notes);
          setIsEnabled(true);
        })
        .catch((error) => {
          setIsEnabled(false);
        })
        .finally(() => {
          window.close();
        });
    }
  };

  const onClickPin = (note: Note) => {
    if (currentTab) {
      sender
        .sendUpdateNote(currentTab, { ...note, is_fixed: !note.is_fixed })
        .then(({ notes }) => {
          console.log("onClickPin===>", notes);
          notes && setNotes(notes);
          setIsEnabled(true);
        })
        .catch((error) => {
          setIsEnabled(false);
        });
    }
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab && tab.url) {
        setCurrentTab(tab);
        sender
          .fetchAllNotes(tab)
          .then(({ notes }) => {
            notes && setNotes(notes);
            setIsEnabled(true);
          })
          .catch((error) => {
            setIsEnabled(false);
          });
      } else {
        setIsEnabled(false);
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
                <Tooltip title="TODO" placement="top" open={false}>
                  <SListItem key={note.id}>
                    <SListItemLeft
                      disabled={note.is_fixed}
                      onClick={() => !note.is_fixed && onClickNote(note)}
                    >
                      {note.title || note.description}
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
                </Tooltip>
              ))}
            </ul>
          )}
        </SContent>
      </div>
    </>
  );
};
