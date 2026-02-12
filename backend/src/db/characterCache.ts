import { getDatabase } from './database.js';
import { ScrapedCharacter } from '../services/characterScraper.js';

/**
 * Check if a character exists in the database by exact ID
 */
export async function getCharacterById(id: string): Promise<ScrapedCharacter | null> {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM characters WHERE id = ?', [id], (err, row: any) => {
      if (err) {
        reject(err);
        return;
      }

      if (!row) {
        resolve(null);
        return;
      }

      // Fetch stats and abilities
      db.get('SELECT * FROM combat_stats WHERE characterId = ?', [id], (err, statsRow: any) => {
        if (err) {
          reject(err);
          return;
        }

        db.all(
          'SELECT * FROM abilities WHERE characterId = ?',
          [id],
          (err, abilitiesRows: any[]) => {
            if (err) {
              reject(err);
              return;
            }

            const character: ScrapedCharacter = {
              id: row.id,
              name: row.name,
              universe: row.universe || '',
              version: row.version || '',
              description: row.description || '',
              imageUrl: row.imageUrl || '',
              stats: {
                strength: statsRow?.strength || 50,
                speed: statsRow?.speed || 50,
                durability: statsRow?.durability || 50,
                stamina: statsRow?.stamina || 50,
                energyOutput: statsRow?.energyOutput || 50,
                techniqueProficiency: statsRow?.techniqueProficiency || 50,
                experience: statsRow?.experience || 50,
                adaptability: statsRow?.adaptability || 50,
              },
              abilities: (abilitiesRows || []).map(a => ({
                id: a.id,
                name: a.name,
                type: a.type || '',
                description: a.description || '',
                powerLevel: a.powerLevel || 50,
              })),
            };

            resolve(character);
          }
        );
      });
    });
  });
}

/**
 * Search for characters by name (partial match)
 */
export async function searchCharactersByName(searchTerm: string): Promise<ScrapedCharacter[]> {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const searchPattern = `%${searchTerm.toLowerCase()}%`;

    db.all(
      'SELECT * FROM characters WHERE LOWER(name) LIKE ? OR LOWER(id) LIKE ? LIMIT 10',
      [searchPattern, searchPattern],
      async (err, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        if (!rows || rows.length === 0) {
          resolve([]);
          return;
        }

        try {
          const characters = await Promise.all(rows.map(row => getCharacterById(row.id)));
          resolve(characters.filter(c => c !== null) as ScrapedCharacter[]);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

/**
 * Get all characters from the database
 */
export async function getAllCharacters(): Promise<ScrapedCharacter[]> {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.all('SELECT id FROM characters', [], async (err, rows: any[]) => {
      if (err) {
        reject(err);
        return;
      }

      if (!rows || rows.length === 0) {
        resolve([]);
        return;
      }

      try {
        const characters = await Promise.all(rows.map(row => getCharacterById(row.id)));
        resolve(characters.filter(c => c !== null) as ScrapedCharacter[]);
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Save a scraped character to the database (insert or update)
 */
export async function cacheCharacter(character: ScrapedCharacter): Promise<void> {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Insert or replace character
      db.run(
        `INSERT OR REPLACE INTO characters (id, name, universe, version, description, imageUrl)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          character.id,
          character.name,
          character.universe,
          character.version,
          character.description,
          character.imageUrl,
        ],
        err => {
          if (err) {
            reject(err);
            return;
          }
        }
      );

      // Insert or replace stats
      db.run(
        `INSERT OR REPLACE INTO combat_stats 
         (id, characterId, strength, speed, durability, stamina, energyOutput, techniqueProficiency, experience, adaptability)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `${character.id}-stats`,
          character.id,
          character.stats.strength,
          character.stats.speed,
          character.stats.durability,
          character.stats.stamina,
          character.stats.energyOutput,
          character.stats.techniqueProficiency,
          character.stats.experience,
          character.stats.adaptability,
        ],
        err => {
          if (err) {
            reject(err);
            return;
          }
        }
      );

      // Delete old abilities
      db.run('DELETE FROM abilities WHERE characterId = ?', [character.id], err => {
        if (err) {
          reject(err);
          return;
        }

        // Insert new abilities
        const stmt = db.prepare(
          `INSERT INTO abilities (id, characterId, name, type, description, powerLevel)
           VALUES (?, ?, ?, ?, ?, ?)`
        );

        for (const ability of character.abilities) {
          stmt.run([
            ability.id,
            character.id,
            ability.name,
            ability.type,
            ability.description,
            ability.powerLevel,
          ]);
        }

        stmt.finalize(err => {
          if (err) {
            reject(err);
          } else {
            console.log(`[Cache] Saved character: ${character.name} (${character.id})`);
            resolve();
          }
        });
      });
    });
  });
}
