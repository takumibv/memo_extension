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
  SList,
  SListItem,
  SListItemLeft,
  SListItemRight,
  SIconButton,
} from './Popup.style';
import * as sender from '../../../chrome-extension/src/message/sender/popup';
import { t } from '@extension/i18n';
import { FabIconButton } from '@extension/shared/lib/components/Button';
import { I18N } from '@extension/shared/lib/i18n/keys';
import { Bars3Icon, PlusIcon, TrashIcon, ArrowPathIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import Tooltip from '@mui/material/Tooltip';
import { useEffect, useState } from 'react';
import type { Note } from '@extension/shared/lib/types/Note';

export const Popup = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab>();

  const onClickAddNote = () => {
    if (currentTab) {
      sender
        .sendCreateNote(currentTab)
        .then(({ notes }) => {
          if (notes) setNotes(notes);
          setIsEnabled(true);
        })
        .catch(() => {
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
    const { title } = note;
    if (currentTab && confirm(`"${title ?? t(I18N.NOTE)}" ${t(I18N.CONFIRM_REMOVE_NEXT_NOTE)}`)) {
      sender
        .sendDeleteNote(currentTab, note)
        .then(({ notes }) => {
          if (notes) setNotes(notes);
          setIsEnabled(true);
        })
        .catch(() => {
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
        .catch(() => {
          setIsEnabled(false);
        })
        .finally(() => {
          // window.close();
        });
    }
  };

  const onClickResetPosition = (note: Note) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { position_x, position_y, ..._note } = note;
    if (currentTab) {
      sender
        .sendUpdateNote(currentTab, {
          ..._note,
          is_fixed: true,
          is_open: true,
        })
        .then(({ notes }) => {
          if (notes) setNotes(notes);
          setIsEnabled(true);
        })
        .catch(() => {
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
          .then(data => {
            const { notes, isVisible } = data;
            if (notes) setNotes(notes);
            if (isVisible !== undefined) setIsVisible(isVisible);
            setIsEnabled(true);
          })
          .catch(() => {
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
      <div style={{ width: '320px' }}>
        <SHeader>
          <SHeaderLeft>
            <FabIconButton onClick={onClickAddNote} disabled={!isEnabled}>
              <PlusIcon fill="#fff" />
            </FabIconButton>
          </SHeaderLeft>
          <SHeaderRight>
            <SHeaderIconButton onClick={onClickNotesButton}>
              <Bars3Icon fill="rgba(0, 0, 0, 0.4)" />
            </SHeaderIconButton>
          </SHeaderRight>
        </SHeader>
        <SContent>
          {!isEnabled && <SMessageText>{t(I18N.NOTE_UNAVAILABLE)}</SMessageText>}
          {isEnabled && notes.length === 0 && (
            <>
              <SActionMessageText>
                <SSubdirectoryArrowLeftIcon />
                <SActionMessageSpan>{t(I18N.NO_NOTE_CREATED)}</SActionMessageSpan>
              </SActionMessageText>
              <SMessageText>{t(I18N.NO_NOTE_CREATED_OPTION)}</SMessageText>
            </>
          )}
          {isEnabled && notes.length !== 0 && (
            <SList>
              {notes.map(note => (
                <SListItem key={note.id}>
                  <SListItemLeft disabled={note.is_fixed} onClick={() => !note.is_fixed && onClickNote(note)}>
                    <span>{note.title || note.description || t(I18N.NEW_NOTE_TITLE)}</span>
                    {!note.is_fixed && <ChevronRightIcon fill="rgba(0, 0, 0, 0.5)" />}
                  </SListItemLeft>
                  <SListItemRight>
                    <Tooltip title={t(I18N.RESET_POSITION)} placement="top">
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
            </SList>
          )}
        </SContent>
      </div>
    </>
  );
};

export default Popup;
