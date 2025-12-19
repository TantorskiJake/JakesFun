# Quick Start Guide

Get the Random Pokémon App running in minutes!

## Installation

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the app
python app.py

# 3. Open browser
# Navigate to http://localhost:5001
```

That's it! The app is now running.

## First Steps

1. **Get a Random Pokémon**
   - Click "Random Pokémon" button
   - Or press `Ctrl/Cmd + R`

2. **Search for a Pokémon**
   - Type in the search bar (e.g., "pikachu")
   - Select from suggestions or press Enter

3. **Filter by Generation**
   - Use the "Gen" dropdown in navigation
   - Select a generation (1-9)
   - Click "Random Pokémon"

4. **Filter by Type**
   - Click any type button below search
   - Get a random Pokémon of that type

## Key Features

### 🎲 Random Discovery
- Click "Random Pokémon" for surprise Pokémon
- Use generation filter for specific eras
- Use type filter for type-specific random

### 🔍 Search
- Search by name or ID
- Autocomplete suggestions
- Case-insensitive

### ⭐ Favorites
- Click star icon to favorite
- View all favorites on Favorites page
- Export as JSON/CSV

### 📊 Analysis
- **Type Effectiveness**: See weaknesses/resistances
- **Stats**: View detailed stat breakdown
- **Comparison**: Compare two Pokémon
- **Team Coverage**: Analyze team type coverage

### 🎨 Customization
- **Dark Mode**: Toggle theme
- **Keyboard Shortcuts**: Quick actions
- **History**: Track viewed Pokémon

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search |
| `Ctrl/Cmd + R` | Random Pokémon |
| `Esc` | Close modals |
| `?` | Show shortcuts |

## Common Tasks

### View All Moves
1. Open any Pokémon
2. Click "View All Moves"
3. Use filters to find specific moves
4. Navigate with pagination

### Build a Team
1. Go to "Random Team"
2. View 6 random Pokémon
3. Click "Analyze Team Coverage"
4. Save team for later

### Compare Pokémon
1. Open a Pokémon
2. Click "Compare"
3. Search for another Pokémon
4. View side-by-side comparison

## Troubleshooting

**Port already in use?**
- Change port in `app.py`: `app.run(debug=True, port=5002)`

**API errors?**
- Check internet connection
- Wait a few minutes (rate limiting)
- Clear browser cache

**Favorites not saving?**
- Check browser localStorage is enabled
- Try different browser
- Clear cache and retry

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [API.md](API.md) for API details
- See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

## Need Help?

- Check the main [README.md](README.md)
- Review code comments
- Open an issue on GitHub

Enjoy exploring Pokémon! 🎮✨

