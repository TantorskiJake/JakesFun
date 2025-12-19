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
            // Hide loading if Pokémon is already loaded
            hideLoading();
        }
    } else {
        // Hide loading if no container (error page, etc.)
        hideLoading();
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
            closeTypeEffectivenessModal();
            closeMovesModal();
            closeAbilityModal();
            closeComparisonModal();
            closeKeyboardShortcutsModal();
            break;
        case '?':
            if (!e.shiftKey) {
                e.preventDefault();
                openKeyboardShortcutsModal();
            }
            break;
    }
}

// Get random Pokémon
function getRandomPokemon() {
    showLoading('Getting random Pokémon...', [
        'Selecting random Pokémon',
        'Fetching Pokémon data',
        'Loading details',
        'Almost done...'
    ]);
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        const stepIndex = Math.floor(progress / 25);
        updateLoadingProgress(progress, stepIndex);
        
        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 150);
    
    window.location.href = '/random';
}

// Search Pokémon
function handleSearch(event) {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        event.preventDefault();
        return false;
    }
    showLoading(`Searching for "${query}"...`, [
        'Searching database',
        'Fetching Pokémon data',
        'Loading details',
        'Finalizing...'
    ]);
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += 15;
        const stepIndex = Math.floor(progress / 25);
        updateLoadingProgress(progress, stepIndex);
        
        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 100);
    
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

// Show loading spinner with progress
function showLoading(message = 'Loading Pokémon...', steps = []) {
    const spinner = document.getElementById('loadingSpinner');
    const loadingText = document.getElementById('loadingText');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const loadingSteps = document.getElementById('loadingSteps');
    
    if (spinner) {
        spinner.style.display = 'block';
        if (loadingText) loadingText.textContent = message;
        if (progressBar) progressBar.style.width = '0%';
        if (progressText) progressText.textContent = '0%';
        
        // Show loading steps
        if (loadingSteps && steps.length > 0) {
            loadingSteps.innerHTML = steps.map((step, index) => `
                <div class="loading-step ${index === 0 ? 'active' : ''}" data-step="${index}">
                    <span class="step-icon">${index === 0 ? '⏳' : '○'}</span>
                    <span class="step-text">${step}</span>
                </div>
            `).join('');
        } else if (loadingSteps) {
            loadingSteps.innerHTML = '';
        }
    }
}

// Update loading progress
function updateLoadingProgress(percent, stepIndex = null, stepText = null) {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const loadingSteps = document.getElementById('loadingSteps');
    
    if (progressBar) {
        progressBar.style.width = percent + '%';
        progressBar.style.transition = 'width 0.3s ease';
    }
    
    if (progressText) {
        progressText.textContent = Math.round(percent) + '%';
    }
    
    // Update active step
    if (loadingSteps && stepIndex !== null) {
        const steps = loadingSteps.querySelectorAll('.loading-step');
        steps.forEach((step, index) => {
            if (index < stepIndex) {
                step.classList.remove('active');
                step.classList.add('completed');
                step.querySelector('.step-icon').textContent = '✓';
            } else if (index === stepIndex) {
                step.classList.add('active');
                step.querySelector('.step-icon').textContent = '⏳';
            } else {
                step.classList.remove('active', 'completed');
                step.querySelector('.step-icon').textContent = '○';
            }
        });
        
        if (stepText && steps[stepIndex]) {
            steps[stepIndex].querySelector('.step-text').textContent = stepText;
        }
    }
}

