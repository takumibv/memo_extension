import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import styled, { createGlobalStyle } from "styled-components";
import {
  CREATE_NOTE,
  UPDATE_NOTE_TITLE,
  UPDATE_NOTE_DESCRIPTION,
  UPDATE_NOTE_IS_OPEN,
  UPDATE_NOTE_IS_FIXED,
  DELETE_NOTE,
  MOVE_NOTE,
  RESIZE_NOTE,
  OPEN_OPTION_PAGE,
  NoteActionType,
  UPDATE_NOTE,
  GET_ALL_NOTES,
  SET_ALL_NOTES,
} from "./actions";
import { Note } from "./types/Note";
import { baseCSS, resetCSS } from "./resetCSS";
import StickyNote from "./components/StickyNote";
import { ActionMesssageConfig } from "./types/Actions";

const ROOT_DOM_ID = "react-container-for-note-extension";

/** ----------------------------------------
 * Initial Setup
 * ----------------------------------------- */
const initialize = () => {
  console.log("=== initialize ===");

  // メモを配置
  injectDomElements();
};

/** ----------------------------------------
 * DOMを挿入
 * ページ上にメモを配置する
 * ----------------------------------------- */
const injectDomElements = () => {
  const rootElement = document.createElement("div");
  rootElement.id = ROOT_DOM_ID;
  document.body.appendChild(rootElement);
  ReactDOM.render(<Main />, rootElement);
};

// TODO Mainをコンポーネント分離

const GlobalStyle = createGlobalStyle`
  #${ROOT_DOM_ID} {
    font-size: 16px !important;
    font-family: -apple-system,"BlinkMacSystemFont","Hiragino Kaku Gothic ProN","Hiragino Sans",Meiryo,sans-serif;
    line-height: 1.25 !important;
  }
`;

const SContainer = styled.div`
  ${baseCSS("div")}

  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1250;
`;

