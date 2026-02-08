# Contributing to Random Pokémon App

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/your-username/RandomPokemon.git
   cd RandomPokemon
   ```

3. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Guidelines

### Code Style

#### Python (Backend)
- Follow **PEP 8** style guide
- Use meaningful variable and function names
- Add docstrings for functions and classes
- Keep functions focused and small
- Maximum line length: 100 characters

**Example:**
```python
def get_pokemon_data(pokemon_id_or_name):
    """
    Fetch Pokémon data from API with caching.
    
    Args:
        pokemon_id_or_name: Pokémon ID or name
        
    Returns:
        dict: Pokémon data or None if not found
    """
    # Implementation
```

#### JavaScript (Frontend)
- Use **ES6+** syntax
- Use meaningful variable and function names
- Add comments for complex logic
- Use `const` and `let` instead of `var`
- Use arrow functions where appropriate

**Example:**
```javascript
// Fetch Pokémon data and update UI
async function fetchPokemonData(id) {
    try {
        const response = await fetch(`/api/pokemon/${id}`);
        const data = await response.json();
        updateUI(data);
    } catch (error) {
        console.error('Error fetching Pokémon:', error);
        showError('Failed to load Pokémon data');
    }
}
```

#### CSS
- Use CSS variables for theming
- Follow BEM naming convention for complex components
- Keep selectors specific but not overly nested
- Add comments for complex styles

**Example:**
```css
/* Pokémon card component */
.pokemon-card {
    background: var(--card-bg);
    border-radius: var(--border-radius);
}

.pokemon-card__header {
    /* Styles */
}
```

### Commit Messages

Use clear, descriptive commit messages:

**Format:**
```
<type>: <subject>

<body>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat: Add generation filter for random Pokémon

Add dropdown to filter random Pokémon by generation (1-9).
Includes backend route update and frontend UI changes.

fix: Resolve dark mode button alignment issue

Update CSS to ensure dark mode toggle button aligns
correctly with other navigation links.
```

### Pull Request Process

1. **Update your branch:**
   ```bash
   git pull origin main
   ```

2. **Test your changes:**
   - Test all affected features
   - Check for console errors
   - Verify responsive design
   - Test dark mode compatibility

3. **Create pull request:**
   - Provide clear description
   - Reference related issues
   - Include screenshots if UI changes
   - List testing performed

4. **Respond to feedback:**
   - Address review comments
   - Make requested changes
   - Keep PR updated with main branch

## Feature Development

### Adding a New Feature

1. **Plan the feature:**
   - Define requirements
   - Consider UI/UX impact
   - Check API availability
   - Plan data structure

2. **Implement backend:**
   - Add route in `app.py`
   - Add helper functions if needed
   - Update caching if applicable
   - Add error handling

3. **Implement frontend:**
   - Add JavaScript functions
   - Update HTML templates
   - Add CSS styling
   - Ensure dark mode support

4. **Test thoroughly:**
   - Test happy path
   - Test error cases
   - Test edge cases
   - Test on different browsers

5. **Update documentation:**
   - Update README.md if needed
   - Add API documentation if new endpoint
   - Update feature list

### Feature Checklist

- [ ] Backend route/function implemented
- [ ] Frontend JavaScript implemented
- [ ] CSS styling added (light and dark mode)
- [ ] Error handling added
- [ ] Loading states implemented
- [ ] Responsive design verified
- [ ] Dark mode compatibility checked
- [ ] Documentation updated
- [ ] No console errors
- [ ] Code follows style guidelines

## Bug Reports

### Reporting Bugs

When reporting bugs, include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Environment**: Browser, OS, Python version
7. **Console Errors**: Any JavaScript errors

**Example:**
```
**Bug Description:**
Dark mode toggle doesn't work on team page.

**Steps to Reproduce:**
1. Navigate to /team
2. Click dark mode toggle
3. Page doesn't change theme

**Expected Behavior:**
Page should switch to dark mode.

**Actual Behavior:**
No change occurs.

**Environment:**
- Browser: Chrome 120
- OS: macOS 14
- Python: 3.11
```

### Fixing Bugs

1. **Reproduce the bug**
2. **Identify the cause**
3. **Fix the issue**
4. **Test the fix**
5. **Test related features** (regression testing)
6. **Update tests if applicable**

## Testing

### Manual Testing Checklist

Before submitting PR, test:

- [ ] Random Pokémon generation
- [ ] Search functionality
- [ ] Type filtering
- [ ] Generation filtering
- [ ] Favorites system
- [ ] History tracking
- [ ] Team generation
- [ ] Team coverage analysis
- [ ] Dark mode toggle
- [ ] All modals open/close
- [ ] Export/import favorites
- [ ] Keyboard shortcuts
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Error handling
- [ ] Loading states

### Browser Testing

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Code Review

### Review Process

1. **Automated checks**: Code style, syntax
2. **Manual review**: Logic, design, performance
3. **Testing**: Reviewer tests the changes
4. **Feedback**: Comments and suggestions
5. **Approval**: Once all concerns addressed

### Review Criteria

- Code quality and style
- Functionality correctness
- Performance considerations
- Security implications
- Documentation completeness
- Test coverage

## Project Structure

Understand the project structure:

```
RandomPokemon/
├── app.py              # Flask routes and backend logic
├── requirements.txt    # Python dependencies
├── static/
│   ├── css/
│   │   └── style.css   # All styling
│   └── js/
│       └── main.js     # Client-side JavaScript
└── templates/
    ├── base.html       # Base template
    ├── index.html      # Main page
    ├── favorites.html  # Favorites page
    ├── history.html    # History page
    └── team.html       # Team page
```

## Questions?

If you have questions:
- Check existing issues
- Review code comments
- Open a discussion issue
- Ask in PR comments

## Thank You!

Your contributions make this project better. Thank you for taking the time to contribute! 🎉

