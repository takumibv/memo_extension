import { DEAULT_NOTE_HEIGHT, DEAULT_NOTE_WIDTH, Note } from "../types/Note";
import { PageInfo } from "../types/PageInfo";
import { msg } from "../utils";
import { getAllStorage, getNewId, getStorage, removeStorage, setStorage } from "./common";
import { deletePageInfo, getAllPageInfos } from "./pageInfoStorage";
import { deleteObject, getDownloadURL, ref, uploadString } from "@firebase/storage";
import { db, storage } from "../lib/firebase/client";
import { doc, collection, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { cache } from "../pages/background/cache";
import { mergeNotes } from "./utils";

const NOTE_STORAGE_NAME = "notes";

const getStorageName = (pageId: number) => `${NOTE_STORAGE_NAME}_${pageId}`;

const getNoteStorage = async (storageName: string): Promise<Note[]> => {
  const storage = await getStorage(storageName);
  return (storage[storageName] || []) as Note[];
};

const setNoteStorageByPageId = async (pageId: number, notes: Note[]): Promise<boolean> => {
  const storageName = getStorageName(pageId);

  return await setStorage(storageName, notes);
};

const removeNoteStorageByPageId = async (pageId: number): Promise<boolean> => {
  return await removeStorage(getStorageName(pageId));
};

export type NoteCRUDResponseType = { note?: Note; allNotes: Note[] };

export const createNote = async (pageId: number): Promise<NoteCRUDResponseType> => {
  const notes = await getAllNotesByPageId(pageId);

  const id = getNewId(notes);
  const newNote: Note = {
    id,
    page_info_id: pageId,
    width: DEAULT_NOTE_WIDTH,
    height: DEAULT_NOTE_HEIGHT,
    is_fixed: true,
    is_open: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const allNotes = [...notes, newNote];

  if (cache.user) {
    const ref = doc(db, `users/${cache.user.id}/notes/${pageId}`);
    await setDoc(ref, { note: allNotes });
    console.log("ノートデータを保存しました。", allNotes);
    return { note: newNote, allNotes };
  }

  if (await setNoteStorageByPageId(pageId, allNotes)) return { note: newNote, allNotes };

  throw new Error("createNote failed: " + chrome.runtime.lastError?.message);
};

export const updateNote = async (pageId: number, note: Note): Promise<NoteCRUDResponseType> => {
  if (!note.id) return new Promise((_resolve, reject) => reject("id is required"));

  const notes = await getAllNotesByPageId(pageId);
  const allNotes = notes.map((_note) =>
    _note.id === note.id ? { ...note, updated_at: new Date().toISOString() } : _note
  );

  if (cache.user) {
    const ref = doc(db, `users/${cache.user.id}/notes/${pageId}`);
    await setDoc(ref, { note: allNotes });
    console.log("ノートデータを更新しました。", allNotes);
    return { note, allNotes };
  }

  if (await setNoteStorageByPageId(pageId, allNotes)) return { note, allNotes };

  throw new Error("updateNote failed: " + chrome.runtime.lastError?.message);
};

export const getAllNotesByPageId = async (pageId: number): Promise<Note[]> => {
  if (cache.user) {
    const ref = doc(db, `users/${cache.user.id}/notes/${pageId}`);
    const data = (await getDoc(ref)).data();
    console.log("ノートデータを取得しました。", cache.user.id, pageId, data?.note);
    if (data?.note) return data?.note;
  }

  const notes = await getNoteStorage(getStorageName(pageId));

  return notes.filter((note) => !note.deleted_at);
};

export const getAllNotes = async (): Promise<Note[]> => {
  const storage = await getAllStorage();
  const filteredNotes = Object.keys(storage)
    .filter((key) => key.match(new RegExp(`^${NOTE_STORAGE_NAME}_`, "g")))
    .map((key) => storage[key])
    .flat()
    .filter((note) => !note.deleted_at) as Note[];

  if (cache.user) {
    const ref = collection(db, `users/${cache.user.id}/notes`);
    const data = await getDocs(ref);
    let notes: Note[] = [];
    console.log("全ノートを取得");
    data.forEach((doc) => {
      const _notes = doc.data().note;
      console.log(doc.id, _notes);
      notes = [...notes, ..._notes];
    });
    return notes;
  }

  return filteredNotes;
};

/**
 * ローカルとサーバーのノートデータを同期する
 */
export const syncNotes = async (): Promise<Note[]> => {
  const storage = await getAllStorage();
  const localNoteMap: { [key: string]: Note[] } = Object.keys(storage)
    .filter((key) => key.match(new RegExp(`^${NOTE_STORAGE_NAME}_`, "g")))
    .reduce(
      (previous, key) => ({
        ...previous,
        [key.replace(`${NOTE_STORAGE_NAME}_`, "")]: storage[key],
      }),
      {}
    );

  console.log("localNoteMap", localNoteMap);

  const firebaseNoteMap: { [key: string]: Note[] } = {};

  if (cache.user) {
    const ref = collection(db, `users/${cache.user.id}/notes`);
    const data = await getDocs(ref);

    data.forEach((doc) => {
      const _firebaseNote = doc.data().note;
      firebaseNoteMap[doc.id] = _firebaseNote;
    });

    const targetNoteMap = mergeNotes(localNoteMap, firebaseNoteMap);

    const userId = cache.user.id;

    Object.keys(targetNoteMap).forEach(async (key) => {
      setNoteStorageByPageId(Number(key), targetNoteMap[key]);

      const ref = doc(db, `users/${userId}/notes/${key}`);
      await setDoc(ref, { note: targetNoteMap[key] }).then(() => {
        console.log("ノートデータを更新しました。", targetNoteMap[key]);
      });
    });
  }

  return [];
};

export const getNotesByPageId = async (pageId: number): Promise<Note[]> => {
  // TODO
  return new Promise((_resolve, reject) => reject("getAllNotes is not implemented"));
};

/**
 *
 * @param pageId
 * @param noteId
 * @returns note: 削除したメモ, allNotes: 削除後の全てのメモ, pageInfos: 削除後のページ情報
 */
export const deleteNote = async (
  pageId: number,
  noteId?: number
): Promise<NoteCRUDResponseType> => {
  if (!noteId) throw new Error("id is required");

  const notes = await getAllNotesByPageId(pageId);
  const note = notes.find((_note) => _note.id === noteId);
  const allNotes = notes.map((_note) => ({
    ..._note,
    deleted_at: _note.id === noteId ? new Date().toISOString() : _note.deleted_at,
  }));

  if (cache.user) {
    const ref = doc(db, `users/${cache.user.id}/notes/${pageId}`);
    const snap = await getDoc(ref);
    await setDoc(ref, { note: allNotes });
    console.log("ノートデータを削除しました。", allNotes);
    return { note, allNotes };
  }

  if (await setNoteStorageByPageId(pageId, allNotes)) {
    if (allNotes.length === 0) {
      await deletePageInfo(pageId);
      await removeNoteStorageByPageId(pageId);
    }

    return { note, allNotes };
  }

  throw new Error("deleteNote failed: " + chrome.runtime.lastError?.message);
};
