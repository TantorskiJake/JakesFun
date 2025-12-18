// Global variables
let currentPokemon = null;
let currentSpriteType = 'front';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dark mode
    initDarkMode();
    
    // Check if we're on the favorites page
    if (document.getElementById('favoritesContainer')) {
        loadFavorites();
        return;
    }
    
    // Check if we're on the history page
    if (document.getElementById('historyContainer')) {
        loadHistory();
        return;
    }
    
    const container = document.getElementById('pokemonContainer');
    if (container) {
        const pokemonData = container.getAttribute('data-pokemon');
        if (pokemonData) {
            currentPokemon = JSON.parse(pokemonData);
            updateFavoriteButton();
            addToHistory(currentPokemon);
        }
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Focus search input on '/' key
    document.addEventListener('keydown', function(e) {
        if (e.key === '/' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            document.getElementById('searchInput')?.focus();
        }
    });
    
    // Setup search autocomplete
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('blur', function() {
            // Delay hiding suggestions to allow clicks
            setTimeout(() => {
                const suggestions = document.getElementById('searchSuggestions');
                if (suggestions) suggestions.style.display = 'none';
            }, 200);
        });
    }
});

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Don't trigger if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    switch(e.key) {
        case 'r':
        case 'R':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                getRandomPokemon();
            }
            break;
        case 's':
        case 'S':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                document.getElementById('searchInput')?.focus();
            }
            break;
        case 'Escape':
            closeStatsModal();
            closeSpriteModal();
            break;
    }
}

// Get random Pokémon
function getRandomPokemon() {
    showLoading();
    window.location.href = '/random';
}

// Search Pokémon
function handleSearch(event) {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        event.preventDefault();
        return false;
    }
    showLoading();
    return true;
}

// Search Pokémon by name
function searchPokemon(name) {
    showLoading();
    window.location.href = `/pokemon/${name.toLowerCase()}`;
}

// Switch sprite view
function switchSprite(type) {
    if (!currentPokemon) return;
    
    currentSpriteType = type;
    const img = document.getElementById('pokemonSprite');
    const buttons = document.querySelectorAll('.sprite-btn');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    
    let imageUrl = '';
    switch(type) {
        case 'front':
            imageUrl = currentPokemon.image_url;
            break;
        case 'back':
            imageUrl = currentPokemon.back_image_url || currentPokemon.image_url;
            break;
        case 'shiny':
            imageUrl = currentPokemon.shiny_image_url || currentPokemon.image_url;
            break;
    }
    
    if (img && imageUrl) {
        img.src = imageUrl;
    }
    
    // Find and activate the clicked button
    buttons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(type)) {
            btn.classList.add('active');
        }
    });
}

// Open stats modal
function openStatsModal() {
    if (!currentPokemon) return;
    
    const modal = document.getElementById('statsModal');
    const title = document.getElementById('statsModalTitle');
    const container = document.getElementById('statsContainer');
    
    if (title) title.textContent = `${currentPokemon.name} Stats`;
    
    if (container && currentPokemon.stats) {
        container.innerHTML = '';
        Object.entries(currentPokemon.stats).forEach(([statName, statValue]) => {
            const statDiv = document.createElement('div');
            statDiv.className = 'stat';
            
            const statNameH3 = document.createElement('h3');
            statNameH3.textContent = statName.charAt(0).toUpperCase() + statName.slice(1);
            
            const progressDiv = document.createElement('div');
            progressDiv.className = 'progress';
            
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            const percentage = Math.round((statValue / 255) * 100);
            progressBar.style.width = percentage + '%';
            progressBar.textContent = statValue;
            
            progressDiv.appendChild(progressBar);
            statDiv.appendChild(statNameH3);
            statDiv.appendChild(progressDiv);
            container.appendChild(statDiv);
        });
    }
    
    if (modal) modal.style.display = 'block';
}

// Close stats modal
function closeStatsModal() {
    const modal = document.getElementById('statsModal');
    if (modal) modal.style.display = 'none';
}

// Open sprite modal
function openSpriteModal() {
    if (!currentPokemon) return;
    
    const modal = document.getElementById('spriteModal');
    const title = document.getElementById('spriteModalTitle');
    const img = document.getElementById('spriteModalImg');
    
    if (title) title.textContent = `${currentPokemon.name} Sprites`;
    
    // Show shiny sprite in modal
    if (img && currentPokemon.shiny_image_url) {
        img.src = currentPokemon.shiny_image_url;
    }
    
    // Play cry sound if available
    const cryAudio = document.getElementById('cryAudio');
    if (cryAudio) {
        cryAudio.play().catch(e => console.log('Audio play failed:', e));
    }
    
    if (modal) modal.style.display = 'block';
}

