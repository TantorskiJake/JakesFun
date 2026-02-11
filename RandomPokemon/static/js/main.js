// Global variables
let currentPokemon = null;
let currentSpriteType = 'front';
const MODAL_IDS = [
    'statsModal',
    'spriteModal',
    'typeEffectivenessModal',
    'movesModal',
    'abilityModal',
    'comparisonModal',
    'keyboardShortcutsModal',
    'teamCoverageModal'
];
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

let activeModal = null;
let lastFocusedElement = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dark mode
    initDarkMode();
    initAccessibilityEnhancements();
    
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
            // Play Pokémon cry
            playPokemonCry(currentPokemon.id);
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
                searchInput.setAttribute('aria-expanded', 'false');
            }, 200);
        });
    }
});

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    if (e.key === 'Escape') {
        closeActiveModal();
        return;
    }

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
        case '?':
            e.preventDefault();
            openKeyboardShortcutsModal();
            break;
    }
}

function initAccessibilityEnhancements() {
    setupModalAccessibility();
    setupInteractiveAccessibility();
    document.addEventListener('keydown', handleModalKeydown, true);
}

function setupModalAccessibility() {
    MODAL_IDS.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-hidden', isModalOpen(modal) ? 'false' : 'true');

        const modalTitle = modal.querySelector('[id$="Title"], h1, h2, h3');
        if (modalTitle) {
            if (!modalTitle.id) {
                modalTitle.id = `${modalId}Label`;
            }
            modal.setAttribute('aria-labelledby', modalTitle.id);
        }

        if (!modal.hasAttribute('tabindex')) {
            modal.setAttribute('tabindex', '-1');
        }

        const closeControls = modal.querySelectorAll('.close, [data-modal-close]');
        closeControls.forEach(control => {
            if (!control.hasAttribute('aria-label')) {
                control.setAttribute('aria-label', 'Close dialog');
            }
            if (!control.matches('button, a, input, select, textarea')) {
                control.setAttribute('role', 'button');
                control.setAttribute('tabindex', '0');
            }
            if (!control.dataset.a11yKeyHandler) {
                control.addEventListener('keydown', function(event) {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        closeModal(modalId);
                    }
                });
                control.dataset.a11yKeyHandler = 'true';
            }
        });
    });
}

function setupInteractiveAccessibility() {
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    if (searchInput) {
        searchInput.setAttribute('aria-autocomplete', 'list');
        searchInput.setAttribute('aria-expanded', 'false');
        if (searchSuggestions && searchSuggestions.id) {
            searchInput.setAttribute('aria-controls', searchSuggestions.id);
        }
    }
    if (searchSuggestions) {
        searchSuggestions.setAttribute('role', 'listbox');
    }

    const advancedPanel = document.getElementById('advancedSearchPanel');
    if (advancedPanel) {
        advancedPanel.setAttribute('aria-hidden', window.getComputedStyle(advancedPanel).display === 'none' ? 'true' : 'false');
    }

    const advancedToggle = document.querySelector('[onclick="toggleAdvancedSearch()"]');
    if (advancedToggle) {
        const isExpanded = !advancedPanel || window.getComputedStyle(advancedPanel).display !== 'none';
        advancedToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        advancedToggle.setAttribute('aria-controls', 'advancedSearchPanel');
    }
}

function isModalOpen(modal) {
    if (!modal) return false;
    return window.getComputedStyle(modal).display !== 'none';
}

function isElementVisible(element) {
    if (!element || !(element instanceof HTMLElement)) return false;
    return element.offsetParent !== null || element === document.activeElement;
}

function getFocusableElements(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isElementVisible);
}

function focusModalTarget(modal) {
    if (!modal) return;

    const autofocusTarget = modal.querySelector('[autofocus], [data-modal-initial-focus]');
    if (autofocusTarget && autofocusTarget instanceof HTMLElement && isElementVisible(autofocusTarget)) {
        autofocusTarget.focus();
        return;
    }

    const focusableElements = getFocusableElements(modal);
    const firstFocusable = focusableElements[0];
    if (firstFocusable && firstFocusable instanceof HTMLElement) {
        firstFocusable.focus();
    } else {
        modal.focus();
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (activeModal && activeModal !== modal) {
        activeModal.setAttribute('aria-hidden', 'true');
    }

    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    activeModal = modal;

    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');

    document.body.classList.add('modal-open');
    setTimeout(() => focusModalTarget(modal), 0);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');

    if (activeModal === modal) {
        activeModal = null;
        document.body.classList.remove('modal-open');

        if (lastFocusedElement && isElementVisible(lastFocusedElement)) {
            lastFocusedElement.focus();
        }
        lastFocusedElement = null;
    }
}

function closeActiveModal() {
    if (activeModal && activeModal.id) {
        closeModal(activeModal.id);
        return;
    }

    MODAL_IDS.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal && isModalOpen(modal)) {
            closeModal(modalId);
        }
    });
}

