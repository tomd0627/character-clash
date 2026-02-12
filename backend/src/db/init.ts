import { initializeDatabase } from './database.js';
import { insertCharacters } from '../data/seedCharacters.js';

async function init() {
  try {
    console.log('Initializing database...');
    const db = await initializeDatabase();
    console.log('Database initialized successfully');
    
    console.log('Seeding character data...');
    await insertCharacters(db);
    console.log('Character data seeded successfully');
    
    // Verify data was inserted
    db.all('SELECT COUNT(*) as count FROM characters', (err: any, rows: any) => {
      console.log('Characters in DB:', rows?.[0]?.count || 0);
      
      db.all('SELECT COUNT(*) as count FROM combat_stats', (err2: any, rows2: any) => {
        console.log('Stats in DB:', rows2?.[0]?.count || 0);
        db.close(() => {
          process.exit(0);
        });
      });
    });
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

init();
