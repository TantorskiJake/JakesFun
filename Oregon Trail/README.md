# The Oregon Trail

A complete, modern implementation of the classic Oregon Trail game built with JavaScript.

## Features

- **Complete Gameplay**: Travel 2,040 miles from Independence, Missouri to Oregon City
- **Party Management**: Create and manage a party of 1-5 travelers with different professions
- **Dynamic Events**: Random events including diseases, injuries, wagon damage, weather, and more
- **Resource Management**: Manage food, ammunition, medicine, wagon parts, and supplies
- **Landmarks**: Visit 13 historical landmarks including forts, rivers, and mountain passes
- **Save/Load System**: Save your progress and continue later
- **Modern Code**: Clean, modular architecture with ES6+ JavaScript

## Requirements

- Node.js 14.0.0 or higher

## Installation

1. Navigate to the project directory:
```bash
cd "Oregon Trail"
```

2. Install dependencies (if any are added in the future):
```bash
npm install
```

## Running the Game

Start the game with:
```bash
npm start
```

Or directly with Node.js:
```bash
node src/index.js
```

## How to Play

1. **Setup Your Party**: Choose the number of travelers (1-5) and assign names and professions
2. **Purchase Supplies**: Buy food, oxen, ammunition, and other supplies with your starting budget of $800
3. **Travel**: Make daily decisions about pace, rations, and actions
4. **Manage Resources**: Keep your party healthy, fed, and your wagon in good condition
5. **Handle Events**: Respond to random events like diseases, injuries, and weather
6. **Reach Oregon City**: Survive the 2,040-mile journey to win!

## Game Mechanics

### Professions
- **Farmer**: +10 Health, +5 Stamina
- **Carpenter**: +5 Health, +10 Stamina, +5 Morale
- **Banker**: +20 Morale
- **Doctor**: +15 Health, +10 Morale
- **Hunter**: +5 Health, +15 Stamina

### Pace Options
- **Rest**: No travel, recover stamina
- **Slow**: 10 miles/day, minimal stamina loss
- **Normal**: 20 miles/day, moderate stamina loss
- **Strenuous**: 30 miles/day, high stamina loss
- **Grueling**: 40 miles/day, very high stamina loss

### Ration Levels
- **Filling**: 3 lbs/person/day, improves morale
- **Normal**: 2 lbs/person/day
- **Meager**: 1.5 lbs/person/day
- **Bare Bones**: 1 lb/person/day

### Locations
The trail includes 13 key locations:
1. Independence, Missouri (Start)
2. Kansas River
3. Big Blue River
4. Fort Kearny
5. Chimney Rock
6. Fort Laramie
7. Independence Rock
8. South Pass
9. Snake River
10. Fort Boise
11. Blue Mountains
12. The Dalles
13. Oregon City (End)

## Save System

The game automatically saves to:
- **Node.js**: `savegame.json` in the project directory
- **Browser**: Browser localStorage (if running in browser)

Use the "Save game" option from the main menu to save your progress.

## Project Structure

```
Oregon Trail/
├── src/
│   ├── index.js          # Main entry point
│   ├── gameEngine.js     # Core game loop and logic
│   ├── player.js         # Player stats and state
│   ├── party.js          # Party management
│   ├── inventory.js      # Items and supplies
│   ├── events.js         # Random events system
│   ├── locations.js      # Landmarks and terrain
│   ├── store.js          # Shopping system
│   └── ui.js             # User interface
├── package.json
└── README.md
```

## Code Quality

- Modern ES6+ JavaScript with classes and modules
- Clear separation of concerns
- Comprehensive comments
- JSON-based save/load system
- Error handling and input validation

## License

MIT

## Credits

Inspired by the classic Oregon Trail game from the 1970s-1990s.