// Close sprite modal
function closeSpriteModal() {
    const modal = document.getElementById('spriteModal');
    if (modal) modal.style.display = 'none';
}

// Toggle favorite
function toggleFavorite() {
    if (!currentPokemon) return;
    
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.findIndex(p => p.id === currentPokemon.id);
    
    if (index > -1) {
        favorites.splice(index, 1);
        updateFavoriteButton(false);
        showNotification(`${currentPokemon.name} removed from favorites!`);
    } else {
        favorites.push(currentPokemon);
        updateFavoriteButton(true);
        showNotification(`${currentPokemon.name} added to favorites!`);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Update favorite button state
function updateFavoriteButton() {
    if (!currentPokemon) return;
    
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const isFavorite = favorites.some(p => p.id === currentPokemon.id);
    const btn = document.getElementById('favoriteBtn');
    const text = document.getElementById('favoriteText');
    
    if (btn && text) {
        if (isFavorite) {
            btn.classList.add('favorited');
            text.textContent = 'Remove from Favorites';
        } else {
            btn.classList.remove('favorited');
            text.textContent = 'Add to Favorites';
        }
    }
}

// Add to history
function addToHistory(pokemon) {
    if (!pokemon) return;
    
    let history = JSON.parse(localStorage.getItem('pokemonHistory') || '[]');
    
    // Remove if already exists
    history = history.filter(p => p.id !== pokemon.id);
    
    // Add to beginning
    history.unshift({
        id: pokemon.id,
        name: pokemon.name,
        image_url: pokemon.image_url
    });
    
    // Keep only last 20
    history = history.slice(0, 20);
    
    localStorage.setItem('pokemonHistory', JSON.stringify(history));
}

// Show loading spinner
function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'block';
}

// Show notification
function showNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Load favorites page
function loadFavorites() {
    const container = document.getElementById('favoritesContainer');
    const emptyState = document.getElementById('emptyFavorites');
    
    if (!container) return;
    
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (favorites.length === 0) {
        container.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    container.innerHTML = '';
    
    favorites.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        
        card.innerHTML = `
            <img src="${pokemon.image_url || ''}" alt="${pokemon.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3C/svg%3E'">
            <h3>${pokemon.name} #${pokemon.id}</h3>
            <div class="favorite-card-actions">
                <button class="reload-button" onclick="viewPokemon(${pokemon.id})">View</button>
                <button class="reload-button" onclick="removeFavorite(${pokemon.id})">Remove</button>
            </div>
        `;
        
        card.addEventListener('click', function(e) {
            if (e.target.tagName !== 'BUTTON') {
                viewPokemon(pokemon.id);
            }
        });
        
        container.appendChild(card);
    });
}

// View Pokémon from favorites
function viewPokemon(id) {
    window.location.href = `/pokemon/${id}`;
}

// Remove from favorites
function removeFavorite(id) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    favorites = favorites.filter(p => p.id !== id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadFavorites();
    showNotification('Pokémon removed from favorites!');
}

// Open type effectiveness modal
function openTypeEffectivenessModal() {
    if (!currentPokemon || !currentPokemon.type_effectiveness) return;
    
    const modal = document.getElementById('typeEffectivenessModal');
    const title = document.getElementById('typeEffectivenessTitle');
    const container = document.getElementById('typeEffectivenessContainer');
    
    if (title) title.textContent = `${currentPokemon.name} Type Effectiveness`;
    
    if (container) {
        container.innerHTML = '';
        const effectiveness = currentPokemon.type_effectiveness;
        
        if (effectiveness.weak_to && effectiveness.weak_to.length > 0) {
            const section = document.createElement('div');
            section.className = 'effectiveness-section';
            section.innerHTML = '<h4 class="weakness-label">Weak To (2x Damage):</h4>';
            const typeList = document.createElement('div');
            typeList.className = 'type-list';
            effectiveness.weak_to.forEach(typeName => {
                const typeSpan = document.createElement('span');
                typeSpan.className = `type ${typeName}`;
                typeSpan.textContent = typeName.charAt(0).toUpperCase() + typeName.slice(1);
                typeList.appendChild(typeSpan);
            });
            section.appendChild(typeList);
            container.appendChild(section);
        }
        
        if (effectiveness.resistant_to && effectiveness.resistant_to.length > 0) {
            const section = document.createElement('div');
            section.className = 'effectiveness-section';
            section.innerHTML = '<h4 class="resistance-label">Resistant To (0.5x Damage):</h4>';
            const typeList = document.createElement('div');
            typeList.className = 'type-list';
            effectiveness.resistant_to.forEach(typeName => {
                const typeSpan = document.createElement('span');
                typeSpan.className = `type ${typeName}`;
                typeSpan.textContent = typeName.charAt(0).toUpperCase() + typeName.slice(1);
                typeList.appendChild(typeSpan);
            });
            section.appendChild(typeList);
            container.appendChild(section);
        }
        
        if (effectiveness.immune_to && effectiveness.immune_to.length > 0) {
            const section = document.createElement('div');
            section.className = 'effectiveness-section';
            section.innerHTML = '<h4 class="immune-label">Immune To (0x Damage):</h4>';
            const typeList = document.createElement('div');
            typeList.className = 'type-list';
            effectiveness.immune_to.forEach(typeName => {
                const typeSpan = document.createElement('span');
                typeSpan.className = `type ${typeName}`;
                typeSpan.textContent = typeName.charAt(0).toUpperCase() + typeName.slice(1);
                typeList.appendChild(typeSpan);
            });
            section.appendChild(typeList);
            container.appendChild(section);
        }
        
        if (container.children.length === 0) {
            container.innerHTML = '<p>No type effectiveness data available.</p>';
        }
    }
    
    if (modal) modal.style.display = 'block';
}

