# Goku VS - Development Instructions

## Project Overview

This is a fictional character battle analysis web application built with React/TypeScript (frontend) and Node.js/Express (backend).

## Quick Start

### Prerequisites

- Node.js 16+ installed
- npm available in PATH

### Installation & Setup

1. **From project root, install all dependencies:**

   ```bash
   npm run install:all
   ```

2. **Initialize the database (one time):**

   ```bash
   npm run db:init
   ```

3. **Start development servers:**

   ```bash
   npm run dev
   ```

   This will start:
   - Backend on http://localhost:5000
   - Frontend on http://localhost:3000

4. **Open browser to http://localhost:3000**

## Project Structure

```
goku-vs/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/
│   │   │   ├── StatBar.tsx
│   │   │   └── RadarChart.tsx
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   ├── public/index.html
│   ├── vite.config.ts
│   └── package.json
├── backend/                  # Express API server
│   ├── src/
│   │   ├── server.ts         # Main Express app
│   │   ├── db/
│   │   │   ├── database.ts
│   │   │   └── init.ts
│   │   ├── services/
│   │   │   ├── comparisonEngine.ts
│   │   │   └── characterSearch.ts
│   │   └── data/
│   │       ├── charactersData.ts
│   │       └── seedCharacters.ts
│   ├── data/characters.db    # SQLite database
│   └── package.json
├── package.json              # Root workspace config
└── README.md
```

## Development Commands

### Frontend Only

```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Only

```bash
cd backend
npm run dev      # Compile and start server
npm run build    # Compile TypeScript
npm run db:init  # Reinitialize database
```

### Full Stack (from root)

```bash
npm run dev           # Start both servers
npm run build         # Build both
npm run db:init      # Reinit database (from backend)
```

## Key Features Implemented

✅ Character database with combat stats (0-100 scale)
✅ Character search with name aliasing
✅ Multi-dimensional combat analysis
✅ Verdict system with confidence levels
✅ Win percentage calculation
✅ Stat comparison bars
✅ Radar chart visualization
✅ Scenario analysis (4 scenarios)
✅ Comprehensive analysis text
✅ Responsive UI (mobile, tablet, desktop)
✅ CORS-enabled API
✅ SQLite database

## API Endpoints

### Characters

- `GET /api/health` - Health check
- `GET /api/characters` - List all characters
- `GET /api/characters/search/:name` - Search by name
- `GET /api/characters/:id` - Get character details with abilities

### Analysis

- `POST /api/compare` - Compare two characters
  - Body: `{ char1Id: string, char2Id: string }`
  - Returns: Detailed comparison analysis

## Extending the Application

### Add New Characters

1. Edit `backend/src/data/charactersData.ts`
2. Add new character object to `CHARACTERS_DATABASE` array
3. Run `npm run db:init` to update database

### Modify Comparison Algorithm

- File: `backend/src/services/comparisonEngine.ts`
- Main function: `analyzeMatchup()`
- Adjust stat weighting, verdict thresholds, scenario logic

### Style Changes

- File: `frontend/src/App.css`
- Update CSS variables at `:root` for color scheme
- Responsive breakpoints at bottom

## Current Database Characters

1. Goku (Dragon Ball Z - Namek Saga)
2. Superman (DC Universe - Post-Crisis)
3. Saitama (One Punch Man)
4. Naruto Uzumaki (Naruto Shippuden - Final Arc)
5. Monkey D. Luffy (One Piece - Yonko Era)

## Future Enhancements

- Real web scraping from wikis/forums
- User accounts and ratings
- More scenario variations
- Character image uploads
- Advanced hax/ability system
- Power scaling visualization
- Battle simulation engine
- Community voting system

## Troubleshooting

### Database won't initialize

```bash
# Delete old database and reinit
rm backend/data/characters.db
cd backend
npm run db:init
```

### Frontend won't connect to backend

- Check that backend is running on port 5000
- Check CORS configuration in `backend/src/server.ts`
- Check API_BASE in `frontend/src/App.tsx`

### Port already in use

- Backend: Change PORT in `backend/src/server.ts`
- Frontend: Change port in `frontend/vite.config.ts`

## Notes for Development

- All database operations use callbacks/promises
- Character stats normalized to 0-100 scale
- Comparison algorithm is deterministic
- Stats are prioritized equally in current implementation
- No authentication required in MVP
