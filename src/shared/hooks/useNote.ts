import { DEAULT_NOTE_HEIGHT, DEAULT_NOTE_WIDTH } from '@/shared/types/Note';
import { useCallback, useEffect, useState } from 'react';
import type { Note } from '@/shared/types/Note';

export const MIN_NOTE_WIDTH = 160;
export const MIN_NOTE_HEIGHT = 120;
export const NOTE_TOP_POSITION = 0;
export const NOTE_LEFT_POSITION = 0;

export const useNoteEdit = ({
  title,
  description,
  position_x,
  position_y,
  width = MIN_NOTE_WIDTH,
  height = MIN_NOTE_HEIGHT,
  is_open,
}: Note) => {
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description);
  const [editIsOpen, setEditIsOpen] = useState(is_open);

  const {
    positionX: editPositionX,
    positionY: editPositionY,
    setPosition: setEditPosition,
  } = useNotePosition(position_x, position_y);
  const { width: editWidth, height: editHeight, setSize: setEditSize } = useNoteSize(width, height);

  const getFixedPosition = useCallback(
    (isFixed: boolean) => {
      const fixPosition = isFixed ? -1 : 1;
      const newPositionX = (editPositionX ?? initialPositionX()) + window.scrollX * fixPosition;
      const newPositionY = (editPositionY ?? initialPositionY()) + window.scrollY * fixPosition;

      return { positionX: newPositionX, positionY: newPositionY };
    },
    [editPositionX, editPositionY],
  );

  useEffect(() => {
    setEditIsOpen(is_open);
  }, [is_open]);

  useEffect(() => {
    setEditDescription(description);
  }, [description]);

  useEffect(() => {
    setEditTitle(title);
  }, [title]);

  return {
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    editIsOpen,
    setEditIsOpen,
    editPositionX,
    editPositionY,
    setEditPosition,
    editWidth,
    editHeight,
    setEditSize,
    getFixedPosition,
  };
};

export const initialPositionX = () => (window.innerWidth - DEAULT_NOTE_WIDTH) / 2;
export const initialPositionY = () => (window.innerHeight - DEAULT_NOTE_HEIGHT) / 2;

const clampPosition = (x?: number, min: number = 0) => (x === undefined ? undefined : Math.max(x, min));

export const useNotePosition = (defaultPositionX?: number, defaultPositionY?: number) => {
  const [positionX, setPositionX] = useState<number | undefined>(() =>
    clampPosition(defaultPositionX, NOTE_LEFT_POSITION),
  );
  const [positionY, setPositionY] = useState<number | undefined>(() =>
    clampPosition(defaultPositionY, NOTE_TOP_POSITION),
  );

  const setPosition = useCallback((x?: number, y?: number) => {
    setPositionX(clampPosition(x, NOTE_LEFT_POSITION));
    setPositionY(clampPosition(y, NOTE_TOP_POSITION));
  }, []);

  useEffect(() => {
    setPosition(defaultPositionX, defaultPositionY);
  }, [defaultPositionX, defaultPositionY, setPosition]);

  return {
    positionX,
    positionY,
    setPosition,
  };
};

export const useNoteSize = (defaultWidth: number = MIN_NOTE_WIDTH, defaultHeight: number = MIN_NOTE_HEIGHT) => {
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
