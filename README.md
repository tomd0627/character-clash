# Goku VS - Fictional Character Battle Analysis

🥊 A web application for analyzing fictional character battles with detailed combat statistics, scenario analysis, and verdict predictions.

## Features

### Core Analysis

- **Character Comparison**: Compare any fictional character details against Goku (or any other character)
- **Multi-Dimensional Combat Analysis**: Evaluate characters across 8 combat dimensions:
  - Physical Stats (strength, speed, durability, stamina)
  - Power Systems (energy output)
  - Combat Skills (technique proficiency, experience, adaptability)

### Visualization & Reporting

- **Combat Statistics Bars**: Side-by-side stat comparisons with visual bars
- **Radar Charts**: Visual representation of stat distributions
- **Verdict System**: Confidence-based verdict with win percentage
- **Scenario Analysis**: Multiple matchup scenarios:
  - Random Encounter
  - Bloodlusted (no morals, maximum power)
  - With Prep Time (preparation allowed)
  - In-Character (following personality)

### Character Database

- **135+ characters**: Pre-loaded from dynamically scraped database
- **Character search**: Real-time search with name matching
- **Expandable**: Easy to add new characters

### Technical Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Analysis**: Fast comparison engine
- **Cached Results**: Character data caching layer for performance
- **Type-Safe**: Full TypeScript implementation

## Recent Improvements

### Code Quality & Performance

- **Optimized handlers**: Refactored duplicate search and keyboard event handlers using factory functions, reducing code by ~200 lines
- **Cleaned unused code**: Removed unused imports, interfaces, and utility modules
- **Building optimization**: Produces clean, efficient production builds (~63KB gzipped JS)

### Data & Images

- **Dynamic character database**: 135+ characters with complete stat profiles
- **Optimized images**: Uses color-coded avatar system for consistency and performance
- **Character caching**: Intelligent caching layer for database operations

## Project Structure

```
goku-vs/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── StatBar.tsx
│   │   │   └── RadarChart.tsx
│   │   ├── App.tsx          # Main application component (refactored with factory handlers)
│   │   ├── App.css          # Styling
│   │   └── main.tsx         # Entry point
│   ├── public/
│   │   └── index.html
│   ├── vite.config.ts       # Vite configuration
│   ├── tsconfig.json
│   └── package.json
├── backend/                  # Node.js Express API
│   ├── src/
│   │   ├── server.ts        # Express application
│   │   ├── db/
│   │   │   ├── database.ts  # Database operations
│   │   │   ├── characterCache.ts  # Character caching layer
│   │   │   └── init.ts      # Database initialization
│   │   ├── services/
│   │   │   ├── comparisonEngine.ts  # Matchup analysis algorithm
│   │   │   └── characterScraper.ts  # Dynamic character database (135+ characters)
│   │   └── data/
│   │       ├── charactersData.ts
│   │       └── seedCharacters.ts
│   ├── data/
│   │   └── characters.db    # SQLite database (auto-created on first run)
│   ├── tsconfig.json
│   └── package.json
├── .github/
│   └── copilot-instructions.md
└── README.md (this file)
```

## Tech Stack

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Axios** - HTTP client

### Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **SQLite3** - Database
- **TypeScript** - Type safety
- **CORS** - Cross-origin support

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/goku-vs.git
cd goku-vs
```

2. **Install all dependencies** (root-level installation handles both frontend and backend)

```bash
npm install
npm install -w frontend
npm install -w backend
```

3. **Start both servers**

From the project root:

```bash
npm run dev
```

This will start:

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000 (or next available port)

Open http://localhost:3000 in your browser to use the application.

**Alternative: Start servers separately**

Terminal 1 - Backend:

```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:

```bash
cd frontend
npm run dev
```

## API Endpoints

### Characters

- `GET /api/health` - Health check
- `GET /api/characters` - List all characters (with stats and abilities)
- `GET /api/characters/search/:name` - Search characters by name (fuzzy matching)
- `GET /api/characters/:id` - Get specific character with detailed stats

### Comparison

- `POST /api/compare` - Analyze character matchup
  - Body: `{ char1Id: string, char2Id: string }`
  - Returns: Detailed comparison with multi-scenario analysis

## Building for Production

### Build both frontend and backend

```bash
npm run build
```

Generates:

- Backend: Compiled TypeScript in `backend/dist/`
- Frontend: Optimized bundle in `frontend/dist/`

### Production deployment

```bash
# Set environment variables if needed
export PORT=5000  # Optional: change backend port (default 5000)

# Start backend
cd backend
node dist/server.js

# Serve frontend (use static file server for dist folder)
# e.g., `npx serve frontend/dist` or configure nginx
```

## Combat Stats Explanation

