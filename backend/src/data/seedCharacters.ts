import { v4 as uuidv4 } from 'uuid';
import { CHARACTERS_DATABASE } from './charactersData.js';

export async function insertCharacters(db: any): Promise<void> {
  return new Promise((resolve, reject) => {
    // Insert characters
    let charCount = 0;
    const totalChars = CHARACTERS_DATABASE.length;

    CHARACTERS_DATABASE.forEach((charData) => {
      const char = charData.character;
      
      db.run(
        `INSERT OR IGNORE INTO characters (id, name, universe, version, description, imageUrl) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [char.id, char.name, char.universe, char.version, char.description, char.imageUrl],
        function(err: any) {
          if (err) {
            console.error('Error inserting character:', err);
            return;
          }

          // Insert stats for this character
          const statsId = uuidv4();
          const stats = charData.stats;
          db.run(
            `INSERT OR IGNORE INTO combat_stats 
             (id, characterId, strength, speed, durability, stamina, energyOutput, techniqueProficiency, experience, adaptability)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [statsId, char.id, stats.strength, stats.speed, stats.durability, stats.stamina, 
             stats.energyOutput, stats.techniqueProficiency, stats.experience, stats.adaptability],
            function(err2: any) {
              if (err2) {
                console.error('Error inserting stats:', err2);
              }

              // Insert abilities for this character
              charData.abilities.forEach((ability) => {
                db.run(
                  `INSERT OR IGNORE INTO abilities (id, characterId, name, type, description, powerLevel)
                   VALUES (?, ?, ?, ?, ?, ?)`,
                  [ability.id, char.id, ability.name, ability.type, ability.description, ability.powerLevel],
                  function(err3: any) {
                    if (err3) {
                      console.error('Error inserting ability:', err3);
                    }
                  }
                );
              });

              charCount++;
              if (charCount === totalChars) {
                resolve();
              }
            }
          );
        }
      );
    });
  });
}
