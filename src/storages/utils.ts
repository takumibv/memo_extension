import { Note } from "../types/Note";

// NoteAとNoteBをマージする
export const mergeNotes = (
  notesAMap: { [key: string]: Note[] },
  notesBMap: { [key: string]: Note[] }
): { [key: string]: Note[] } => {
  // マージ
  const targetNoteMap = { ...notesAMap };

  Object.keys(notesBMap).forEach((key) => {
    if (!targetNoteMap[key]) {
      targetNoteMap[key] = notesBMap[key];
    } else {
      const notesA = notesAMap[key];
      const notesB = notesBMap[key];
      // notesAにないノートの配列
      const onlyNotesB = notesB.filter(
        (noteB) => !notesA.find((noteA) => noteA.id === noteB.id)
      );

      let targetNotes = [
        ...notesA.map((noteA) => {
          const noteB = notesB.find((note) => note.id === noteA.id);

          if (!noteB) return noteA;

          // 最近修正したノートを返す
          return new Date(noteB?.updated_at ?? "1900/01/01") >
            new Date(noteA?.updated_at ?? "1900/01/01")
            ? noteB
            : noteA;
        }),
        ...onlyNotesB,
      ];

      targetNoteMap[key] = targetNotes;
    }
  });

  return targetNoteMap;
};