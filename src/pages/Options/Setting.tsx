import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useHistory } from "react-router";
import {
  ToBackgroundMessage,
  ToBackgroundMessageMethod,
  ToBackgroundMessageResponse,
} from "../../types/Actions";
import { Note } from "../../types/Note";
import { PageInfo } from "../../types/PageInfo";
import OptionListItem from "../../components/OptionList/OptionListItem";
import { useQuery } from "../../hooks/useRouter";
import { GlobalStyle, SContainer, SMain, SMainRight } from "./Options.style";
import IconButton from "../../components/Button/IconButton";
import { CloseIcon } from "../../components/Icon";
import OptionHeader from "../../components/OptionHeader/OptionHeader";

interface Props extends RouteComponentProps<{}> {}

const Setting: React.VFC<Props> = () => {
  return (
    <>
      <GlobalStyle />
      <div className="p-4">
        <SContainer>
          <SMain>
            {/* TODO 機能実装 */}
            {/* 1. 旧拡張機能からのデータを引き継ぐ */}
            {/* 2. 表示/非表示切り替え設定 */}
            {/* 3. 使い方（わざわざページ分けなくていいか） */}
            <SMainRight>hoge</SMainRight>
          </SMain>
          <OptionHeader current="setting" />
        </SContainer>
      </div>
    </>
  );
};
export default Setting;