function handleModalKeydown(event) {
    if (!activeModal || !isModalOpen(activeModal)) return;

    if (event.key === 'Escape') {
        event.preventDefault();
        closeModal(activeModal.id);
        return;
    }

    if (event.key !== 'Tab') return;

    const focusableElements = getFocusableElements(activeModal);
    if (focusableElements.length === 0) {
        event.preventDefault();
        activeModal.focus();
        return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
    } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
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
    
    openModal('statsModal');
}

// Close stats modal
function closeStatsModal() {
    closeModal('statsModal');
}

// Open sprite modal
function openSpriteModal() {
    if (!currentPokemon) return;
    
    const title = document.getElementById('spriteModalTitle');
    const img = document.getElementById('spriteModalImg');
    
    if (title) title.textContent = `${currentPokemon.name} Sprites`;
    
    // Show shiny sprite in modal
    if (img && currentPokemon.shiny_image_url) {
        img.src = currentPokemon.shiny_image_url;
    }
    
    // Play cry sound if available
    if (currentPokemon) {
        playPokemonCry(currentPokemon.id);
    }
    
    openModal('spriteModal');
}

// Close sprite modal
function closeSpriteModal() {
    closeModal('spriteModal');
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
        const favoriteEntry = {
            ...currentPokemon,
            dateAdded: Date.now()
        };
        favorites.push(favoriteEntry);
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
        btn.setAttribute('aria-pressed', isFavorite ? 'true' : 'false');
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
        image_url: pokemon.image_url,
        dateAdded: Date.now()
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
        spinner.setAttribute('aria-busy', 'true');
        spinner.setAttribute('aria-live', 'polite');
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
        spinner.setAttribute('aria-busy', 'false');
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
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');
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
function loadFavorites(sortBy = null) {
    const container = document.getElementById('favoritesContainer');
    const emptyState = document.getElementById('emptyFavorites');
    
    if (!container) return;
    
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (favorites.length === 0) {
        container.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    // Sort favorites
    if (sortBy) {
        favorites = sortPokemonList(favorites, sortBy);
    } else {
        const sortSelect = document.getElementById('favoritesSort');
        if (sortSelect) {
            favorites = sortPokemonList(favorites, sortSelect.value);
        }
    }
    
    if (emptyState) emptyState.style.display = 'none';
    container.innerHTML = '';
    
    favorites.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.setAttribute('role', 'link');
        card.setAttribute('tabindex', '0');
        
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
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                viewPokemon(pokemon.id);
            }
        });
        
        container.appendChild(card);
    });
}

// Sort favorites
function sortFavorites() {
    const sortSelect = document.getElementById('favoritesSort');
    if (sortSelect) {
        loadFavorites(sortSelect.value);
    }
}

// Sort Pokémon list
function sortPokemonList(list, sortBy) {
    const sorted = [...list];
    
    switch(sortBy) {
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            sorted.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'id':
            sorted.sort((a, b) => a.id - b.id);
            break;
        case 'id-desc':
            sorted.sort((a, b) => b.id - a.id);
            break;
        case 'date':
            sorted.sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));
            break;
        case 'date-old':
            sorted.sort((a, b) => (a.dateAdded || 0) - (b.dateAdded || 0));
            break;
    }
    
    return sorted;
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
    
    openModal('typeEffectivenessModal');
}

// Close type effectiveness modal
function closeTypeEffectivenessModal() {
    closeModal('typeEffectivenessModal');
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
        button.setAttribute('aria-pressed', isDark ? 'true' : 'false');
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
function loadHistory(sortBy = null) {
    const container = document.getElementById('historyContainer');
    const emptyState = document.getElementById('emptyHistory');
    
    if (!container) return;
    
    let history = JSON.parse(localStorage.getItem('pokemonHistory') || '[]');
    
    if (history.length === 0) {
        container.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    // Sort history
    if (sortBy) {
        history = sortPokemonList(history, sortBy);
    } else {
        const sortSelect = document.getElementById('historySort');
        if (sortSelect) {
            history = sortPokemonList(history, sortSelect.value);
        }
    }
    
    if (emptyState) emptyState.style.display = 'none';
    container.innerHTML = '';
    
    history.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.setAttribute('role', 'link');
        card.setAttribute('tabindex', '0');
        
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
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                viewPokemon(pokemon.id);
            }
        });
        
        container.appendChild(card);
    });
}