const SButton = styled.button`
  ${baseCSS("button")}

  border-width: 0;
  border-style: solid;
  border-color: currentColor;
  -webkit-appearance: button;
  background-color: #e27900;
  background-image: none;
  line-height: inherit;
  color: #fff;
  margin: 8px;
  padding: 4px 8px;
  border-radius: 99px;
  pointer-events: initial;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

const Main = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  // TODO sendMessageを精査
  // const sendMessage = (action: string) => {
  //   const updated_notes = {};

  //   switch (action) {
  //     case CREATE_NOTE:
  //       save(CREATE_NOTE, updated_notes);
  //       break;
  //     case UPDATE_NOTE_TITLE:
  //       // var updated_notes = this.state.notes;
  //       // if (updated_notes[action.index].title === action.title) { break; }
  //       // updated_notes[action.index].title       = action.title;
  //       // updated_notes[action.index].updated_at  = new Date().toISOString();
  //       // this.setState({notes: updated_notes});
  //       save(UPDATE_NOTE_TITLE, updated_notes);
  //       break;
  //     case UPDATE_NOTE_DESCRIPTION:
  //       // var updated_notes = this.state.notes;
  //       // if (updated_notes[action.index].description === action.description) { break; }
  //       // updated_notes[action.index].description = action.description;
  //       // updated_notes[action.index].updated_at  = new Date().toISOString();
  //       // this.setState({notes: updated_notes});
  //       save(UPDATE_NOTE_DESCRIPTION, updated_notes);
  //       break;
  //     case UPDATE_NOTE_IS_OPEN:
  //       // var updated_notes = this.state.notes;
  //       // updated_notes[action.index].is_open     = action.is_open;
  //       // updated_notes[action.index].updated_at  = new Date().toISOString();
  //       // this.setState({notes: updated_notes});
  //       save(UPDATE_NOTE_IS_OPEN, updated_notes);
  //       break;
  //     case UPDATE_NOTE_IS_FIXED:
  //       // var updated_notes = this.state.notes;
  //       // updated_notes[action.index].is_fixed     = action.is_fixed;
  //       // const fix_position = updated_notes[action.index].is_fixed ? -1 : 1;
  //       // updated_notes[action.index].position_x += $(window).scrollLeft() * fix_position;
  //       // updated_notes[action.index].position_y += $(window).scrollTop() * fix_position;
  //       // if(updated_notes[action.index].position_x < 0){ updated_notes[action.index].position_x = 0; }
  //       // if(updated_notes[action.index].position_y < 0){ updated_notes[action.index].position_y = 0; }
  //       // updated_notes[action.index].updated_at  = new Date().toISOString();
  //       // this.setState({notes: updated_notes});
  //       save(UPDATE_NOTE_IS_FIXED, updated_notes);
  //       break;
  //     case DELETE_NOTE:
  //       // var updated_notes = this.state.notes;
  //       // var delete_note   = this.state.notes[action.index];
  //       // updated_notes.splice(action.index, 1);
  //       // this.setState({notes: updated_notes});
  //       delete_note(delete_note);
  //       break;
  //     case MOVE_NOTE:
  //       // var updated_notes = this.state.notes;
  //       // if (updated_notes[action.index].position_x === action.position_x &&
  //       //   updated_notes[action.index].position_y === action.position_y) {
  //       //   break;
  //       // }
  //       // updated_notes[action.index].position_x = action.position_x;
  //       // updated_notes[action.index].position_y = action.position_y;
  //       // if (updated_notes[action.index].is_fixed) {
  //       //   updated_notes[action.index].position_x -= $(window).scrollLeft();
  //       //   updated_notes[action.index].position_y -= $(window).scrollTop();
  //       // }
  //       // if(updated_notes[action.index].position_x < 0){ updated_notes[action.index].position_x = 0; }
  //       // if(updated_notes[action.index].position_y < 0){ updated_notes[action.index].position_y = 0; }
  //       // updated_notes[action.index].updated_at = new Date().toISOString();
  //       // this.setState({notes: updated_notes});
  //       save(MOVE_NOTE, updated_notes);
  //       break;
  //     case RESIZE_NOTE:
  //       // var updated_notes = this.state.notes;
  //       // if (!updated_notes[action.index].is_open) {
  //       //   break;
  //       // }
  //       // updated_notes[action.index].width       = action.width;
  //       // updated_notes[action.index].height      = action.height;
  //       // updated_notes[action.index].updated_at  = new Date().toISOString();
  //       // this.setState({notes: updated_notes});
  //       save(RESIZE_NOTE, updated_notes);
  //       break;
  //     case OPEN_OPTION_PAGE:
  //       open_option_page();
  //       break;
  //     default:
  //       break;
  //   }
  // };

  const save = useCallback((method: NoteActionType, updated_note?: Note): Promise<boolean> => {
    console.log("sendMessage ======", method, updated_note);
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage<ActionMesssageConfig>(
        {
          method: method,
          action_type: "App",
          page_url: "", // updated_note.page_info.page_url,
          note: updated_note,
        },
        (response: Note[]) => {
          console.log("response ======", response);
          if (chrome.runtime.lastError) {
            reject();
          } else {
            setNotes(response);
            resolve(true);
          }
        }
      );
    });
  }, []);
  const getAllNotes = useCallback(async () => {
    return await save(GET_ALL_NOTES);
  }, []);
  const createNote = useCallback(async () => {
    return await save(CREATE_NOTE);
  }, []);
  const updateNote = useCallback(async (note: Note) => {
    return await save(UPDATE_NOTE, note);
  }, []);
  const deleteNote = useCallback(async (note: Note) => {
    return await save(DELETE_NOTE, note);
  }, []);
  const open_option_page = () => {
    chrome.runtime.sendMessage<ActionMesssageConfig>({
      method: OPEN_OPTION_PAGE,
      action_type: "App",
      page_url: "",
    });
  };

  useEffect(() => {
    getAllNotes();
    chrome.runtime.onMessage.addListener(function (
      request: { action: string; notes: Note[] },
      sender
    ) {
      // TODO background → contentScript のアクションを受け取る
      console.log("=== onMessage ===", request, sender);
      const { action, notes } = request;

      switch (action) {
        case SET_ALL_NOTES:
          setNotes(notes);
          break;
        default:
          break;
      }
    });
  }, []);

  useEffect(() => {
    console.log("=== useEffect notes ===");
  }, [notes]);
  useEffect(() => {
    console.log("=== useEffect setNotes ===");
  }, [setNotes]);

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

(function () {
  if (window.top === window) {
    const setLoaded = () => initialize();

    // Check page has loaded and if not add listener for it
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setLoaded);
    } else {
      setLoaded();
    }
  }
})();