### Physical Stats (0-100)

- **Strength**: Lifting power and striking force capability
- **Speed**: Reaction time, combat speed, and movement velocity
- **Durability**: Resistance to damage and survival capacity
- **Stamina**: Energy reserves and endurance in prolonged combat

### Power Systems (0-100)

- **Energy Output**: Total power/energy a character can channel

### Combat Skills (0-100)

- **Technique Proficiency**: Combat technique mastery and skill
- **Experience**: Battle experience and tactical knowledge
- **Adaptability**: Ability to adjust to new situations and counter opponents

## Character Data Format

Characters are stored with:

- Basic info (name, universe, version)
- 8 combat stats (0-100 scale)
- List of special abilities with power levels
- Notable feats and anti-feats

## Verdict System

- **Stomp**: >15 stat advantage - Clear victory
- **High Difficulty**: 10-15 advantage - Likely victory with struggle
- **Mid Difficulty**: 5-10 advantage - Probable victory
- **Could Go Either Way**: 2-5 advantage - Slight edge
- **Toss-up**: <2 difference - Essentially balanced

## Scenario Analysis

### Random Encounter

Assumes combatants meet with no preparation, fighting in character.

### Bloodlusted

Maximum effort, no moral restraints, willing to kill. Shows raw power advantage.

### With Prep Time

Character can prepare strategies and countermeasures. Favors adaptable characters.

### In-Character

Follows the character's typical personality and fighting style. May include hesitation or honor codes.

## Extending the Database

New characters are automatically scraped and cached by the dynamic character scraper. To add or modify character data:

1. Edit `backend/src/services/characterScraper.ts` and add character objects to the database
2. Characters require:
   - `id`: Unique identifier
   - `name`: Character name
   - `universe`: Source franchise/universe
   - `version`: Specific form or era
   - `stats`: 8 combat stats (0-100 scale)
   - `imageUrl`: Character image URL
   - `abilities`: Array of special abilities with power levels
   - `feats`: Notable achievements
   - `antiFeats`: Losses or limitations

3. Restart the backend to reload the character database

## Development Commands

### Frontend only

```bash
cd frontend
npm run dev      # Start dev server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build locally
```

### Backend only

```bash
cd backend
npm run dev      # Compile TypeScript and start server with auto-reload
npm run build    # Compile TypeScript only
```

### From project root

```bash
npm run dev             # Start both dev servers
npm run build           # Build both frontend and backend
npm run build:frontend  # Build frontend only
npm run build:backend   # Build backend only
```

## Future Enhancement Ideas

- Real web scraping from official wikis and forums
- User accounts and rating system
- Community voting on matchup outcomes
- Advanced power scaling visualization
- Battle simulation engine
- Hax (reality warping, time manipulation) rating system
- Speed equalization toggle for matches
- Search filters by universe/franchise
- Comparison history and bookmarking
- Advanced caching with Redis for scaling

## Important Disclaimer

⚖️ **All matchup analysis is for entertainment purposes.** Cross-universe character comparisons are inherently subjective and speculative because:

- Different universes have completely different power scaling systems
- Feats and statements can be interpreted multiple ways
- Power levels vary dramatically between different narrative contexts
- Special abilities (hax) don't always translate between universes consistently

This tool applies a consistent analytical framework to available data, but results should be viewed as **discussion starters**, not definitive answers. The "best" fighter between characters is ultimately a matter of interpretation and personal preference.

## Contributing

Contributions are welcome! Ways to improve the project:

1. **Expand character database**: Add more characters with accurate, sourced stat data
2. **Improve comparison algorithm**: Enhance the analysis methodology
3. **UI/UX enhancements**: Improve interface design and user experience
4. **Testing**: Add test coverage and validation
5. **Performance**: Optimize database queries and API responses
6. **Documentation**: Improve comments and inline documentation

## Troubleshooting

### Server won't start

- Ensure port 5000 is not in use: `netstat -an | find ":5000"`
- Delete database and restart: `rm backend/data/characters.db`
- Check Node.js version: `node --version` (requires 16+)

### Frontend connection issues

- Verify backend is running on port 5000
- Check CORS is enabled in `backend/src/server.ts`
- Clear browser cache and reload
- Check browser console for detailed error messages

### Build failures

- Clear node_modules: `rm -r node_modules` and reinstall
- Clear build artifacts: `rm -r backend/dist frontend/dist`
- Rebuild: `npm run build`

## License

This project is created for educational and entertainment purposes.

## Credits

- Original universe rights belong to respective copyright holders
- Character data sourced from official wikis, canon materials, and community resources
- Built with React, Node.js, and TypeScript

---

**Enjoy the analysis! May the best fighter win! ⚡**
