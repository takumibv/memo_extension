import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { GlobalStyle, SContainer, SMain, SMainContent } from "./Options.style";
import OptionHeader from "../../components/OptionHeader/OptionHeader";

interface Props extends RouteComponentProps<{}> {}

const Setting: React.VFC<Props> = () => {
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
            <SMainContent>hoge</SMainContent>
          </SMain>
        </SContainer>
      </div>
    </>
  );
};
export default Setting;