// Close type effectiveness modal
function closeTypeEffectivenessModal() {
    const modal = document.getElementById('typeEffectivenessModal');
    if (modal) modal.style.display = 'none';
}

// Toggle dark mode
function toggleDarkMode() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
    updateDarkModeButton(isDark);
}

// Initialize dark mode from localStorage
function initDarkMode() {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        updateDarkModeButton(true);
    } else {
        updateDarkModeButton(false);
    }
}

// Update dark mode button text
function updateDarkModeButton(isDark) {
    const button = document.getElementById('darkModeToggle');
    if (button) {
        button.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    }
}

// Share Pokémon
function sharePokemon() {
    if (!currentPokemon) return;
    
    const url = `${window.location.origin}/pokemon/${currentPokemon.id}`;
    const text = `Check out ${currentPokemon.name} #${currentPokemon.id}!`;
    
    if (navigator.share) {
        navigator.share({
            title: `${currentPokemon.name} - Random Pokémon`,
            text: text,
            url: url
        }).catch(err => {
            console.log('Error sharing:', err);
            copyToClipboard(url);
        });
    } else {
        copyToClipboard(url);
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Link copied to clipboard!');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

// Fallback copy method
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showNotification('Link copied to clipboard!');
    } catch (err) {
        showNotification('Failed to copy link');
    }
    document.body.removeChild(textArea);
}

// Load history page
function loadHistory() {
    const container = document.getElementById('historyContainer');
    const emptyState = document.getElementById('emptyHistory');
    
    if (!container) return;
    
    const history = JSON.parse(localStorage.getItem('pokemonHistory') || '[]');
    
    if (history.length === 0) {
        container.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    container.innerHTML = '';
    
    history.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        
        card.innerHTML = `
            <img src="${pokemon.image_url || ''}" alt="${pokemon.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3C/svg%3E'">
            <h3>${pokemon.name} #${pokemon.id}</h3>
            <div class="favorite-card-actions">
                <button class="reload-button" onclick="viewPokemon(${pokemon.id})">View</button>
            </div>
        `;
        
        card.addEventListener('click', function(e) {
            if (e.target.tagName !== 'BUTTON') {
                viewPokemon(pokemon.id);
            }
        });
        
        container.appendChild(card);
    });
}

