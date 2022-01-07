import styled, { css } from "styled-components";
import { baseCSS } from "../../resetCSS";
import Button from "../Button/Button";
import { CopySuccessIcon } from "../Icon";
import IconButton from "../Button/IconButton";

type SNoteProps = React.HTMLAttributes<HTMLDivElement> & {
  isFixed?: boolean;
  isForward?: boolean;
};

export const SNote = styled.div<SNoteProps>`
  ${baseCSS("div")}

  pointer-events: initial;
  background-color: #fff;
  border-radius: 0.25em;
  z-index: 1250;
  position: absolute;
  left: 0;
  top: 0;
  transition: box-shadow 300ms cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);

  ${({ isFixed }) =>
    isFixed &&
    css`
      position: fixed;
      z-index: 1251;
    `}

  ${({ isForward }) =>
    isForward &&
    css`
      z-index: 1252;
    `}
`;

export const SNoteInner = styled.div`
  ${baseCSS("div")}

  display: flex;
  height: 100%;
  flex-direction: column;
  cursor: default;
`;

export const SResizeHandler = styled.div`
  ${baseCSS("div")}

  position: absolute;
  cursor: nwse-resize;
  width: 1em;
  height: 1em;
  right: 0;
  bottom: 0;
  z-index: 1;

  svg {
    transform: rotate(45deg);
  }
`;

export const SNoteHeader = styled.div`
  ${baseCSS("div")}

  display: flex;
  justify-content: space-between;
  padding: 0.5em;
  border-bottom: 0.0625em solid rgba(0, 0, 0, 0.1);
  overflow-y: auto;
`;

const noteTitleCSS = css`
  font-size: 1em;
  line-height: 1.25;
  color: #333;
  border-width: 0.0625em;
  border-color: transparent;
  border-radius: 0.25em;
  word-break: break-all;
`;

export const SNoteTitle = styled.h2`
  ${baseCSS("h2")}

  ${noteTitleCSS}
  flex: 1;
`;

export const SNoteSpan = styled.span`
  ${baseCSS("span")}

  color: #999;
  flex: 1;
`;

export const SNoteTitleInput = styled.input`
  ${baseCSS("input")}

  ${noteTitleCSS}
  margin: -0.25em;
  padding: 0.25em;
  width: calc(100% + 0.5em);

  &[type="text"],
  &[type="text"]:focus,
  &[type="text"]:focus-visible {
    background-color: #fff;
    border: 0.0625em solid rgba(0, 0, 0, 0.1);
    box-shadow: none;
  }
`;

export const SNoteContent = styled.div`
  ${baseCSS("div")}

  flex: 1;
  min-height: 5em;
  padding: 0 0.5em 2.5em;
  position: relative;
`;

export const SNoteContentScroll = styled.div`
  ${baseCSS("div")}

  height: 100%;
  overflow-y: auto;
`;

const noteDescriptionCSS = css`
  padding-top: 0.5em;
  font-size: 0.875em;
  line-height: 1.25;
  color: #333;
  border-width: 1px;
  border-color: transparent;
  border-radius: 0.25em;
  word-break: break-all;
`;

export const SNoteDescription = styled.p`
  ${baseCSS("p")}

  ${noteDescriptionCSS}
  white-space: pre-line;
`;

export const SNoteDescriptionTextarea = styled.textarea`
  ${baseCSS("textarea")}

  ${noteDescriptionCSS}
  width: calc(100% + 0.5em);
  height: calc(100% - 0.25em);
  margin: 0.25em -0.25em 0;
  padding: 0.25em;
  resize: none;

  &,
  &:focus,
  &:focus-visible {
    background-color: #fff;
    border: 0.0625em solid rgba(0, 0, 0, 0.1);
    box-shadow: none;
  }
`;

export const SNoteFooter = styled.div`
  ${baseCSS("div")}

  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
  padding: 0.5em;
  height: 2.5em;
`;

export const SIconButtonWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5em;

  &:first-child {
    margin-left: 0;
  }
`;

export const SIconButton = styled(IconButton)`
  pointer-events: initial;
`;

export const SCopySuccessIcon = styled(CopySuccessIcon)`
  width: 1.25em;
  height: 1.25em;
`;

export const SButton = styled(Button)`
  pointer-events: initial;
  margin-left: 0.25em;

  &:first-child {
    margin-left: 0;
  }
`;

export const SHeaderFixedPinArea = styled.div`
  ${baseCSS("div")}

  margin-left: 0.25rem;
  width: 1.25em;
  height: 1.25em;
`;

export const SHeaderFixedButton = styled(IconButton)`
  transform: rotate(45deg);
`;
