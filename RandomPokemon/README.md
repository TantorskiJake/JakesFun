# Random Pokémon App

A comprehensive web application for exploring Pokémon data, built with Flask and the PokeAPI. Discover random Pokémon, search by name or ID, analyze type effectiveness, build teams, and more!

![Pokémon App](https://img.shields.io/badge/Pokémon-API-blue) ![Flask](https://img.shields.io/badge/Flask-3.0.0-green) ![Python](https://img.shields.io/badge/Python-3.7+-blue)

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Technologies Used](#technologies-used)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Quick Start

For a quick setup guide, see [docs/QUICKSTART.md](docs/QUICKSTART.md)

For deployment instructions, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Features

### 🎲 Core Features
- **Random Pokémon Discovery**: Get random Pokémon from any generation (1-9)
- **Generation Filter**: Filter random Pokémon by generation (Kanto through Paldea)
- **Search Functionality**: Search Pokémon by name or ID with autocomplete suggestions
- **Type Filtering**: Get random Pokémon by specific type
- **Comprehensive Pokémon Data**: View stats, abilities, moves, sprites, and more

### 📊 Analysis Tools
- **Type Effectiveness Calculator**: See weaknesses, resistances, and immunities
- **Stats Visualization**: Interactive radar charts comparing Pokémon stats
- **Evolution Chain Display**: View Pokémon evolution chains
- **Team Coverage Analysis**: Analyze your team's type coverage, weaknesses, and resistances

### ⭐ Personalization
- **Favorites System**: Save your favorite Pokémon
- **Viewing History**: Track recently viewed Pokémon
- **Team Builder**: Generate and save random teams of 6 Pokémon
- **Export/Import**: Export favorites as JSON or CSV

### 🎨 User Experience
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Loading States**: Progress bars and step-by-step loading indicators
- **Error Handling**: User-friendly error messages with suggestions
- **Keyboard Shortcuts**: Quick navigation and actions

### 📱 Advanced Features
- **All Moves Display**: View all moves with filtering and pagination
- **Move Details**: See power, accuracy, PP, damage class, and descriptions
- **Ability Descriptions**: Detailed ability information
- **Pokémon Comparison**: Compare stats between two Pokémon
- **Share Functionality**: Share Pokémon and teams via links

## Installation

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RandomPokemon
   ```

2. **Create a virtual environment** (recommended)
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Open your browser**
   Navigate to `http://localhost:5001`

## Usage

### Getting Started

1. **Random Pokémon**: Click "Random Pokémon" or press `Ctrl/Cmd + R` to get a random Pokémon
2. **Search**: Use the search bar to find specific Pokémon by name or ID
3. **Generation Filter**: Select a generation from the dropdown to filter random Pokémon
4. **Type Filter**: Click type buttons below the search bar to get random Pokémon of that type

### Viewing Pokémon Details

Each Pokémon page displays:
- **Basic Info**: Name, ID, height, weight, base experience
- **Sprites**: Front/back, normal/shiny variants
- **Types**: Type badges with color coding
- **Stats**: HP, Attack, Defense, Special Attack, Special Defense, Speed
- **Abilities**: List of abilities with descriptions
- **Moves**: Complete move list with filtering options
- **Type Effectiveness**: Weaknesses, resistances, and immunities
- **Evolution Chain**: Evolution family tree

### Using Modals

- **Stats Modal**: Click "View Stats" to see detailed stat visualization
- **Sprites Modal**: Click "View Sprites" to see all sprite variants
- **Type Effectiveness**: Click "Type Effectiveness" to see detailed type matchups
- **Moves Modal**: Click "View All Moves" to see and filter all moves
- **Comparison Modal**: Click "Compare" to compare with another Pokémon

### Team Building

1. Navigate to "Random Team" to generate a team of 6 random Pokémon
2. Click "Analyze Team Coverage" to see:
   - Team weaknesses
   - Team resistances
   - Team immunities
   - Type coverage (super effective against)
   - Summary statistics
3. Save teams for later reference
4. Share teams via generated links

### Favorites and History

- **Favorites**: Click the star icon on any Pokémon to add to favorites
- **View Favorites**: Navigate to "Favorites" page
- **Export Favorites**: Export as JSON or CSV
- **Import Favorites**: Import previously exported favorites
- **History**: Automatically tracks viewed Pokémon (accessible via "History" page)

## Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[API Documentation](docs/API.md)** - Complete API reference
- **[Deployment Guide](docs/DEPLOYMENT.md)** - How to deploy to production
- **[Quick Start Guide](docs/QUICKSTART.md)** - Get started in minutes
- **[Contributing Guide](docs/CONTRIBUTING.md)** - How to contribute
- **[Security Documentation](docs/SECURITY.md)** - Security measures and best practices

## Project Structure

```
RandomPokemon/
├── app.py                 # Flask application and routes
├── wsgi.py               # WSGI entry point for production
├── Procfile              # Process file for deployment platforms
├── requirements.txt      # Python dependencies
├── .gitignore           # Git ignore rules
├── .editorconfig        # Editor configuration
├── .python-version      # Python version specification
├── LICENSE              # MIT License
├── README.md            # This file
├── docs/                # Documentation
│   ├── API.md          # API documentation
│   ├── CONTRIBUTING.md # Contributing guidelines
│   ├── DEPLOYMENT.md   # Deployment guide
│   ├── QUICKSTART.md   # Quick start guide
│   └── SECURITY.md     # Security documentation
├── static/              # Static files
│   ├── css/
│   │   └── style.css   # All styling (light/dark mode, responsive)
│   └── js/
│       └── main.js      # Client-side JavaScript functionality
└── templates/           # HTML templates
    ├── base.html        # Base template with common structure
    ├── index.html       # Main Pokémon display page
    ├── favorites.html    # Favorites page
    ├── history.html     # History page
    └── team.html        # Team builder page
```

## Technologies Used

### Backend
- **Flask 3.0.0**: Web framework
- **Requests 2.31.0**: HTTP library for API calls
- **Python 3.7+**: Programming language

### Frontend
- **HTML5**: Structure
- **CSS3**: Styling with CSS variables, flexbox, grid
- **JavaScript (ES6+)**: Client-side interactivity
- **Canvas API**: For radar chart visualization

### External APIs
- **PokeAPI**: Pokémon data source (https://pokeapi.co)

### Fonts
- **Press Start 2P**: Retro pixel font for Pokémon aesthetic

## Features in Detail

### Type Effectiveness Calculation

The app calculates type effectiveness by:
1. Fetching damage relations for each Pokémon type
2. Combining dual-type interactions
3. Calculating final multipliers:
   - **Weaknesses**: Types that deal 2x or more damage
   - **Resistances**: Types that deal 0.5x or less damage
   - **Immunities**: Types that deal 0x damage

### Caching System

- **In-memory cache**: API responses cached for 5 minutes
- **Reduces API calls**: Improves performance and reduces load on PokeAPI
- **Automatic expiration**: Cache entries expire after timeout

### Local Storage

The app uses browser localStorage for:
- **Favorites**: Saved Pokémon list
- **History**: Recently viewed Pokémon
- **Saved Teams**: User-created teams
- **Dark Mode Preference**: Theme preference persistence

### Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Breakpoints**: Adapts to tablet and desktop screens
- **Flexible layouts**: Two-column layouts on larger screens
- **Touch-friendly**: Large tap targets for mobile

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` | Focus search bar |
| `Ctrl/Cmd + R` | Get random Pokémon |
| `Ctrl/Cmd + S` | Focus search |
| `Esc` | Close modals |
| `?` | Show keyboard shortcuts help |

## Development

### Running in Development Mode

The app runs with debug mode enabled by default:

```bash
python app.py
```

This will:
- Enable Flask debug mode
- Run on port 5001
- Auto-reload on code changes

### Code Structure

#### Backend (`app.py`)
- **Routes**: Handle HTTP requests and render templates
- **API Functions**: Fetch and process Pokémon data
- **Caching**: In-memory cache for API responses
- **Type Calculations**: Type effectiveness logic

#### Frontend (`static/js/main.js`)
- **Pokémon Display**: Fetch and render Pokémon data
- **Modal Management**: Open/close modals
- **Local Storage**: Manage favorites, history, teams
- **UI Interactions**: Dark mode, search, filters

#### Styling (`static/css/style.css`)
- **CSS Variables**: Consistent theming
- **Dark Mode**: Complete dark theme support
- **Responsive**: Media queries for all screen sizes
- **Animations**: Smooth transitions and effects

### Adding New Features

1. **Backend Route**: Add route in `app.py`
2. **Frontend Function**: Add JavaScript function in `main.js`
3. **Styling**: Add CSS in `style.css`
4. **Template**: Update or create HTML template

### Testing

Manual testing checklist:
- [ ] Random Pokémon generation
- [ ] Search functionality
- [ ] Type filtering
- [ ] Generation filtering
- [ ] Favorites system
- [ ] History tracking
- [ ] Team generation
- [ ] Team coverage analysis
- [ ] Dark mode toggle
- [ ] All modals
- [ ] Export/import favorites
- [ ] Keyboard shortcuts
- [ ] Responsive design

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow PEP 8 for Python code
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and small

## Known Limitations

- **API Rate Limiting**: PokeAPI has rate limits; caching helps mitigate this
- **Pokémon Range**: Currently supports Pokémon IDs 1-1025
- **No Backend Database**: All user data stored in browser localStorage
- **No User Accounts**: Favorites and teams are local to browser

## Future Enhancements

Potential features to add:
- [ ] User authentication and cloud storage
- [ ] Advanced search filters (by ability, move, stat ranges)
- [ ] Pokémon cry audio playback
- [ ] Shareable team URLs with backend support
- [ ] Loading skeletons for better perceived performance
- [ ] Sort options for favorites and history
- [ ] Battle simulator
- [ ] Move set builder
- [ ] IV/EV calculator

## Troubleshooting

### Port Already in Use

If port 5001 is in use, modify `app.py`:

```python
app.run(debug=True, port=5002)  # Change port number
```

### API Errors

If you encounter API errors:
- Check your internet connection
- Verify PokeAPI is accessible: https://pokeapi.co
- Wait a few minutes (rate limiting)
- Clear browser cache

### Local Storage Issues

If favorites/history don't persist:
- Check browser localStorage is enabled
- Clear browser cache and try again
- Check browser console for errors

## License

This project is open source and available for personal and educational use.

## Acknowledgments

- **PokeAPI**: For providing the comprehensive Pokémon database
- **Flask**: For the excellent web framework
- **Pokémon Company**: For creating the amazing Pokémon franchise

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the code comments for implementation details

---

**Enjoy exploring the world of Pokémon!** 🎮✨

