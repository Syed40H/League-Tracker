# F1 25 League Tracker

A web app for running a custom F1 25 racing league with friends. Track race results, manage drivers, and let the app handle championship standings automatically.

## Features

- Assign up to 5 league players to real F1 2025 drivers
- Interactive 24-race season calendar
- Enter top 10 finishing positions with automatic points calculation (25, 18, 15, 12, 10, 8, 6, 4, 2, 1)
- Track special awards: Driver of the Day, Fastest Lap, Most Overtakes, Cleanest Driver
- Auto-updating Drivers' and Constructors' Championships
- Career stats for special achievements


<img width="1400" height="902" alt="Screenshot 2026-08-06 202631" src="https://github.com/user-attachments/assets/540687e7-ca04-4b15-b010-a16342a6f252" />


## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS with a custom F1-inspired design system
- shadcn/ui components
- React Router
- LocalStorage for persistence

## Getting Started

### Prerequisites

- Node.js 16+ and npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation

\`\`\`bash
git clone <YOUR_GIT_URL>
cd f1-league-tracker
npm install
npm run dev
\`\`\`

The app runs at `http://localhost:8080`.

## How to Use

### 1. Set Up Your League

1. Go to **Driver Setup**
2. Add up to 5 league players
3. Assign each player to a driver from the 2025 grid

### 2. Enter Race Results

1. Go to **Race Calendar**
2. Click a race to enter results
3. Fill in top 10 finishing positions and the special awards (Driver of the Day, Fastest Lap, Most Overtakes, Cleanest Driver)
4. Save

### 3. View Standings

1. Go to **Standings**
2. Check the Drivers' and Constructors' Championships
3. View award stats per driver

## Design

- Dark theme with racing gold (#D4AF37) and red accents
- Bold, motorsport-inspired typography
- Fully responsive/mobile-friendly

## Project Structure

\`\`\`
src/
├── components/       # Reusable UI components (shadcn/ui)
├── data/            # F1 drivers and races data
│   ├── drivers.ts   # 20 F1 2025 drivers
│   └── races.ts     # 24 race calendar
├── lib/             # Utilities and business logic
│   ├── storage.ts   # LocalStorage management
│   ├── standings.ts # Championship calculations
│   └── utils.ts     # Helper functions
├── pages/           # Application pages
│   ├── Index.tsx    # Home/Dashboard
│   ├── Drivers.tsx  # Driver setup
│   ├── Races.tsx    # Race calendar
│   ├── RaceEntry.tsx # Race results entry
│   └── Standings.tsx # Championship standings
└── types/           # TypeScript interfaces
    └── league.ts    # Type definitions
\`\`\`

## Customization

### More League Players

In `src/pages/Drivers.tsx`:

\`\`\`typescript
if (leaguePlayers.length >= 5) { // change this number
\`\`\`

### Points System

In `src/lib/standings.ts`:

\`\`\`typescript
const POINTS_SYSTEM = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]; // customize
\`\`\`

### Colors

In `src/index.css`:

\`\`\`css
--racing-gold: 45 59% 53%;
--racing-red: 0 100% 50%;
\`\`\`

## Data Storage

Everything is stored in browser LocalStorage:

- League players: `f1_league_players`
- Race results: `f1_race_results`

### Exporting

\`\`\`javascript
console.log(localStorage.getItem('f1_league_players'));
console.log(localStorage.getItem('f1_race_results'));
\`\`\`

### Resetting

\`\`\`javascript
localStorage.removeItem('f1_league_players');
localStorage.removeItem('f1_race_results');
\`\`\`

## Deployment

\`\`\`bash
npm run build
\`\`\`

Output goes to `dist/`. Deploy to Vercel, Netlify, or any static host — connect the repo, set the build command to `npm run build`, output directory to `dist`.

## License

MIT — use it for your own league.
