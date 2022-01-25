import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useHistory } from "react-router";
import {
  ToBackgroundMessage,
  ToBackgroundMessageMethod,
  ToBackgroundMessageResponse,
} from "../../types/Actions";
import { Note } from "../../types/Note";
import { DELETE_NOTE, GET_ALL_NOTES_AND_PAGE_INFO, OPTIONS, UPDATE_NOTE } from "../../actions";
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
            <SMainRight>hoge</SMainRight>
          </SMain>
          <OptionHeader current="setting" />
        </SContainer>
      </div>
    </>
  );
};
export default Setting;