// Sort history
function sortHistory() {
    const sortSelect = document.getElementById('historySort');
    if (sortSelect) {
        loadHistory(sortSelect.value);
    }
}

// Global variables for moves modal
let allMovesData = [];
let filteredMoves = [];
let currentMovesPage = 1;
const movesPerPage = 20;

// Open moves modal
function openMovesModal() {
    if (!currentPokemon || !currentPokemon.moves) return;
    
    const title = document.getElementById('movesModalTitle');
    const container = document.getElementById('movesContainer');
    
    if (title) title.textContent = `${currentPokemon.name} Moves (${currentPokemon.moves.length})`;
    
    // Reset pagination
    currentMovesPage = 1;
    allMovesData = [];
    filteredMoves = [];
    
    if (container) {
        container.innerHTML = `
            <div class="moves-filters">
                <input type="text" id="movesSearchInput" class="search-input" placeholder="Search moves..." oninput="filterMoves()">
                <select id="movesTypeFilter" class="filter-select" onchange="filterMoves()">
                    <option value="">All Types</option>
                    <option value="normal">Normal</option>
                    <option value="fire">Fire</option>
                    <option value="water">Water</option>
                    <option value="electric">Electric</option>
                    <option value="grass">Grass</option>
                    <option value="ice">Ice</option>
                    <option value="fighting">Fighting</option>
                    <option value="poison">Poison</option>
                    <option value="ground">Ground</option>
                    <option value="flying">Flying</option>
                    <option value="psychic">Psychic</option>
                    <option value="bug">Bug</option>
                    <option value="rock">Rock</option>
                    <option value="ghost">Ghost</option>
                    <option value="dragon">Dragon</option>
                    <option value="dark">Dark</option>
                    <option value="steel">Steel</option>
                    <option value="fairy">Fairy</option>
                </select>
                <select id="movesClassFilter" class="filter-select" onchange="filterMoves()">
                    <option value="">All Classes</option>
                    <option value="physical">Physical</option>
                    <option value="special">Special</option>
                    <option value="status">Status</option>
                </select>
            </div>
            <div class="loading-moves"><p>Loading move details... (${currentPokemon.moves.length} moves)</p><div class="progress-bar-container"><div class="progress-bar-fill" id="movesProgress" style="width: 0%;"></div></div></div>
            <div id="movesList"></div>
            <div id="movesPagination"></div>
        `;
        
        const movesProgressBar = document.getElementById('movesProgress');
        let loadedMoves = 0;
        const totalMoves = currentPokemon.moves.length;
        
        // Fetch move details for ALL moves
        const movePromises = currentPokemon.moves.map((move, index) => {
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
            allMovesData = moves;
            filteredMoves = moves;
            setTimeout(() => {
                const loadingMoves = document.querySelector('.loading-moves');
                if (loadingMoves) {
                    loadingMoves.style.display = 'none';
                }
                renderMoves();
            }, 200);
        });
    }
    
    openModal('movesModal');
}

// Filter moves based on search, type, and class
function filterMoves() {
    const searchInput = document.getElementById('movesSearchInput');
    const typeFilter = document.getElementById('movesTypeFilter');
    const classFilter = document.getElementById('movesClassFilter');
    
    const searchTerm = (searchInput?.value || '').toLowerCase();
    const selectedType = typeFilter?.value || '';
    const selectedClass = classFilter?.value || '';
    
    filteredMoves = allMovesData.filter(move => {
        const matchesSearch = !searchTerm || move.name.toLowerCase().includes(searchTerm) || 
                             move.description.toLowerCase().includes(searchTerm);
        const matchesType = !selectedType || move.type === selectedType;
        const matchesClass = !selectedClass || move.damageClass === selectedClass;
        
        return matchesSearch && matchesType && matchesClass;
    });
    
    currentMovesPage = 1;
    renderMoves();
}

