import React, { useEffect, useState } from "react";
import { Note } from "../../types/Note";
import {
  Bars3Icon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import FabIconButton from "../../components/Button/FabIconButton";
import Tooltip from "@mui/material/Tooltip";
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
import { msg } from "../../utils";

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
    if (currentTab && confirm(`"${title ?? msg("note")}" ${msg("confirm_remove_next_note_msg")}`)) {
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
        .then(() => {
          setIsEnabled(true);
        })
        .catch((error) => {
          setIsEnabled(false);
        })
        .finally(() => {
          // window.close();
        });
    }
  };

  const onClickResetPosition = (note: Note) => {
    const { position_x, position_y, ..._note } = note;
    if (currentTab) {
      sender
        .sendUpdateNote(currentTab, {
          ..._note,
          is_fixed: true,
          is_open: true,
        })
        .then(({ notes }) => {
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
          .then((data) => {
            const { notes, isVisible } = data;
            notes && setNotes(notes);
            isVisible !== undefined && setIsVisible(isVisible);
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
            {/* <SHeaderIconButton onClick={onClickVisibleButton} disabled={!isEnabled}>
              {isVisible ? (
                <EyeIcon fill="rgba(0, 0, 0, 0.4)" />
              ) : (
                <EyeSlashIcon fill="rgba(0, 0, 0, 0.4)" />
              )}
            </SHeaderIconButton> */}
          </SHeaderLeft>
          <SHeaderRight>
            <SHeaderIconButton onClick={onClickNotesButton}>
              <Bars3Icon fill="rgba(0, 0, 0, 0.4)" />
            </SHeaderIconButton>
          </SHeaderRight>
        </SHeader>
        <SContent>
          {!isEnabled && <SMessageText>{msg("note_unavailable_msg")}</SMessageText>}
          {isEnabled && notes.length === 0 && (
            <>
              <SActionMessageText>
                <SSubdirectoryArrowLeftIcon />
                <SActionMessageSpan>{msg("no_note_created_msg")}</SActionMessageSpan>
              </SActionMessageText>
              <SMessageText>{msg("no_note_created_option_msg")}</SMessageText>
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
                    {note.title || note.description}
                  </SListItemLeft>
                  <SListItemRight>
                    <Tooltip title={msg("reset_position_msg")} placement="top">
                      <span>
                        <SIconButton onClick={() => onClickResetPosition(note)}>
                          <ArrowPathIcon fill="rgba(0, 0, 0, 0.5)" />
                        </SIconButton>
                      </span>
                    </Tooltip>

                    <SIconButton onClick={() => onClickDelete(note)}>
                      <TrashIcon fill="rgba(0, 0, 0, 0.5)" />
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