// Hide loading spinner
function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = 'none';
        // Reset progress
        setTimeout(() => {
            updateLoadingProgress(0);
        }, 300);
    }
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
        container.innerHTML = '<div class="loading-moves"><p>Loading move details...</p><div class="progress-bar-container"><div class="progress-bar-fill" id="movesProgress" style="width: 0%;"></div></div></div>';
        
        const movesProgressBar = document.getElementById('movesProgress');
        let loadedMoves = 0;
        const totalMoves = Math.min(currentPokemon.moves.length, 10);
        
        // Fetch move details for each move
        const movePromises = currentPokemon.moves.slice(0, 10).map((move, index) => {
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
        
        // Update progress as moves load
        movePromises.forEach((promise, index) => {
            promise.then(() => {
                loadedMoves++;
                if (movesProgressBar) {
                    const progress = (loadedMoves / totalMoves) * 100;
                    movesProgressBar.style.width = progress + '%';
                }
            });
        });
        
        Promise.all(movePromises).then(moves => {
            if (movesProgressBar) movesProgressBar.style.width = '100%';
            setTimeout(() => {
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
            }, 200);
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
    showLoading(`Finding ${typeName} type Pokémon...`, [
        'Searching type database',
        'Selecting random Pokémon',
        'Fetching data',
        'Loading details'
    ]);
    
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 12;
        const stepIndex = Math.floor(progress / 25);
        updateLoadingProgress(progress, stepIndex);
        
        if (progress >= 90) {
            clearInterval(progressInterval);
        }
    }, 100);
    
    fetch(`/api/pokemon-by-type/${typeName}`)
        .then(res => res.json())
        .then(data => {
            clearInterval(progressInterval);
            updateLoadingProgress(100, 3, 'Complete!');
            
            setTimeout(() => {
                if (data.error) {
                    hideLoading();
                    showNotification(data.error);
                    return;
                }
                // Redirect to the Pokémon page
                window.location.href = `/pokemon/${data.id}`;
            }, 300);
        })
        .catch(() => {
            clearInterval(progressInterval);
            hideLoading();
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
                // Small delay to ensure DOM is updated
                setTimeout(() => {
                    updateComparisonStats();
                }, 100);
            }
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
        <div class="comparison-chart-container" data-pokemon-id="${pokemon.id}">
            <canvas class="comparison-chart" width="250" height="250"></canvas>
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
    
    // Draw radar charts
    const chart1 = document.querySelector('.comparison-chart-container[data-pokemon-id="' + currentPokemon.id + '"] .comparison-chart');
    const chart2 = document.querySelector('.comparison-chart-container[data-pokemon-id="' + comparisonPokemon2.id + '"] .comparison-chart');
    
    if (chart1) drawComparisonChart(currentPokemon, chart1, '#3B4CCA');
    if (chart2) drawComparisonChart(comparisonPokemon2, chart2, '#EE8130');
}

function drawComparisonChart(pokemon, canvas, color) {
    if (!canvas || !pokemon.stats) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 70;
    const maxStat = 255;
    
    const stats = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
    const statLabels = ['HP', 'ATK', 'DEF', 'SP.ATK', 'SP.DEF', 'SPD'];
    const statValues = stats.map(stat => pokemon.stats[stat] || 0);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid circles
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius * i) / 5, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    for (let i = 0; i < stats.length; i++) {
        const angle = (Math.PI * 2 * i) / stats.length - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Draw labels
        const labelX = centerX + Math.cos(angle) * (radius + 15);
        const labelY = centerY + Math.sin(angle) * (radius + 15);
        ctx.fillStyle = '#333';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(statLabels[i], labelX, labelY);
    }
    
    // Draw stat polygon
    ctx.fillStyle = color + '80'; // Add transparency
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < stats.length; i++) {
        const angle = (Math.PI * 2 * i) / stats.length - Math.PI / 2;
        const value = statValues[i] / maxStat;
        const x = centerX + Math.cos(angle) * radius * value;
        const y = centerY + Math.sin(angle) * radius * value;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw stat values at vertices
    ctx.fillStyle = '#333';
    ctx.font = 'bold 9px Arial';
    for (let i = 0; i < stats.length; i++) {
        const angle = (Math.PI * 2 * i) / stats.length - Math.PI / 2;
        const value = statValues[i] / maxStat;
        const x = centerX + Math.cos(angle) * radius * value;
        const y = centerY + Math.sin(angle) * radius * value;
        ctx.fillText(statValues[i], x, y - 10);
    }
}

// Export favorites
function exportFavorites(format) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (favorites.length === 0) {
        showNotification('No favorites to export!');
        return;
    }
    
    let content, filename, mimeType;
    
    if (format === 'json') {
        content = JSON.stringify(favorites, null, 2);
        filename = `pokemon-favorites-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
    } else if (format === 'csv') {
        const headers = ['ID', 'Name', 'Type 1', 'Type 2', 'HP', 'Attack', 'Defense', 'Sp. Attack', 'Sp. Defense', 'Speed'];
        const rows = favorites.map(p => {
            const types = p.types || [];
            return [
                p.id,
                p.name,
                types[0] || '',
                types[1] || '',
                p.stats?.hp || '',
                p.stats?.attack || '',
                p.stats?.defense || '',
                p.stats?.['special-attack'] || '',
                p.stats?.['special-defense'] || '',
                p.stats?.speed || ''
            ].join(',');
        });
        content = [headers.join(','), ...rows].join('\n');
        filename = `pokemon-favorites-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification(`Favorites exported as ${format.toUpperCase()}!`);
}

// Import favorites
function importFavorites() {
    document.getElementById('importFileInput')?.click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let imported;
            if (file.name.endsWith('.json')) {
                imported = JSON.parse(e.target.result);
            } else if (file.name.endsWith('.csv')) {
                // Simple CSV parsing
                const lines = e.target.result.split('\n');
                const headers = lines[0].split(',');
                imported = lines.slice(1).map(line => {
                    const values = line.split(',');
                    return {
                        id: parseInt(values[0]),
                        name: values[1]
                    };
                }).filter(p => p.id && p.name);
            }
            
            if (Array.isArray(imported) && imported.length > 0) {
                const currentFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                const merged = [...currentFavorites];
                
                imported.forEach(p => {
                    if (!merged.find(f => f.id === p.id)) {
                        merged.push(p);
                    }
                });
                
                localStorage.setItem('favorites', JSON.stringify(merged));
                showNotification(`Imported ${imported.length} Pokémon!`);
                
                if (document.getElementById('favoritesContainer')) {
                    loadFavorites();
                }
            }
        } catch (err) {
            showNotification('Error importing file. Please check the format.');
        }
    };
    reader.readAsText(file);
}