// Render moves with pagination
function renderMoves() {
    const movesList = document.getElementById('movesList');
    const pagination = document.getElementById('movesPagination');
    
    if (!movesList) return;
    
    const totalPages = Math.ceil(filteredMoves.length / movesPerPage);
    const startIndex = (currentMovesPage - 1) * movesPerPage;
    const endIndex = startIndex + movesPerPage;
    const currentMoves = filteredMoves.slice(startIndex, endIndex);
    
    movesList.innerHTML = '';
    
    if (currentMoves.length === 0) {
        movesList.innerHTML = '<p class="no-results">No moves found matching your filters.</p>';
    } else {
        currentMoves.forEach(move => {
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
            movesList.appendChild(moveDiv);
        });
    }
    
    // Render pagination
    if (pagination) {
        if (totalPages > 1) {
            pagination.innerHTML = `
                <div class="pagination">
                    <button class="pagination-btn" onclick="changeMovesPage(${currentMovesPage - 1})" ${currentMovesPage === 1 ? 'disabled' : ''}>Previous</button>
                    <span class="pagination-info">Page ${currentMovesPage} of ${totalPages} (${filteredMoves.length} moves)</span>
                    <button class="pagination-btn" onclick="changeMovesPage(${currentMovesPage + 1})" ${currentMovesPage === totalPages ? 'disabled' : ''}>Next</button>
                </div>
            `;
        } else {
            pagination.innerHTML = `<div class="pagination-info">Showing ${filteredMoves.length} move${filteredMoves.length !== 1 ? 's' : ''}</div>`;
        }
    }
}

// Change moves page
function changeMovesPage(page) {
    const totalPages = Math.ceil(filteredMoves.length / movesPerPage);
    if (page >= 1 && page <= totalPages) {
        currentMovesPage = page;
        renderMoves();
        document.getElementById('movesList').scrollTop = 0;
    }
}

// Close moves modal
function closeMovesModal() {
    closeModal('movesModal');
}

// Show ability details
function showAbilityDetails(abilityUrl, abilityName) {
    const title = document.getElementById('abilityModalTitle');
    const container = document.getElementById('abilityContainer');
    
    if (title) title.textContent = abilityName.charAt(0).toUpperCase() + abilityName.slice(1);
    
    if (container) {
        container.innerHTML = '<p>Loading ability details...</p>';
    }
    
    openModal('abilityModal');
    
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
    closeModal('abilityModal');
}

// Search autocomplete
function handleSearchInput(e) {
    const query = e.target.value.trim();
    const suggestionsDiv = document.getElementById('searchSuggestions');
    
    if (!suggestionsDiv) return;
    
    if (query.length < 2) {
        suggestionsDiv.style.display = 'none';
        document.getElementById('searchInput')?.setAttribute('aria-expanded', 'false');
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
                    item.setAttribute('role', 'option');
                    item.setAttribute('tabindex', '0');
                    item.onclick = () => {
                        document.getElementById('searchInput').value = suggestion;
                        suggestionsDiv.style.display = 'none';
                        document.getElementById('searchInput')?.setAttribute('aria-expanded', 'false');
                        document.querySelector('.search-form').submit();
                    };
                    item.onkeydown = (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            item.click();
                        }
                    };
                    suggestionsDiv.appendChild(item);
                });
                suggestionsDiv.style.display = 'block';
                document.getElementById('searchInput')?.setAttribute('aria-expanded', 'true');
            } else {
                suggestionsDiv.style.display = 'none';
                document.getElementById('searchInput')?.setAttribute('aria-expanded', 'false');
            }
        })
        .catch(() => {
            suggestionsDiv.style.display = 'none';
            document.getElementById('searchInput')?.setAttribute('aria-expanded', 'false');
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

// Get random Pokémon by generation
function getRandomByGeneration() {
    const generationSelect = document.getElementById('generationSelect');
    const generation = generationSelect?.value || '';
    
    showLoading(`Finding random Pokémon${generation ? ` from Generation ${generation}` : ''}...`, [
        'Selecting random Pokémon',
        'Fetching data',
        'Loading details'
    ]);
    
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 15;
        const stepIndex = Math.floor(progress / 33);
        updateLoadingProgress(progress, stepIndex);
        
        if (progress >= 90) {
            clearInterval(progressInterval);
        }
    }, 100);
    
    const url = generation ? `/random?generation=${generation}` : '/random';
    
    window.location.href = url;
}

// Comparison feature
let comparisonPokemon2 = null;

function openComparisonModal() {
    if (!currentPokemon) return;
    
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
    
    openModal('comparisonModal');
}

function closeComparisonModal() {
    closeModal('comparisonModal');
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
    openModal('keyboardShortcutsModal');
}

