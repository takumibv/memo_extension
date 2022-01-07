import { useCallback, useState } from "react";
import { DEAULT_NOTE_HEIGHT, DEAULT_NOTE_WIDTH, Note } from "../types/Note";

export const MIN_NOTE_WIDTH = 160;
export const MIN_NOTE_HEIGHT = 120;
export const NOTE_TOP_POSITION = 0;
export const NOTE_LEFT_POSITION = 0;

/**
 * メモを編集するためのHook
 * @param note Note
 * @returns 各要素と、更新する関数
 */
export const useNoteEdit = ({
  title: defaultTitle = "",
  description: defaultDescription = "",
  position_x: defaultPositionX,
  position_y: defaultPositionY,
  width: defaultWidth = MIN_NOTE_WIDTH,
  height: defaultHeight = MIN_NOTE_HEIGHT,
  is_open: defaultIsOpen = false,
  is_fixed: defaultIsFixed,
}: Note) => {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [isOpen, setIsOpen] = useState(defaultIsOpen);
  const [isFixed, _setIsFixed] = useState(defaultIsFixed);

  // initial: defaultがセットされていないときの値
  const initialPositionX = (window.innerWidth - DEAULT_NOTE_WIDTH) / 2;
  const initialPositionY = (window.innerHeight - DEAULT_NOTE_HEIGHT) / 2;

  const { positionX, positionY, setPosition } = useNotePosition(
    defaultPositionX ?? initialPositionX,
    defaultPositionY ?? initialPositionY
  );
  const { width, height, setSize } = useNoteSize(defaultWidth, defaultHeight);

  const setIsFixed = useCallback(
    (isFixed: boolean) => {
      const fixPosition = isFixed ? -1 : 1;
      const newPositionX = positionX + window.scrollX * fixPosition;
      const newPositionY = positionY + window.scrollY * fixPosition;

      setPosition(newPositionX, newPositionY);

      _setIsFixed(isFixed);

      return { isFixed, positionX: newPositionX, positionY: newPositionY };
    },
    [_setIsFixed, setPosition, positionX, positionY]
  );

  return {
    title,
    setTitle,
    description,
    setDescription,
    positionX,
    positionY,
    setPosition,
    width,
    height,
    setSize,
    isOpen,
    setIsOpen,
    isFixed,
    setIsFixed,
  };
};

export const useNotePosition = (defaultPositionX: number, defaultPositionY: number) => {
  const [positionX, setPositionX] = useState<number>(defaultPositionX);
  const [positionY, setPositionY] = useState<number>(defaultPositionY);

  const setPosition = useCallback((positionX: number, positionY: number) => {
    setPositionX(positionX >= NOTE_LEFT_POSITION ? positionX : NOTE_LEFT_POSITION);
    setPositionY(positionY >= NOTE_TOP_POSITION ? positionY : NOTE_TOP_POSITION);
  }, []);

  return {
    positionX,
    positionY,
    setPosition,
  };
};

export const useNoteSize = (
  defaultWidth: number = MIN_NOTE_WIDTH,
  defaultHeight: number = MIN_NOTE_HEIGHT
) => {
  const [width, setWidth] = useState(defaultWidth);
  const [height, setHeight] = useState(defaultHeight);

  const setSize = useCallback((width: number, height: number) => {
    setWidth(width >= MIN_NOTE_WIDTH ? width : MIN_NOTE_WIDTH);
    setHeight(height >= MIN_NOTE_HEIGHT ? height : MIN_NOTE_HEIGHT);
  }, []);

  return {
    width,
    height,
    setSize,
  };
};
