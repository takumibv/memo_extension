import { CheckIcon } from '@heroicons/react/24/solid';
import { memo } from 'react';
import styled, { css } from 'styled-components';
import type React from 'react';

type Props = {
  onChangeColor?: (color: string) => void;
  color?: string;
  hasDefault?: boolean;
};

const ColorPicker: React.FC<Props> = memo(({ onChangeColor, color: activeColor = '', hasDefault = false }) => (
  <SColors>
    {hasDefault && (
      <SColorDefault
        $isActive={hasDefault && activeColor === ''}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          onChangeColor?.('');
        }}>
        {hasDefault && activeColor === '' && <SColorCheckIcon color="rgb(0,0,0)" />}
      </SColorDefault>
    )}
    {['#FFFFFF', '#EB9694', '#FAD0C3', '#FFF7CC', '#C1E1C5', '#BEDADC', '#C4DEF6', '#D4C4FB'].map(color => {
      const isActive = (color === '#FFFFFF' && activeColor === '' && !hasDefault) || color === activeColor;
      return (
        <SColor
          key={color}
          $isActive={isActive}
          style={{ backgroundColor: color }}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onChangeColor?.(color);
          }}>
          {isActive && <SColorCheckIcon color="rgb(0,0,0)" />}
        </SColor>
      );
    })}
  </SColors>
));

ColorPicker.displayName = 'ColorPicker';

export default ColorPicker;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SColors = (styled as any).div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SColor = (styled as any).button<{ $isActive?: boolean }>`
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 4px;
  width: 48px;
  height: 32px;
  text-align: center;
  cursor: pointer;

  ${({ $isActive }: { $isActive?: boolean }) =>
    $isActive &&
    css`
      cursor: default;
      border: 2px solid #000;
    `}
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SColorCheckIcon = (styled as any)(CheckIcon)`
  width: 20px;
  height: 20px;
  margin: auto;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SColorDefault = (styled as any)(SColor)`
  position: relative;
  border-color: #aaa;
  overflow: hidden;
  background-color: #fff;

  ${SColorCheckIcon} {
    position: relative;
    z-index: 1;
  }

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 2px;
    background: #aaa;
    transform: rotate(45deg);
  }
`;
