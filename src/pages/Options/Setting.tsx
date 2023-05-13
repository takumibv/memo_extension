import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { GlobalStyle, SContainer, SMain, SMainContent } from "./index.style";
import {
  SSettingItem,
  SSettingItemTitle,
  SSettingItemContent,
  SColors,
  SColor,
  SColorCheckIcon,
} from "./Setting.style";
import OptionHeader from "../../components/OptionHeader/OptionHeader";
import * as sender from "../message/sender/options";

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
                    <SSettingItemTitle>メモの初期カラー</SSettingItemTitle>
                    <SSettingItemContent>
                      <SColors>
                        {[
                          "#fff",
                          "#EB9694",
                          "#FAD0C3",
                          "#FEF3BD",
                          "#C1E1C5",
                          "#BEDADC",
                          "#C4DEF6",
                          "#D4C4FB",
                        ].map((color) => {
                          const isActive =
                            (color === "#fff" && defaultColor === "") || color === defaultColor;
                          return (
                            <SColor
                              key={color}
                              $isActive={isActive}
                              style={{ backgroundColor: color }}
                              onClick={() => onClickDefaultColor(color)}
                            >
                              {isActive && <SColorCheckIcon />}
                            </SColor>
                          );
                        })}
                      </SColors>
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
                    <SSettingItemTitle>製作者</SSettingItemTitle>
                    <SSettingItemContent>@takumi_bv</SSettingItemContent>
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
