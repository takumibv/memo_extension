import { useCallback, useMemo, useState } from "react";
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
  title = "",
  description = "",
  position_x,
  position_y,
  width = MIN_NOTE_WIDTH,
  height = MIN_NOTE_HEIGHT,
  is_open = false,
  is_fixed,
}: Note) => {
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description);

  // initial: defaultがセットされていないときの値
  const initialPositionX = useMemo(() => (window.innerWidth - DEAULT_NOTE_WIDTH) / 2, []);
  const initialPositionY = useMemo(() => (window.innerHeight - DEAULT_NOTE_HEIGHT) / 2, []);

  const {
    positionX: editPositionX,
    positionY: editPositionY,
    setPosition: setEditPosition,
  } = useNotePosition(position_x ?? initialPositionX, position_y ?? initialPositionY);
  const { width: editWidth, height: editHeight, setSize: setEditSize } = useNoteSize(width, height);

  /**
   * 新isFixedに対する修正位置を返却する
   */
  const getFixedPosition = useCallback(
    (isFixed: boolean) => {
      const fixPosition = isFixed ? -1 : 1;
      const newPositionX = editPositionX + window.scrollX * fixPosition;
      const newPositionY = editPositionY + window.scrollY * fixPosition;

      console.log("getFixedPosition", window.scrollX, window.scrollY, newPositionX, newPositionY);
      return { positionX: newPositionX, positionY: newPositionY };
    },
    [editPositionX, editPositionY]
  );

  return {
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    editPositionX,
    editPositionY,
    setEditPosition,
    editWidth,
    editHeight,
    setEditSize,
    getFixedPosition,
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