// Keyboard shortcuts modal
function openKeyboardShortcutsModal() {
    const modal = document.getElementById('keyboardShortcutsModal');
    if (modal) modal.style.display = 'block';
}

function closeKeyboardShortcutsModal() {
    const modal = document.getElementById('keyboardShortcutsModal');
    if (modal) modal.style.display = 'none';
}

// Save current team
function saveCurrentTeam() {
    const teamCards = document.querySelectorAll('.team-card');
    if (teamCards.length === 0) {
        showNotification('No team to save!');
        return;
    }
    
    const team = [];
    teamCards.forEach(card => {
        const img = card.querySelector('img');
        const name = card.querySelector('h3');
        if (img && name) {
            const pokemonId = parseInt(card.getAttribute('onclick')?.match(/\d+/)?.[0]);
            if (pokemonId) {
                team.push(pokemonId);
            }
        }
    });
    
    if (team.length === 0) {
        showNotification('Could not extract team data.');
        return;
    }
    
    const savedTeams = JSON.parse(localStorage.getItem('savedTeams') || '[]');
    const teamName = prompt('Enter a name for this team:', `Team ${savedTeams.length + 1}`);
    
    if (teamName) {
        savedTeams.push({
            name: teamName,
            pokemonIds: team,
            date: new Date().toISOString()
        });
        localStorage.setItem('savedTeams', JSON.stringify(savedTeams));
        showNotification('Team saved!');
    }
}

// Load saved teams
function loadSavedTeams() {
    const container = document.getElementById('savedTeamsContainer');
    const list = document.getElementById('savedTeamsList');
    
    if (!container || !list) return;
    
    const savedTeams = JSON.parse(localStorage.getItem('savedTeams') || '[]');
    
    if (savedTeams.length === 0) {
        showNotification('No saved teams found!');
        return;
    }
    
    container.style.display = 'block';
    list.innerHTML = '';
    
    savedTeams.forEach((team, index) => {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'saved-team-item';
        teamDiv.innerHTML = `
            <h4>${team.name}</h4>
            <p>${team.pokemonIds.length} Pokémon</p>
            <p style="font-size: 0.6rem; color: #666;">${new Date(team.date).toLocaleDateString()}</p>
            <div class="saved-team-actions">
                <button class="reload-button" style="font-size: 0.6rem; padding: 5px 10px;" onclick="loadTeam(${index})">Load</button>
                <button class="reload-button" style="font-size: 0.6rem; padding: 5px 10px;" onclick="deleteTeam(${index})">Delete</button>
            </div>
        `;
        list.appendChild(teamDiv);
    });
}

function loadTeam(index) {
    const savedTeams = JSON.parse(localStorage.getItem('savedTeams') || '[]');
    const team = savedTeams[index];
    
    if (team && team.pokemonIds.length > 0) {
        // Redirect to team page with IDs (would need backend support)
        // For now, just show notification
        showNotification(`Loading team: ${team.name}`);
        // In a full implementation, you'd pass team IDs to generate the team
    }
}

function deleteTeam(index) {
    const savedTeams = JSON.parse(localStorage.getItem('savedTeams') || '[]');
    savedTeams.splice(index, 1);
    localStorage.setItem('savedTeams', JSON.stringify(savedTeams));
    loadSavedTeams();
    showNotification('Team deleted!');
}

// Share team
function shareTeam() {
    const teamCards = document.querySelectorAll('.team-card');
    if (teamCards.length === 0) {
        showNotification('No team to share!');
        return;
    }
    
    const teamIds = [];
    teamCards.forEach(card => {
        const pokemonId = parseInt(card.getAttribute('onclick')?.match(/\d+/)?.[0]);
        if (pokemonId) teamIds.push(pokemonId);
    });
    
    const teamUrl = `${window.location.origin}/team?ids=${teamIds.join(',')}`;
    copyToClipboard(teamUrl);
    showNotification('Team link copied! Share it with others!');
}

// Close modals when clicking outside
window.onclick = function(event) {
    const statsModal = document.getElementById('statsModal');
    const spriteModal = document.getElementById('spriteModal');
    const typeModal = document.getElementById('typeEffectivenessModal');
    const movesModal = document.getElementById('movesModal');
    const abilityModal = document.getElementById('abilityModal');
    const comparisonModal = document.getElementById('comparisonModal');
    const shortcutsModal = document.getElementById('keyboardShortcutsModal');
    
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
    if (event.target == shortcutsModal) {
        closeKeyboardShortcutsModal();
    }
};