// Open moves modal
function openMovesModal() {
    if (!currentPokemon || !currentPokemon.moves) return;
    
    const modal = document.getElementById('movesModal');
    const title = document.getElementById('movesModalTitle');
    const container = document.getElementById('movesContainer');
    
    if (title) title.textContent = `${currentPokemon.name} Moves`;
    
    if (container) {
        container.innerHTML = '<p>Loading move details...</p>';
        
        // Fetch move details for each move
        const movePromises = currentPokemon.moves.slice(0, 10).map(move => {
            return fetch(move.url)
                .then(res => res.json())
                .then(data => {
                    const moveType = data.type ? data.type.name : 'unknown';
                    const power = data.power || 'N/A';
                    const accuracy = data.accuracy || 'N/A';
                    const pp = data.pp || 'N/A';
                    const damageClass = data.damage_class ? data.damage_class.name : 'unknown';
                    const description = data.flavor_text_entries?.find(e => e.language.name === 'en')?.flavor_text || 'No description available.';
                    
                    return {
                        name: move.name,
                        type: moveType,
                        power: power,
                        accuracy: accuracy,
                        pp: pp,
                        damageClass: damageClass,
                        description: description
                    };
                })
                .catch(() => ({
                    name: move.name,
                    type: 'unknown',
                    power: 'N/A',
                    accuracy: 'N/A',
                    pp: 'N/A',
                    damageClass: 'unknown',
                    description: 'Unable to load move details.'
                }));
        });
        
        Promise.all(movePromises).then(moves => {
            container.innerHTML = '';
            moves.forEach(move => {
                const moveDiv = document.createElement('div');
                moveDiv.className = 'move-item';
                moveDiv.innerHTML = `
                    <div class="move-header">
                        <h4>${move.name.charAt(0).toUpperCase() + move.name.slice(1).replace(/-/g, ' ')}</h4>
                        <span class="type ${move.type}">${move.type.charAt(0).toUpperCase() + move.type.slice(1)}</span>
                    </div>
                    <div class="move-stats">
                        <span>Power: ${move.power}</span>
                        <span>Accuracy: ${move.accuracy}%</span>
                        <span>PP: ${move.pp}</span>
                        <span>Class: ${move.damageClass.charAt(0).toUpperCase() + move.damageClass.slice(1)}</span>
                    </div>
                    <p class="move-description">${move.description}</p>
                `;
                container.appendChild(moveDiv);
            });
        });
    }
    
    if (modal) modal.style.display = 'block';
}

// Close moves modal
function closeMovesModal() {
    const modal = document.getElementById('movesModal');
    if (modal) modal.style.display = 'none';
}

// Show ability details
function showAbilityDetails(abilityUrl, abilityName) {
    const modal = document.getElementById('abilityModal');
    const title = document.getElementById('abilityModalTitle');
    const container = document.getElementById('abilityContainer');
    
    if (title) title.textContent = abilityName.charAt(0).toUpperCase() + abilityName.slice(1);
    
    if (container) {
        container.innerHTML = '<p>Loading ability details...</p>';
    }
    
    if (modal) modal.style.display = 'block';
    
    fetch(abilityUrl)
        .then(res => res.json())
        .then(data => {
            const description = data.effect_entries?.find(e => e.language.name === 'en')?.effect || 
                              data.flavor_text_entries?.find(e => e.language.name === 'en')?.flavor_text || 
                              'No description available.';
            
            if (container) {
                container.innerHTML = `
                    <div class="ability-details">
                        <h3>${abilityName.charAt(0).toUpperCase() + abilityName.slice(1)}</h3>
                        <p class="ability-description">${description}</p>
                        ${data.generation ? `<p><strong>Generation:</strong> ${data.generation.name.charAt(0).toUpperCase() + data.generation.name.slice(1)}</p>` : ''}
                    </div>
                `;
            }
        })
        .catch(() => {
            if (container) {
                container.innerHTML = '<p>Unable to load ability details.</p>';
            }
        });
}

// Close ability modal
function closeAbilityModal() {
    const modal = document.getElementById('abilityModal');
    if (modal) modal.style.display = 'none';
}

// Search autocomplete
function handleSearchInput(e) {
    const query = e.target.value.trim();
    const suggestionsDiv = document.getElementById('searchSuggestions');
    
    if (!suggestionsDiv) return;
    
    if (query.length < 2) {
        suggestionsDiv.style.display = 'none';
        return;
    }
    
    fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            if (data.suggestions && data.suggestions.length > 0) {
                suggestionsDiv.innerHTML = '';
                data.suggestions.forEach(suggestion => {
                    const item = document.createElement('div');
                    item.className = 'suggestion-item';
                    item.textContent = suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
                    item.onclick = () => {
                        document.getElementById('searchInput').value = suggestion;
                        suggestionsDiv.style.display = 'none';
                        document.querySelector('.search-form').submit();
                    };
                    suggestionsDiv.appendChild(item);
                });
                suggestionsDiv.style.display = 'block';
            } else {
                suggestionsDiv.style.display = 'none';
            }
        })
        .catch(() => {
            suggestionsDiv.style.display = 'none';
        });
}

