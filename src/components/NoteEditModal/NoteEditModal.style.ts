import TextareaAutosize from "react-textarea-autosize";
import styled, { css } from "styled-components";
import Button from "../Button/Button";
import IconButton from "../Button/IconButton";
import NumberInput from "../TextInput/NumberInput";

export const SModalWrapper = styled.div<{ $isApeal?: boolean }>`
  position: fixed;
  width: 100%;
  max-height: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 2em;
  pointer-events: none;
  outline: none;
  transition: transform 0.15s ease-in-out;

  ${({ $isApeal }) =>
    $isApeal &&
    css`
      transform: translate(-50%, -50%) scale(1.03);
    `}
`;

export const SModal = styled.div`
  display: flex;
  flex-direction: column;
  pointer-events: initial;
  margin: auto;
  width: 800px;
  max-width: 100%;
  max-height: calc(100vh - 4em);
  background-color: #fff;
  border-radius: 0.25em;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
`;

export const SModalScrollContent = styled.div`
  overflow-y: auto;
`;

export const SModalHeader = styled.div`
  padding: 1em 1.5em 0.5em;
`;

export const SModalTitle = styled(TextareaAutosize)`
  padding: 0.2em;
  width: 100%;
  font-size: 1.25em;
  line-height: 1.5;
  word-break: break-all;
  white-space: pre-line;
  resize: none;

  &::placeholder {
    color: #aaa;
  }
`;

export const SModalContent = styled.div``;

export const SModalSection = styled.div`
  padding: 0 1.5em 1em;
`;

export const SModalSectionTitle = styled.h4`
  font-size: 0.875em;
  line-height: 1.5;
  font-weight: bold;
  margin-bottom: 0.5em;
`;

export const SModalDescription = styled.div`
  position: relative;
`;

export const SModalDescriptionText = styled(TextareaAutosize)`
  padding: 0.25em;
  width: 100%;
  font-size: 1em;
  word-break: break-all;
  white-space: pre-line;
  resize: none;

  &::placeholder {
    color: #aaa;
  }
`;

export const SModalActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1em 0.75em;
`;

export const SModalActionsLeft = styled.div`
  display: flex;
  align-items: center;
`;

export const SModalActionsRight = styled.div`
  display: flex;
  align-items: center;
`;

export const SMenuList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export const SMenuListItem = styled.button`
  min-width: 8.5em;
  padding: 0.75em 1em;
  font-size: 0.875em;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  &:not(:first-child) {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
`;

export const SButton = styled(Button)`
  margin-right: 1.25em;
  padding: 0.75em 1em;
`;

export const SIconButton = styled(IconButton)`
  margin-right: 1em;
`;

export const SDivider = styled.hr`
  border-width: 0;
  border-bottom-width: 1px;
  border-color: rgba(0, 0, 0, 0.1);
`;

export const SAccordion = styled.details``;

export const SAccordionSummary = styled.summary`
  padding: 1em 1.5em;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  &::marker {
    font-size: 0.75em;
  }
`;

export const SAccordionSummaryText = styled.span`
  font-size: 0.75em;
`;

export const SNoteDetailArea = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const SNoteDetail = styled.dl`
  width: 33%;
  min-width: 11.5em;
  margin-bottom: 1em;
`;
export const SNoteDetailTitle = styled.dt`
  color: #888;
  font-weight: normal;
  font-size: 0.75em;
  margin-bottom: 0.25em;
`;
export const SNoteDetailData = styled.dd`
  flex: 1;
  font-size: 0.875em;
  line-height: 1.5;
`;

export const SNoteDetailDataInput = styled(NumberInput)`
  text-align: left;
  padding: 0em 0.25em;
  width: 3.75em;
`;

export const SNoteDetailDataSpan = styled.span`
  vertical-align: middle;
`;
