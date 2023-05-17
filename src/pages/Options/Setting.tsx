import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { GlobalStyle, SContainer, SMain, SMainContent } from "./index.style";
import { SSettingItem, SSettingItemTitle, SSettingItemContent } from "./Setting.style";
import OptionHeader from "../../components/OptionHeader/OptionHeader";
import * as sender from "../message/sender/options";
import ColorPicker from "../../components/ColorPicker/ColorPicker";
import { msg } from "../../utils";
import { Note } from "../../types/Note";
import { PageInfo } from "../../types/PageInfo";
import { useNoteDownload } from "../../hooks/useNoteDownload";
import Button from "../../components/Button/Button";
import Usage from "../../components/Usage/Usage";

interface Props extends RouteComponentProps<{}> {}

const Setting: React.FC<Props> = () => {
  const [defaultColor, setDefaultColor] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [pageInfos, setPageInfos] = useState<PageInfo[]>([]);
  const { handleDownload } = useNoteDownload();

  const onClickDefaultColor = (color: string) => {
    sender.sendUpdateDefaultColor(color).then(({ setting }) => {
      setDefaultColor(setting?.default_color ?? "");
    });
  };

  const handleDownloadCSV = () => {
    const copyHead = "id, title, description, url\n";
    const copyText = notes
      .map((note) => {
        return `${note.id}, ${note.title ? `"${note.title}"` : ""}, ${
          note.description ? `"${note.description}"` : ""
        }, ${pageInfos.find((pageInfo) => pageInfo.id === note.page_info_id)?.page_url}`;
      })
      .join("\n");
    handleDownload(copyHead + copyText);
  };

  const handleDownloadText = () => {
    const copyText = notes
      .map((note) => {
        return `id: ${note.id}
title: ${note.title ?? ""}
page: ${pageInfos.find((pageInfo) => pageInfo.id === note.page_info_id)?.page_url}
content:
${note.description ?? ""}`;
      })
      .join("\n------------------------------------------------------------\n");
    handleDownload(copyText, "text/plain", "txt");
  };

  useEffect(() => {
    setIsLoading(true);
    sender
      .sendFetchSetting()
      .then(({ setting }) => {
        setDefaultColor(setting?.default_color ?? "");
      })
      .finally(() => {
        setIsLoading(false);
      });
    sender.sendFetchAllNotes().then(({ notes, pageInfos }) => {
      notes && setNotes(notes);
      pageInfos && setPageInfos(pageInfos);
    });
  }, []);

  return (
    <>
      <GlobalStyle />
      <div className="p-4">
        <SContainer>
          <OptionHeader current="setting" />
          <SMain>
            <SMainContent>
              {!isLoading && (
                <>
                  <SSettingItem>
                    <SSettingItemTitle>{msg("default_color_msg")}</SSettingItemTitle>
                    <SSettingItemContent>
                      <ColorPicker color={defaultColor} onChangeColor={onClickDefaultColor} />
                    </SSettingItemContent>
                  </SSettingItem>
                  <SSettingItem>
                    <SSettingItemTitle>{msg("export_msg")}</SSettingItemTitle>
                    <SSettingItemContent>
                      <Button onClick={handleDownloadCSV}>{msg("csv_download_msg")}</Button>
                      <Button onClick={handleDownloadText} style={{ marginLeft: "0.5rem" }}>
                        {msg("text_download_msg")}
                      </Button>
                    </SSettingItemContent>
                  </SSettingItem>
                  <SSettingItem>
                    <SSettingItemTitle>{msg("how_to_use_page_link_msg")}</SSettingItemTitle>
                    <SSettingItemContent>
                      <Usage />
                    </SSettingItemContent>
                  </SSettingItem>
                  <SSettingItem>
                    <SSettingItemTitle>{msg("maker_msg")}</SSettingItemTitle>
                    <SSettingItemContent>
                      <a href="https://twitter.com/takumi_bv" target="_blank">
                        @takumi_bv
                      </a>
                    </SSettingItemContent>
                  </SSettingItem>
                </>
              )}
            </SMainContent>
          </SMain>
        </SContainer>
      </div>
    </>
  );
};
export default Setting;
