import util from 'util';
import { Note, AbstractNotesStore } from './Notes.mjs';
import { default as sqlite3 } from 'sqlite3';
import { default as DBG } from 'debug';
const debug = DBG('notes:notes-sqlite3');
const error = DBG('notes:error-sqlite3');

let db;

async function connectDB() {
  if (db) return db;
  const dbfile = process.env.SQLITE_FILE || 'notes.sqlite3';
  await new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbfile, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) return reject(err);
      resolve(db);
    });
  });
  return db;
}

export default class SQLITE3NotesStore extends AbstractNotesStore {
  async close() {
    const _db = db;
    db = undefined;
    return _db
      ? new Promise((resolve, reject) => {
          _db.close((err) => {
            if (err) reject(err);
            else resolve();
          });
        })
      : undefined;
  }

  async update(key, title, body) {
    const db = await connectDB();
    const note = new Note(key, title, body);
    await new Promise((resolve, reject) => {
      db.run('UPDATE notes ' + 'SET title = ?m body = ? WHERE notekey = ?;', [title, body, key], (err) => {
        if (err) return reject(err);
        resolve(note);
      });
    });
    return note;
  }

  async create(key, title, body) {
    const db = await connectDB();
    const note = new Note(key, title, body);
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO notes (noteskey,title,body)' + 'VALUES (?,?,?);', [title, body, key], (err) => {
        if (err) return reject(err);
        resolve(note);
      });
    });
    return note;
  }
}
