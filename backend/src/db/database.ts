import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/characters.db');

export interface Database extends sqlite3.Database {}

export function initializeDatabase(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }

      db.serialize(() => {
        // Characters table
        db.run(`
          CREATE TABLE IF NOT EXISTS characters (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            universe TEXT,
            version TEXT,
            description TEXT,
            imageUrl TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) console.error('Error creating characters table:', err);
        });

        // Combat stats table
        db.run(`
          CREATE TABLE IF NOT EXISTS combat_stats (
            id TEXT PRIMARY KEY,
            characterId TEXT NOT NULL,
            strength REAL,
            speed REAL,
            durability REAL,
            stamina REAL,
            energyOutput REAL,
            techniqueProficiency REAL,
            experience REAL,
            adaptability REAL,
            FOREIGN KEY(characterId) REFERENCES characters(id)
          )
        `, (err) => {
          if (err) console.error('Error creating combat_stats table:', err);
        });

        // Abilities table
        db.run(`
          CREATE TABLE IF NOT EXISTS abilities (
            id TEXT PRIMARY KEY,
            characterId TEXT NOT NULL,
            name TEXT NOT NULL,
            type TEXT,
            description TEXT,
            powerLevel REAL,
            FOREIGN KEY(characterId) REFERENCES characters(id)
          )
        `, (err) => {
          if (err) console.error('Error creating abilities table:', err);
        });

        // Comparisons cache table
        db.run(`
          CREATE TABLE IF NOT EXISTS comparisons (
            id TEXT PRIMARY KEY,
            character1Id TEXT NOT NULL,
            character2Id TEXT NOT NULL,
            verdict TEXT,
            confidenceLevel REAL,
            analysis TEXT,
            scenarios TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(character1Id) REFERENCES characters(id),
            FOREIGN KEY(character2Id) REFERENCES characters(id)
          )
        `, (err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve(db);
          }
        });
      });
    });
  });
}

export function getDatabase(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}
