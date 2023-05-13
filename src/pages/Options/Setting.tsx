import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { GlobalStyle, SContainer, SMain, SMainContent } from "./index.style";
import { SSettingItem, SSettingItemTitle, SSettingItemContent } from "./Setting.style";
import OptionHeader from "../../components/OptionHeader/OptionHeader";
import * as sender from "../message/sender/options";
import ColorPicker from "../../components/ColorPicker/ColorPicker";
import { msg } from "../../utils";

interface Props extends RouteComponentProps<{}> {}

const Setting: React.FC<Props> = () => {
  const [defaultColor, setDefaultColor] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const onClickDefaultColor = (color: string) => {
    sender.sendUpdateDefaultColor(color).then(({ setting }) => {
      setDefaultColor(setting?.default_color ?? "");
    });
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
                      <button>CSV</button>
                      <button>text</button>
                    </SSettingItemContent>
                  </SSettingItem>
                  <SSettingItem>
                    <SSettingItemTitle>{msg("how_to_use_page_link_msg")}</SSettingItemTitle>
                    <SSettingItemContent>
                      使い方
                    </SSettingItemContent>
                  </SSettingItem>
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
