import React, { useCallback, useEffect, useMemo, useState, VFC } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

type Props = {
  current: "memos" | "setting";
};

export const OptionHeader: VFC<Props> = ({}) => {
  return (
    <SHeader>
      <img src="/images/icon_38.png" alt="" />
      <span>header</span>
      <div>
        <Link to="/memos.html">メモ</Link>
        <Link to="/setting.html">設定</Link>
      </div>
    </SHeader>
  );
};

export default OptionHeader;

export const SHeader = styled.header`
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 2.75em;
  padding: 0 1.75em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background-color: #fff;
  /* background-color: #4c4722; */
`;