// Get random Pokémon by type
function getRandomByType(typeName) {
    showLoading();
    fetch(`/api/pokemon-by-type/${typeName}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                showNotification(data.error);
                return;
            }
            // Redirect to the Pokémon page
            window.location.href = `/pokemon/${data.id}`;
        })
        .catch(() => {
            showNotification('Error fetching Pokémon by type');
        });
}

// Comparison feature
let comparisonPokemon2 = null;

function openComparisonModal() {
    if (!currentPokemon) return;
    
    const modal = document.getElementById('comparisonModal');
    const container1 = document.getElementById('comparisonPokemon1Data');
    const name1 = document.getElementById('comparisonPokemon1Name');
    
    if (name1) name1.textContent = currentPokemon.name;
    
    if (container1) {
        container1.innerHTML = createComparisonCard(currentPokemon);
    }
    
    // Reset second Pokémon
    comparisonPokemon2 = null;
    const container2 = document.getElementById('comparisonPokemon2Data');
    if (container2) {
        container2.innerHTML = '<p>Search for a Pokémon to compare</p>';
    }
    
    if (modal) modal.style.display = 'block';
}

function closeComparisonModal() {
    const modal = document.getElementById('comparisonModal');
    if (modal) modal.style.display = 'none';
}

function addComparisonPokemon() {
    const input = document.getElementById('comparisonSearchInput');
    if (!input) return;
    
    const query = input.value.trim();
    if (!query) {
        showNotification('Please enter a Pokémon name or ID');
        return;
    }
    
    fetch(`/api/pokemon/${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                showNotification(data.error);
                return;
            }
            
            comparisonPokemon2 = data;
            const container2 = document.getElementById('comparisonPokemon2Data');
            const name2 = document.getElementById('comparisonPokemon2Name');
            
            if (name2) name2.textContent = data.name;
            if (container2) {
                container2.innerHTML = createComparisonCard(data);
            }
            
            // Update comparison with side-by-side stats
            updateComparisonStats();
        })
        .catch(() => {
            showNotification('Error fetching Pokémon');
        });
}

function createComparisonCard(pokemon) {
    return `
        <img src="${pokemon.image_url || ''}" alt="${pokemon.name}" style="width: 120px; height: 120px; margin: 10px auto; display: block;">
        <div class="comparison-types">
            ${pokemon.types.map(t => `<span class="type ${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</span>`).join('')}
        </div>
        <div class="comparison-stats" data-pokemon-id="${pokemon.id}">
            ${Object.entries(pokemon.stats || {}).map(([stat, value]) => `
                <div class="comparison-stat-row">
                    <span class="comparison-stat-label">${stat.charAt(0).toUpperCase() + stat.slice(1)}:</span>
                    <span class="comparison-stat-value">${value}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function updateComparisonStats() {
    if (!currentPokemon || !comparisonPokemon2) return;
    
    const stats1 = document.querySelector('.comparison-stats[data-pokemon-id="' + currentPokemon.id + '"]');
    const stats2 = document.querySelector('.comparison-stats[data-pokemon-id="' + comparisonPokemon2.id + '"]');
    
    if (!stats1 || !stats2) return;
    
    // Add visual comparison (highlight higher stats)
    const statRows1 = stats1.querySelectorAll('.comparison-stat-row');
    const statRows2 = stats2.querySelectorAll('.comparison-stat-row');
    
    statRows1.forEach((row1, index) => {
        const row2 = statRows2[index];
        if (!row2) return;
        
        const value1 = parseInt(row1.querySelector('.comparison-stat-value').textContent);
        const value2 = parseInt(row2.querySelector('.comparison-stat-value').textContent);
        
        if (value1 > value2) {
            row1.classList.add('stat-higher');
            row2.classList.add('stat-lower');
        } else if (value2 > value1) {
            row1.classList.add('stat-lower');
            row2.classList.add('stat-higher');
        } else {
            row1.classList.add('stat-equal');
            row2.classList.add('stat-equal');
        }
    });
}

// Close modals when clicking outside
window.onclick = function(event) {
    const statsModal = document.getElementById('statsModal');
    const spriteModal = document.getElementById('spriteModal');
    const typeModal = document.getElementById('typeEffectivenessModal');
    const movesModal = document.getElementById('movesModal');
    const abilityModal = document.getElementById('abilityModal');
    const comparisonModal = document.getElementById('comparisonModal');
    
    if (event.target == statsModal) {
        closeStatsModal();
    }
    if (event.target == spriteModal) {
        closeSpriteModal();
    }
    if (event.target == typeModal) {
        closeTypeEffectivenessModal();
    }
    if (event.target == movesModal) {
        closeMovesModal();
    }
    if (event.target == abilityModal) {
        closeAbilityModal();
    }
    if (event.target == comparisonModal) {
        closeComparisonModal();
    }
};
