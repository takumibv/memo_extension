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
            {/* TODO 機能実装 */}
            {/* 1. 旧拡張機能からのデータを引き継ぐ */}
            {/* 2. 表示/非表示切り替え設定 */}
            {/* 3. 使い方（わざわざページ分けなくていいか） */}
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
                    <SSettingItemTitle>書き出し</SSettingItemTitle>
                    <SSettingItemContent>
                      <Button onClick={handleDownloadCSV}>CSVダウンロード</Button>
                      <Button onClick={handleDownloadText} style={{ marginLeft: "0.5rem" }}>
                        txtダウンロード
                      </Button>
                    </SSettingItemContent>
                  </SSettingItem>
                  {/* <SSettingItem>
                    <SSettingItemTitle>{msg("how_to_use_page_link_msg")}</SSettingItemTitle>
                    <SSettingItemContent>使い方</SSettingItemContent>
                  </SSettingItem> */}
                  <SSettingItem>
                    <SSettingItemTitle>製作者</SSettingItemTitle>
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