function closeKeyboardShortcutsModal() {
    closeModal('keyboardShortcutsModal');
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

// Play Pokémon cry
function playPokemonCry(pokemonId) {
    const audio = document.getElementById('cryAudio');
    if (!audio) return;
    
    // PokeAPI cry URL format
    const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemonId}.ogg`;
    
    audio.src = cryUrl;
    audio.volume = 0.3; // Lower volume
    
    audio.play().catch(err => {
        // Silently fail if audio can't play (browser restrictions, missing file, etc.)
        console.log('Could not play Pokémon cry:', err);
    });
}

// Toggle advanced search panel
function toggleAdvancedSearch() {
    const panel = document.getElementById('advancedSearchPanel');
    if (panel) {
        const isHidden = window.getComputedStyle(panel).display === 'none';
        panel.style.display = isHidden ? 'block' : 'none';
        const isExpanded = isHidden;
        panel.setAttribute('aria-hidden', isExpanded ? 'false' : 'true');
        const toggleButton = document.querySelector('[onclick="toggleAdvancedSearch()"]');
        if (toggleButton) {
            toggleButton.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
            toggleButton.setAttribute('aria-controls', 'advancedSearchPanel');
        }
    }
}

// Perform advanced search
async function performAdvancedSearch() {
    const ability = document.getElementById('abilityFilter')?.value.trim().toLowerCase();
    const move = document.getElementById('moveFilter')?.value.trim().toLowerCase();
    const hpMin = parseInt(document.getElementById('hpMin')?.value) || 0;
    const hpMax = parseInt(document.getElementById('hpMax')?.value) || 255;
    const atkMin = parseInt(document.getElementById('atkMin')?.value) || 0;
    const atkMax = parseInt(document.getElementById('atkMax')?.value) || 255;
    const defMin = parseInt(document.getElementById('defMin')?.value) || 0;
    const defMax = parseInt(document.getElementById('defMax')?.value) || 255;
    const speedMin = parseInt(document.getElementById('speedMin')?.value) || 0;
    const speedMax = parseInt(document.getElementById('speedMax')?.value) || 255;
    
    showLoading('Searching Pokémon...', ['Loading search criteria', 'Fetching data', 'Filtering results']);
    
    // Search through Pokémon IDs 1-1025
    const matches = [];
    const searchLimit = 50; // Limit search to avoid too many API calls
    let checked = 0;
    
    for (let id = 1; id <= 1025 && matches.length < 10 && checked < searchLimit; id++) {
        checked++;
        try {
            const response = await fetch(`/api/pokemon/${id}`);
            if (!response.ok) continue;
            
            const pokemon = await response.json();
            let match = true;
            
            // Check ability
            if (ability && match) {
                const hasAbility = pokemon.abilities?.some(a => 
                    a.name.toLowerCase().includes(ability)
                );
                if (!hasAbility) match = false;
            }
            
            // Check move
            if (move && match) {
                const hasMove = pokemon.moves?.some(m => 
                    m.name.toLowerCase().includes(move)
                );
                if (!hasMove) match = false;
            }
            
            // Check stats
            if (match && pokemon.stats) {
                const hp = pokemon.stats.hp || 0;
                const attack = pokemon.stats.attack || 0;
                const defense = pokemon.stats.defense || 0;
                const speed = pokemon.stats.speed || 0;
                
                if (hp < hpMin || hp > hpMax) match = false;
                if (attack < atkMin || attack > atkMax) match = false;
                if (defense < defMin || defense > defMax) match = false;
                if (speed < speedMin || speed > speedMax) match = false;
            }
            
            if (match) {
                matches.push(pokemon);
            }
        } catch (err) {
            console.error('Error checking Pokémon:', err);
        }
    }
    
    hideLoading();
    
    if (matches.length > 0) {
        // Show first match
        window.location.href = `/pokemon/${matches[0].id}`;
        if (matches.length > 1) {
            setTimeout(() => {
                showNotification(`Found ${matches.length} matches! Showing first result.`);
            }, 500);
        }
    } else {
        showNotification('No Pokémon found matching your criteria. Try adjusting your filters.');
    }
}

// Clear advanced search
function clearAdvancedSearch() {
    document.getElementById('abilityFilter').value = '';
    document.getElementById('moveFilter').value = '';
    document.getElementById('hpMin').value = '';
    document.getElementById('hpMax').value = '';
    document.getElementById('atkMin').value = '';
    document.getElementById('atkMax').value = '';
    document.getElementById('defMin').value = '';
    document.getElementById('defMax').value = '';
    document.getElementById('speedMin').value = '';
    document.getElementById('speedMax').value = '';
}

// Handle advanced search form submission
function handleAdvancedSearch(event) {
    const advancedPanel = document.getElementById('advancedSearchPanel');
    const hasAdvancedFilters = advancedPanel && advancedPanel.style.display !== 'none' &&
        (document.getElementById('abilityFilter')?.value ||
         document.getElementById('moveFilter')?.value ||
         document.getElementById('hpMin')?.value ||
         document.getElementById('atkMin')?.value ||
         document.getElementById('defMin')?.value ||
         document.getElementById('speedMin')?.value);
    
    if (hasAdvancedFilters) {
        event.preventDefault();
        performAdvancedSearch();
        return false;
    }
    
    return true;
}
