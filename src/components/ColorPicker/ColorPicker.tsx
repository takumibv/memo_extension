import { CheckIcon } from "@heroicons/react/24/solid";
import React from "react";
import { memo } from "react";
import styled, { css } from "styled-components";

type Props = {
  onChangeColor?: (color: string) => void;
  color?: string;
  hasDefault?: boolean;
};

const StickyNote: React.FC<Props> = memo(
  ({ onChangeColor, color: activeColor = "", hasDefault = false }) => {
    return (
      <SColors>
        {hasDefault && (
          <SColorDefault
            $isActive={hasDefault && activeColor === ""}
            onClick={(e) => {
              e.stopPropagation();
              onChangeColor?.("");
            }}
          >
            {hasDefault && activeColor === "" && <SColorCheckIcon color="rgb(0,0,0)" />}
          </SColorDefault>
        )}
        {[
          "#FFFFFF",
          "#EB9694",
          "#FAD0C3",
          "#FFF7CC",
          "#C1E1C5",
          "#BEDADC",
          "#C4DEF6",
          "#D4C4FB",
        ].map((color) => {
          const isActive =
            (color === "#FFFFFF" && activeColor === "" && !hasDefault) || color === activeColor;
          return (
            <SColor
              key={color}
              $isActive={isActive}
              style={{ backgroundColor: color }}
              onClick={(e) => {
                e.stopPropagation();
                onChangeColor?.(color);
              }}
            >
              {isActive && <SColorCheckIcon color="rgb(0,0,0)" />}
            </SColor>
          );
        })}
      </SColors>
    );
  }
);

export default StickyNote;

export const SColors = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

export const SColor = styled.button<{ $isActive?: boolean }>`
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 4px;
  width: 48px;
  height: 32px;
  text-align: center;
  cursor: pointer;

  ${({ $isActive }) =>
    $isActive &&
    css`
      cursor: default;
      border: 2px solid #000;
    `}
`;

export const SColorCheckIcon = styled(CheckIcon)`
  width: 20px;
  height: 20px;
  margin: auto;
`;

export const SColorDefault = styled(SColor)`
  position: relative;
  border-color: #aaa;
  overflow: hidden;
  background-color: #fff;

  ${SColorCheckIcon} {
    position: relative;
    z-index: 1;
  }

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 2px;
    background: #aaa;
    transform: rotate(45deg);
  }
`;
