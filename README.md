# 🏎️ F1 25 League Tracker

A complete web application for running your own F1 25 custom racing league with friends. Track races, manage drivers, and automatically calculate championship standings.

![F1 League Tracker](https://lovable.dev/opengraph-image-p98pqg.png)

## 🚀 Features

- **Driver Selection**: Assign up to 5 league players to real F1 2025 drivers
- **Race Calendar**: Interactive 24-race 2025 F1 season calendar
- **Race Results Entry**: Input top 10 finishing positions with automatic F1 points calculation (25, 18, 15, 12, 10, 8, 6, 4, 2, 1)
- **Special Awards**: Track Driver of the Day, Fastest Lap, Most Overtakes, and Cleanest Driver
- **Live Standings**: Auto-updating Drivers' and Constructors' Championships
- **Award Statistics**: View career statistics for special achievements
- **Local Storage**: All data persists locally in your browser (no backend needed)

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for blazing fast development
- **Tailwind CSS** for styling with custom F1-inspired design system
- **shadcn/ui** components for beautiful UI
- **React Router** for navigation
- **LocalStorage** for data persistence

## ⚡ Quick Start

### Prerequisites

- Node.js 16+ and npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd f1-league-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be running at `http://localhost:8080`

## 📖 How to Use

### 1. Set Up Your League

1. Navigate to **Driver Setup**
2. Add your league players (up to 5)
3. Assign each player to an F1 driver from the 2025 grid

### 2. Enter Race Results

1. Go to **Race Calendar**
2. Click on any race to enter results
3. Fill in:
   - Top 10 finishing positions
   - Driver of the Day
   - Fastest Lap
   - Most Overtakes
   - Cleanest Driver
4. Click **Save Race Results**

### 3. View Standings

1. Visit the **Standings** page
2. View Drivers' Championship with league player names
3. Check Constructors' Championship
4. See award statistics for each driver

## 🎨 Design System

The app features a custom F1 TV-inspired design with:

- **Colors**: Deep black backgrounds (#000000), racing gold (#D4AF37), racing red accents
- **Typography**: Bold, modern sans-serif with racing aesthetics
- **Animations**: Fast, racing-inspired transitions
- **Responsive**: Fully mobile-friendly design

## 📦 Project Structure

```
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
```

## 🔧 Customization

### Adding More League Players

Edit `src/pages/Drivers.tsx` and change the maximum from 5 to your desired number:

```typescript
if (leaguePlayers.length >= 5) { // Change this number
```

### Modifying Points System

Edit `src/lib/standings.ts`:

```typescript
const POINTS_SYSTEM = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]; // Customize points
```

### Changing Colors

Edit `src/index.css` to customize the design system:

```css
--racing-gold: 45 59% 53%;  /* Gold accent color */
--racing-red: 0 100% 50%;   /* Red accent color */
```

## 📊 Data Storage

All data is stored in your browser's LocalStorage:

- **League Players**: `f1_league_players`
- **Race Results**: `f1_race_results`

### Exporting Data

Open browser DevTools → Console and run:

```javascript
// Export all data
console.log(localStorage.getItem('f1_league_players'));
console.log(localStorage.getItem('f1_race_results'));
```

### Resetting Data

```javascript
// Clear all league data
localStorage.removeItem('f1_league_players');
localStorage.removeItem('f1_race_results');
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Deploy to Vercel, Netlify, or any static host

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy!

## 🤝 Contributing

This is a template project designed to be cloned and customized for your league. Feel free to:

- Add more statistics and charts
- Implement data export/import features
- Add team customization options
- Create historical season archives

## 📝 License

MIT License - feel free to use this for your own F1 league!

## 🙏 Credits

- Built with [Lovable](https://lovable.dev)
- F1 data based on 2025 season calendar
- Icons from [Lucide React](https://lucide.dev)

---

**Ready to race?** 🏁 Start your engines and may the best driver win!
