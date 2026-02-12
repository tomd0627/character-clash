import express, { Request, Response } from 'express';
import cors from 'cors';
import { scrapeCharacter, clearCache, characterDatabase } from './services/characterScraper.js';
import { analyzeMatchup } from './services/comparisonEngine.js';
import {
  getCharacterById,
  searchCharactersByName,
  getAllCharacters,
  cacheCharacter,
} from './db/characterCache.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Character Battle Analysis API (Dynamic Scraper)' });
});

app.get('/api/characters', async (req: Request, res: Response) => {
  try {
    console.log('Fetching all characters from database...');
    const characters = await getAllCharacters();
    res.json(characters);
  } catch (error: any) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/characters/search/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const { universe } = req.query;

    console.log(`Searching for character: ${name}`);

    // First, try to find in database
    const dbResults = await searchCharactersByName(name);

    if (dbResults.length > 0) {
      console.log(`[Cache Hit] Found ${dbResults.length} character(s) in database`);
      res.json(dbResults);
      return;
    }

    // Not in database - scrape and cache
    console.log(`[Cache Miss] Scraping character: ${name}`);
    const character = await scrapeCharacter(name, (universe as string) || 'dragon-ball');

    // Save to database for future searches
    try {
      await cacheCharacter(character);
    } catch (cacheErr) {
      console.error('Failed to cache character:', cacheErr);
      // Continue even if caching fails
    }

    res.json([character]);
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/characters/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log(`Fetching character by ID: ${id}`);

    // First try to get from database
    const dbCharacter = await getCharacterById(id);

    if (dbCharacter) {
      console.log(`[Cache Hit] Found character in database: ${dbCharacter.name}`);
      res.json(dbCharacter);
      return;
    }

    // Not in database - parse ID and scrape
    const parts = id.split('-');
    const universe = parts[parts.length - 1] || 'dragon-ball';
    const name = parts.slice(0, -1).join(' ');

    console.log(`[Cache Miss] Scraping character: ${name} (${universe})`);
    const character = await scrapeCharacter(name, universe);

    // Save to database
    try {
      await cacheCharacter(character);
    } catch (cacheErr) {
      console.error('Failed to cache character:', cacheErr);
    }

    res.json(character);
  } catch (error: any) {
    console.error('Get character error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/compare', async (req: Request, res: Response) => {
  try {
    const { char1Id, char2Id, scenario } = req.body;

    if (!char1Id || !char2Id) {
      res.status(400).json({ error: 'Both character IDs are required' });
      return;
    }

    console.log(`Comparing ${char1Id} vs ${char2Id}...`);

    // Try to get both characters from database first
    let char1 = await getCharacterById(char1Id);
    let char2 = await getCharacterById(char2Id);

    // Parse character IDs if not in database (format: "name-universe" or just "name")
    const parseCharacterId = (id: string) => {
      // First check if this is a direct database key
      if (characterDatabase[id.toLowerCase()]) {
        // Full ID is a valid database key
        return { name: id, universe: 'dragon-ball' };
      }

      // Otherwise, try to parse as "name-universe" format
      const parts = id.split('-');
      if (parts.length > 1) {
        // Assume last part is universe
        const universe = parts[parts.length - 1];
        const name = parts.slice(0, -1).join('-');
        return { name, universe };
      }

      // Single word - treat as name with default universe
      return { name: id, universe: 'dragon-ball' };
    };

    // Fetch char1 if not in database
    if (!char1) {
      const char1Info = parseCharacterId(char1Id);
      console.log(`[Cache Miss] Scraping character 1: ${char1Info.name}`);
      char1 = await scrapeCharacter(char1Info.name, char1Info.universe);
      try {
        await cacheCharacter(char1);
      } catch (err) {
        console.error('Failed to cache char1:', err);
      }
    } else {
      console.log(`[Cache Hit] Character 1: ${char1.name}`);
    }

    // Fetch char2 if not in database
    if (!char2) {
      const char2Info = parseCharacterId(char2Id);
      console.log(`[Cache Miss] Scraping character 2: ${char2Info.name}`);
      char2 = await scrapeCharacter(char2Info.name, char2Info.universe);
      try {
        await cacheCharacter(char2);
      } catch (err) {
        console.error('Failed to cache char2:', err);
      }
    } else {
      console.log(`[Cache Hit] Character 2: ${char2.name}`);
    }

    // Run comparison
    const comparison = analyzeMatchup(
      char1.name,
      char1.stats,
      char1.abilities,
      char2.name,
      char2.stats,
      char2.abilities
    );

    res.json(comparison);
  } catch (error: any) {
    console.error('Comparison error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cache management endpoint
app.post('/api/admin/clear-cache', (req: Request, res: Response) => {
  clearCache();
  res.json({ message: 'Cache cleared successfully' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Using dynamic character scraper (no database required)');
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `Port ${PORT} is already in use. Please stop the existing process or use a different port.`
    );
    process.exit(1);
  }
  throw err;
});

export default app;
