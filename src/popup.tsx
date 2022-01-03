import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import "./index.pcss";

type FormData = {
  username: string;
};

const Popup = () => {
  const [username, setUsername] = useState("");
  const [currentStats, setCurrentStats] = useState("");
  const [currentTopLanguage, setCurrentTopLanguage] = useState("");
  const {
    register,
    setValue,
    handleSubmit,
    formState,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = handleSubmit((data) => {
    console.log(data["username"]);
    setUsername(data["username"]);
  });

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
      console.log(tab[0].id, tab[0].url);
    });

    const value = "test";
    chrome.storage.sync.set({ key: value }, function () {
      console.log("Value is set to " + value);
    });

    // バックグラウンドから現状の設定値を持ってきて、UIにセットする。
    chrome.runtime.getBackgroundPage((backgroundPage) => {
      console.log("=== backgroundPage ===", backgroundPage);
      // const bg = backgroundPage?.bg;
      // const page_url = bg.page_info ? bg.page_info.page_url : null;
      // const notes = bg.page_info ? bg.page_info.getNotes() : [];
      // if (!bg.canShowNote()) {
      //   $('#page_infos').append(this.renderNoNoteMsg(chrome.i18n.getMessage('cannot_show_note_msg')));
      //   $('#make_note_button').prop("disabled", true);
      // } else if (notes.length === 0) {
      //   $('#page_infos').append(this.renderNoNoteMsg(chrome.i18n.getMessage('no_note_created_msg'), chrome.i18n.getMessage('no_note_created_option_msg')));
      // } else {
      //   for(let i in notes) {
      //     $('#page_infos').append(this.renderNote(notes[i]));
      //   }
      // }
    });
  }, []);

  return (
    <>
      <div className="p-4">
        <div className="w-80">
          <div>
            <header>GitHub Language Stats Extension</header>
          </div>
          <div>
            <div dangerouslySetInnerHTML={{ __html: currentStats }} />
            <div dangerouslySetInnerHTML={{ __html: currentTopLanguage }} />
          </div>
          <div>
            <form onSubmit={onSubmit}>
              <label>GitHub username</label>
              <input placeholder="GitHub username" {...register("username", { required: true })} />
              <p>{errors.username && "GitHub username is required"}</p>
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
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
