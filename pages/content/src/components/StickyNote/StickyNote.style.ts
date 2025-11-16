/* eslint-disable import-x/exports-last */
import Button from '@extension/shared/lib/components/Button/Button.js';
import { IconButton } from '@extension/shared/lib/components/Button/index.js';
import { CopySuccessIcon, LogoIcon } from '@extension/shared/lib/components/Icon.js';
import { baseCSS } from '@extension/shared/lib/utils/resetCSS.js';
import styled, { css } from 'styled-components';
import type React from 'react';

type SNoteProps = React.HTMLAttributes<HTMLDivElement> & {
  $isFixed?: boolean;
  $isForward?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SNote = (styled as any).div<SNoteProps>`
  ${baseCSS('div')}

  font-size: 16px !important;
  pointer-events: initial;
  background-color: #fff;
  border-radius: 0.25em;
  z-index: 1250;
  position: absolute;
  left: 0;
  top: 0;
  transition: box-shadow 300ms cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow:
    rgba(0, 0, 0, 0.14) 0px 2px 2px 0px,
    rgba(0, 0, 0, 0.2) 0px 3px 1px -2px,
    rgba(0, 0, 0, 0.12) 0px 1px 5px 0px;

  ${({ $isFixed }: SNoteProps) =>
    $isFixed &&
    css`
      position: fixed;
      box-shadow:
        0 3px 6px rgba(0, 0, 0, 0.16),
        0 3px 6px rgba(0, 0, 0, 0.23);
      z-index: 1251;
    `}

  ${({ $isForward }: SNoteProps) =>
    $isForward &&
    css`
      z-index: 1252;
    `}
`;

export const SOpenButton = styled(IconButton)`
  position: relative;
  pointer-events: initial;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const SLogo = styled(LogoIcon)`
  ${baseCSS('svg')}

  pointer-events: none;
  width: 24px;
  height: 24px;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SNoteInner = (styled as any).div`
  ${baseCSS('div')}

  display: flex;
  height: 100%;
  flex-direction: column;
  cursor: default;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SResizeHandler = (styled as any).div`
  ${baseCSS('div')}

  position: absolute;
  cursor: nwse-resize;
  width: 1em;
  height: 1em;
  right: 0;
  bottom: 0;
  z-index: 1;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SNoteHeader = (styled as any).div`
  ${baseCSS('div')}

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
  white-space: pre-line;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SNoteTitle = (styled as any).h2`
  ${baseCSS('h2')}

  ${noteTitleCSS}
  flex: 1;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SNoteSpan = (styled as any).span`
  ${baseCSS('span')}

  color: rgb(0, 0, 0, 50%);
  flex: 1;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SNoteTitleInput = (styled as any).input`
  ${baseCSS('input')}

  ${noteTitleCSS}
  margin: -0.25em !important;
  padding: 0.25em !important;
  width: calc(100% + 0.5em) !important;

  &[type='text'],
  &[type='text']:focus,
  &[type='text']:focus-visible {
    background-color: #fff;
    border: 0.0625em solid rgba(0, 0, 0, 0.1);
    box-shadow: none;
  }

  &::placeholder {
    color: rgb(0, 0, 0, 50%);
  }
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SNoteContent = (styled as any).div`
  ${baseCSS('div')}

  flex: 1;
  min-height: 5em;
  padding: 0 0.5em 2.5em;
  position: relative;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SNoteContentScroll = (styled as any).div`
  ${baseCSS('div')}

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
  white-space: pre-line;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SNoteDescription = (styled as any).p`
  ${baseCSS('p')}

  ${noteDescriptionCSS}
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SNoteDescriptionTextarea = (styled as any).textarea`
  ${baseCSS('textarea')}

  ${noteDescriptionCSS}
  width: calc(100% + 0.5em);
  min-width: calc(100% + 0.5em);
  height: calc(100% - 0.25em);
  min-height: calc(100% - 0.25em);
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

  &::placeholder {
    color: #aaa;
  }
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SNoteFooter = (styled as any).div`
  ${baseCSS('div')}

  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
  padding: 0.5em;
  height: 2.5em;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SIconButtonWrap = (styled as any).div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.75em;

  &:first-child {
    margin-left: 0;
  }
`;

export const SIconButton = styled(IconButton)<{ isFocus?: boolean }>`
  pointer-events: initial;

  ${({ isFocus }: { isFocus?: boolean }) =>
    isFocus &&
    css`
      background-color: rgba(0, 0, 0, 0.1);
      box-shadow: 0 0 0 0.25em rgba(0, 0, 0, 0.1);
    `}

  & svg {
    font-size: 16px !important;
    width: 1.25em;
    min-width: 1.25em;
    height: 1.25em;
    min-height: 1.25em;
  }
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SHeaderFixedPinArea = (styled as any).div`
  ${baseCSS('div')}

  margin-left: 0.25em;
  width: 1.25em;
  height: 1.25em;
`;

export const SHeaderFixedButton = styled(IconButton)`
  transform: rotate(45deg);
`;
