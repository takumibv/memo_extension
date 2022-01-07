import styled, { css } from "styled-components";
import { Props } from "./Button";
import { baseCSS } from "../../resetCSS";

export const SButton = styled.button<Props>`
  ${baseCSS("button")}

  cursor: pointer;
  border-radius: 999em;
  padding: 0.25em 0.75em;
  font-size: 0.875em;

  /* primary */
  color: #fff;
  background-color: #0070f3;
  transition: background-color 300ms cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover,
  &:focus {
    outline: none;
    background-color: #0057b9;
  }

  ${({ secondary }) =>
    secondary &&
    css`
      color: #0070f3;
      background-color: transparent;
      font-size: 0.75em;
      padding: 0.25em 0.5em;

      &:hover,
      &:focus {
        outline: none;
        background-color: #dcecff;
      }
    `}

  &:disabled {
    opacity: 0.5;
    background-color: #aaa;

    &:hover,
    &:focus {
      background-color: #aaa;
    }
  }
`;

export const SIconButton = styled.button`
  ${baseCSS("button")}

  cursor: pointer;
  width: 1.25em;
  height: 1.25em;
  border-radius: 2.5em;
  transition: box-shadow 300ms cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover,
  &:focus {
    outline: none;
    background-color: rgba(0, 0, 0, 0.1);
    box-shadow: 0 0 0 0.25em rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;

    &:hover,
    &:focus {
      background-color: transparent;
      box-shadow: none;
    }
  }
`;

export const SFabIconButton = styled.button`
  ${baseCSS("button")}

  cursor: pointer;
  width: 3em;
  height: 3em;
  border-radius: 999em;
  padding: 0.75em;
  background: #0070f3;
  transition: box-shadow 300ms cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);

  &:hover,
  &:focus {
    outline: none;
    outline: none;
    background-color: #0057b9;
    box-shadow: 0 0 0 0.25em rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    background-color: #aaa;
    box-shadow: none;

    &:hover,
    &:focus {
      background-color: #aaa;
      box-shadow: none;
    }
  }
`;
