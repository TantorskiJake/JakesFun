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

// Close modals when clicking outside
window.onclick = function(event) {
    const statsModal = document.getElementById('statsModal');
    const spriteModal = document.getElementById('spriteModal');
    const typeModal = document.getElementById('typeEffectivenessModal');
    
    if (event.target == statsModal) {
        closeStatsModal();
    }
    if (event.target == spriteModal) {
        closeSpriteModal();
    }
    if (event.target == typeModal) {
        closeTypeEffectivenessModal();
    }
};
