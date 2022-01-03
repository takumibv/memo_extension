import { Note } from "./Note";

export type ActionMesssageConfig = {
  method: string;
  action_type: string;
  page_url: string;
  note?: Note;
};
