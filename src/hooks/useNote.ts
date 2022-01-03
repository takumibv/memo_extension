import { useCallback, useState } from "react";
import { Note } from "../types/Note";

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
  position_x: defaultPositionX = NOTE_LEFT_POSITION,
  position_y: defaultPositionY = NOTE_TOP_POSITION,
  width: defaultWidth = MIN_NOTE_WIDTH,
  height: defaultHeight = MIN_NOTE_HEIGHT,
  is_open: defaultIsOpen = false,
  is_fixed: defaultIsFixed,
}: Note) => {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [isOpen, setIsOpen] = useState(defaultIsOpen);
  const [isFixed, setIsFixed] = useState(defaultIsFixed);

  const { positionX, positionY, setPosition } = useNotePosition(defaultPositionX, defaultPositionY);
  const { width, height, setSize } = useNoteSize(defaultWidth, defaultHeight);

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

export const useNotePosition = (
  defaultPositionX: number = NOTE_LEFT_POSITION,
  defaultPositionY: number = NOTE_TOP_POSITION
) => {
  const [positionX, setPositionX] = useState(defaultPositionX);
  const [positionY, setPositionY] = useState(defaultPositionY);

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
