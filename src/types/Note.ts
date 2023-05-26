export const DEAULT_NOTE_WIDTH = 300;
export const DEAULT_NOTE_HEIGHT = 180;

export type Note = {
  id?: number;
  page_info_id?: number;
  title?: string;
  description?: string;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  is_open?: boolean;
  is_fixed?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  color?: string;
};
