import styled, { css } from "styled-components";
import { CheckIcon } from "@heroicons/react/24/solid";
export const SSettingItem = styled.div`
  margin-bottom: 3em;
`;

export const SSettingItemTitle = styled.div`
  margin-bottom: 0.5em;
  font-size: 1rem;
  font-weight: bold;
  color: #888;
`;

export const SSettingItemContent = styled.div``;

export const SColors = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const SColor = styled.button<{ $isActive?: boolean }>`
  border: 1px solid #ddd;
  border-radius: 0.5em;
  margin: 0.5em;
  width: 4em;
  height: 2em;
  text-align: center;
  ${({ $isActive }) =>
    $isActive &&
    css`
      border: 2px solid #000;
    `}
`;

export const SColorCheckIcon = styled(CheckIcon)`
  width: 1.25em;
  height: 1.25em;
  margin: auto;
`;
