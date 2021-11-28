import { default as DBG } from 'debug';
import { Note } from './Notes.mjs';
const debug = DBG('notes:note-store');
const error = DBG('notes:error-store');

let _NotesStore;

export async function useModel(model) {
  try {
    let NotesStoreModule = await import(`./notes-${model}.mjs`);
    let NotesStoreClass = NotesStoreModule.default;
    _NotesStore = new NotesStoreClass();
    return _NotesStore;
  } catch (err) {
    throw new Error(`No recongized NotesStore in ${model} because ${err}`);
  }
}

export { _NotesStore as NotesStore };
