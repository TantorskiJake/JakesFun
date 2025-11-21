/**
 * Enhanced Browser UI - Modern, visual interface for Oregon Trail
 */
import { VisualUI } from './visual-ui.js';

export class BrowserUI {
    constructor() {
        this.isNode = false;
        this.outputElement = document.getElementById('game-output');
        this.promptContainer = document.getElementById('prompt-container');
        this.inputContainer = document.getElementById('input-container');
        this.textInput = document.getElementById('text-input');
        this.submitBtn = document.getElementById('submit-btn');
        this.choiceContainer = document.getElementById('choice-container');
        this.loadingMessage = document.getElementById('loading-message');
        this.visualUI = new VisualUI();
        
        // New layout elements
        this.currentDateEl = document.getElementById('current-date');
        this.currentLocationEl = document.getElementById('current-location');
        this.weatherDisplayEl = document.getElementById('weather-display');
        this.terrainDisplayEl = document.getElementById('terrain-display');
        this.partyContainerEl = document.getElementById('party-container');
        this.quickStatsEl = document.getElementById('quick-stats');
        this.inventoryContainerEl = document.getElementById('inventory-container');
        this.wagonContainerEl = document.getElementById('wagon-container');
        this.settingsContainerEl = document.getElementById('settings-container');
        this.trailProgressContainerEl = document.getElementById('trail-progress-container');
        this.travelSceneEl = document.getElementById('travel-scene');
        this.mainContentEl = document.getElementById('main-content');
        
        // Modals
        this.eventModal = document.getElementById('event-modal');
        this.storeModal = document.getElementById('store-modal');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Store pending promises for modals
        this.pendingEventResolve = null;
        this.pendingStoreResolve = null;
        
        // Modal close buttons - only close, don't resolve (user must make a choice)
        const closeButtons = document.querySelectorAll('.modal-close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Don't allow closing event modal without making a choice
                // Store modal can be closed by clicking done button
            });
        });
        
        // Close modal on background click - disabled for event modal (must make choice)
        if (this.storeModal) {
            this.storeModal.addEventListener('click', (e) => {
                if (e.target === this.storeModal) {
                    // Store modal can be closed by clicking done, not background
                }
            });
        }
        
        // Keyboard navigation - Escape key disabled for event modal (must make choice)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Only allow escape for store modal, not event modal
                if (this.storeModal && this.storeModal.style.display === 'flex') {
                    // Store modal should use done button
                }
            }
        });
        
        // Focus input when shown
        if (this.textInput) {
            this.textInput.addEventListener('focus', () => {
                this.textInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        }
    }
    
    async prompt(question) {
        return new Promise((resolve) => {
            this.showPrompt(question);
            this.showTextInput();
            this.hideChoices();
            
            const handleSubmit = (e) => {
                e?.preventDefault();
                const answer = this.textInput.value.trim();
                this.textInput.value = '';
                this.hideTextInput();
                this.hidePrompt();
                this.submitBtn.onclick = null;
                this.textInput.onkeypress = null;
                resolve(answer);
            };
            
            const handleKeyPress = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(e);
                }
            };
            
            this.submitBtn.onclick = handleSubmit;
            this.textInput.onkeypress = handleKeyPress;
            
            setTimeout(() => {
                if (this.textInput) {
                    this.textInput.focus();
                }
            }, 100);
        });
    }
    
    async promptNumber(question, min = null, max = null) {
        while (true) {
            const answer = await this.prompt(question);
            const num = parseInt(answer, 10);
            
            if (isNaN(num)) {
                this.printLine('Please enter a valid number.', 'warning');
                continue;
            }
            
            if (min !== null && num < min) {
                this.printLine(`Please enter a number at least ${min}.`, 'warning');
                continue;
            }
            
            if (max !== null && num > max) {
                this.printLine(`Please enter a number no more than ${max}.`, 'warning');
                continue;
            }
            
            return num;
        }
    }
    
    async promptChoice(question, choices) {
        return new Promise((resolve) => {
            console.log(`[UI] promptChoice called with question: "${question}", choices:`, choices);
            
            // Ensure choice container exists
            if (!this.choiceContainer) {
                console.error(`[UI] ERROR: choiceContainer is null! Attempting to find it...`);
                this.choiceContainer = document.getElementById('choice-container');
                if (!this.choiceContainer) {
                    console.error(`[UI] FATAL: Cannot find choice-container element!`);
                    // Fallback: try to create it
                    const actionBar = document.querySelector('.action-bar');
                    if (actionBar) {
                        this.choiceContainer = document.createElement('div');
                        this.choiceContainer.id = 'choice-container';
                        this.choiceContainer.className = 'choice-container';
                        actionBar.appendChild(this.choiceContainer);
                        console.log(`[UI] Created choice-container element as fallback`);
                    }
                }
            }
            
            this.showPrompt(question);
            this.hideTextInput();
            this.showChoices(choices);
            
            // Clear any existing buttons first
            if (this.choiceContainer) {
                this.choiceContainer.innerHTML = '';
            }
            
            const handleChoice = (index) => {
                console.log(`[UI] Choice ${index} selected: "${choices[index]}"`);
                this.hideChoices();
                this.hidePrompt();
                choices.forEach((_, i) => {
                    const btn = document.getElementById(`choice-${i}`);
                    if (btn) {
                        btn.onclick = null;
                    }
                });
                resolve(index);
            };
            
            // Create and append buttons
            choices.forEach((choice, index) => {
                const btn = document.createElement('button');
                btn.id = `choice-${index}`;
                btn.className = 'choice-btn';
                btn.textContent = `${index + 1}. ${choice}`;
                btn.onclick = () => handleChoice(index);
                if (this.choiceContainer) {
                    this.choiceContainer.appendChild(btn);
                    console.log(`[UI] Created choice button ${index}: "${choice}"`);
                } else {
                    console.error(`[UI] ERROR: choiceContainer is still null after fallback!`);
                }
            });
            
            // Verify buttons were created and visible
            setTimeout(() => {
                const buttons = this.choiceContainer?.querySelectorAll('.choice-btn');
                console.log(`[UI] Created ${buttons?.length || 0} choice buttons, expected ${choices.length}`);
                console.log(`[UI] Choice container display: ${this.choiceContainer?.style.display}, computed: ${window.getComputedStyle(this.choiceContainer || document.body).display}`);
                if (buttons && buttons.length !== choices.length) {
                    console.error(`[UI] ERROR: Button count mismatch!`);
                }
                if (buttons && buttons.length > 0) {
                    console.log(`[UI] First button text: "${buttons[0].textContent}"`);
                }
            }, 100);
        });
    }
    
    print(text) {
        if (this.outputElement) {
            const lines = text.split('\n');
            lines.forEach((lineText, index) => {
                if (lineText || index < lines.length - 1) {
                    const line = document.createElement('div');
                    line.className = 'line';
                    line.textContent = lineText;
                    this.outputElement.appendChild(line);
                }
            });
            this.scrollToBottom();
        }
    }
    
    printLine(text = '', className = '') {
        if (this.outputElement) {
            const line = document.createElement('div');
            line.className = `line ${className}`;
            
            if (text.includes('═══')) {
                line.className += ' header';
            } else if (text.startsWith('===')) {
                line.className += ' section';
            } else if (text.includes('DEAD') || text.includes('died') || text.includes('GAME OVER') || text.includes('❌')) {
                line.className += ' warning';
            } else if (text.includes('successfully') || text.includes('Congratulations') || text.includes('✅') || text.includes('✓')) {
                line.className += ' success';
            } else if (text.includes('Location:') || text.includes('Date:') || text.includes('⚠️')) {
                line.className += ' info';
            }
            
            line.innerHTML = text;
            this.outputElement.appendChild(line);
            this.scrollToBottom();
        }
    }
    
    clear() {
        if (this.outputElement) {
            this.outputElement.innerHTML = '';
        }
    }
    
    showPrompt(text) {
        if (this.promptContainer) {
            this.promptContainer.textContent = text;
            this.promptContainer.style.display = 'block';
        }
    }
    
    hidePrompt() {
        if (this.promptContainer) {
            this.promptContainer.textContent = '';
            this.promptContainer.style.display = 'none';
        }
    }
    
    showTextInput() {
        if (this.inputContainer) {
            this.inputContainer.style.display = 'flex';
        }
        if (this.loadingMessage) {
            this.loadingMessage.style.display = 'none';
        }
    }
    
    hideTextInput() {
        if (this.inputContainer) {
            this.inputContainer.style.display = 'none';
        }
    }
    
    showChoices(choices) {
        if (this.choiceContainer) {
            // Force display with !important equivalent by setting inline style
            this.choiceContainer.style.display = 'grid';
            this.choiceContainer.style.visibility = 'visible';
            this.choiceContainer.style.opacity = '1';
            this.choiceContainer.innerHTML = '';
            console.log(`[UI] showChoices called - container display: ${this.choiceContainer.style.display}, visibility: ${this.choiceContainer.style.visibility}`);
            // Scroll into view to ensure it's visible
            setTimeout(() => {
                if (this.choiceContainer) {
                    this.choiceContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 50);
        } else {
            console.error(`[UI] ERROR: choiceContainer is null in showChoices!`);
        }
        if (this.loadingMessage) {
            this.loadingMessage.style.display = 'none';
        }
    }
    
    hideChoices() {
        if (this.choiceContainer) {
            this.choiceContainer.style.display = 'none';
            this.choiceContainer.innerHTML = '';
        }
    }
    
    scrollToBottom() {
        if (this.outputElement) {
            this.outputElement.scrollTop = this.outputElement.scrollHeight;
        }
    }
    
    displayGameState(gameState) {
        const { date, locations, party, inventory, milesTraveled, pace, rations, weather, season } = gameState;
        
        // Only log if this is a significant update (not just a refresh)
        const avgHealth = party.getAverageHealth();
        if (!this._lastDisplayedHealth || Math.abs(avgHealth - this._lastDisplayedHealth) > 1) {
            console.log(`[UI] displayGameState called - average health: ${avgHealth}%`);
            this._lastDisplayedHealth = avgHealth;
        }
        
        // Update header
        this.updateHeader(date, locations, weather, season, locations.getTerrain());
        
        // Update trail progress - pass gameState to get accurate miles
        this.updateTrailProgress(locations, gameState);
        
        // Update party
        this.updateParty(party);
        
        // Update quick stats
        this.updateQuickStats(party);
        
        // Update inventory
        this.updateInventory(inventory);
        
        // Update wagon
        this.updateWagon(inventory);
        
        // Update settings
        this.updateSettings(pace, rations);
        
        // Clear main content for new messages
        this.clear();
    }
    
    updateHeader(date, locations, weather, season, terrain) {
        const dateStr = date.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        if (this.currentDateEl) {
            this.currentDateEl.textContent = dateStr;
        }
        
        if (this.currentLocationEl) {
            this.currentLocationEl.textContent = locations.getLocationName();
        }
        
        const weatherIcons = {
            'clear': '☀️',
            'rain': '🌧️',
            'storm': '⛈️',
            'snow': '❄️'
        };
        
        const terrainIcons = {
            'plains': '🌾',
            'prairie': '🌾',
            'foothills': '⛰️',
            'mountains': '🏔️',
            'desert': '🏜️',
            'forest': '🌲'
        };
        
        if (this.weatherDisplayEl) {
            const icon = this.weatherDisplayEl.querySelector('.weather-icon');
            const text = this.weatherDisplayEl.querySelector('.weather-text');
            if (icon) icon.textContent = weatherIcons[weather] || '🌤️';
            if (text) text.textContent = weather.charAt(0).toUpperCase() + weather.slice(1);
        }
        
        if (this.terrainDisplayEl) {
            const icon = this.terrainDisplayEl.querySelector('.terrain-icon');
            const text = this.terrainDisplayEl.querySelector('.terrain-text');
            if (icon) icon.textContent = terrainIcons[terrain.type] || '🗺️';
            if (text) text.textContent = terrain.description;
        }
    }
    
    updateTrailProgress(locations, gameState = null) {
        if (!this.trailProgressContainerEl) {
            return;
        }
        
        // Get actual miles traveled from locations
        // Access totalMilesTraveled directly to ensure we get the current value
        const currentMiles = locations.totalMilesTraveled !== undefined ? locations.totalMilesTraveled : locations.getDistanceTraveled();
        const totalMiles = locations.getTotalDistance();
        const percentage = totalMiles > 0 ? (currentMiles / totalMiles) * 100 : 0;
        const currentLoc = locations.getLocationName();
        
        // Ensure we have valid numbers
        const displayMiles = isNaN(currentMiles) ? 0 : Math.round(currentMiles);
        const displayTotal = isNaN(totalMiles) ? 2040 : totalMiles;
        const displayPercentage = isNaN(percentage) ? 0 : Math.max(0, Math.min(100, percentage));
        
        // Only log if values actually changed (reduce console spam)
        const lastMiles = this._lastTrailMiles || 0;
        if (Math.abs(displayMiles - lastMiles) > 0.5) {
            console.log(`[TRAIL] Progress update: ${displayMiles} / ${displayTotal} miles (${displayPercentage.toFixed(2)}%)`);
            this._lastTrailMiles = displayMiles;
        }
        
        this.trailProgressContainerEl.innerHTML = `
            <div class="trail-header">
                <h3 class="trail-title">🗺️ Trail Progress</h3>
                <span class="location-name">📍 ${currentLoc}</span>
            </div>
            <div class="trail-bar-container">
                <div class="trail-bar-fill" style="width: ${displayPercentage}%"></div>
                <div class="trail-marker" style="left: ${displayPercentage}%">🚛</div>
            </div>
            <div class="trail-stats">
                <span>${displayMiles} / ${displayTotal} miles</span>
                <span>${Math.round(100 - displayPercentage)}% remaining</span>
            </div>
        `;
    }
    
    updateParty(party) {
        if (!this.partyContainerEl) return;
        
        console.log(`[UI] updateParty called - clearing and rebuilding party display`);
        this.partyContainerEl.innerHTML = '';
        
        // Get fresh member data directly from party object, not from getStatus()
        const aliveMembers = party.getAliveMembers();
        const allMembers = party.members;
        
        console.log(`[UI] updateParty - ${allMembers.length} total members, ${aliveMembers.length} alive`);
        
        allMembers.forEach((member, index) => {
            // Get fresh health values directly from the member object
            const health = member.health;
            const stamina = member.stamina;
            const morale = member.morale;
            
            console.log(`[UI] Member ${index} (${member.name}): health = ${health}%, stamina = ${stamina}%, morale = ${morale}%`);
            
            // Create a status object with fresh values
            const memberStatus = {
                name: member.name,
                health: health,
                stamina: stamina,
                morale: morale,
                hunger: member.hunger,
                alive: member.alive,
                disease: member.disease,
                injury: member.injury
            };
            
            const card = this.visualUI.createPartyMemberCard(memberStatus);
            this.partyContainerEl.appendChild(card);
            
            // Verify the card was created with correct health
            const healthBar = card.querySelector('.progress-bar-fill');
            if (healthBar) {
                const width = healthBar.style.width;
                console.log(`[UI] Card created for ${member.name} - health bar width: ${width} (should be ${health}%)`);
            }
        });
        
        // Force browser reflow to ensure visual updates
        void this.partyContainerEl.offsetHeight;
        
        console.log(`[UI] updateParty completed`);
    }
    
    updateQuickStats(party) {
        if (!this.quickStatsEl) return;
        
        const status = party.getStatus();
        this.quickStatsEl.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">👥 Alive</span>
                <span class="stat-value">${status.alive}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">💀 Dead</span>
                <span class="stat-value">${status.dead}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">❤️ Avg Health</span>
                <span class="stat-value">${status.averageHealth}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">⚡ Avg Stamina</span>
                <span class="stat-value">${status.averageStamina}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">😊 Avg Morale</span>
                <span class="stat-value">${status.averageMorale}%</span>
            </div>
        `;
    }
    
    updateInventory(inventory) {
        if (!this.inventoryContainerEl) return;
        
        const status = inventory.getStatus();
        const items = [
            { icon: '🌾', name: 'Food', value: `${status.food} lbs` },
            { icon: '🔫', name: 'Bullets', value: status.bullets },
            { icon: '👕', name: 'Clothing', value: `${status.clothing} sets` },
            { icon: '💊', name: 'Medicine', value: `${status.medicine} doses` },
            { icon: '🔧', name: 'Tools', value: status.tools }
        ];
        
        this.inventoryContainerEl.innerHTML = items.map(item => `
            <div class="inventory-item">
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-value">${item.value}</div>
            </div>
        `).join('');
    }
    
    updateWagon(inventory) {
        if (!this.wagonContainerEl) return;
        
        // Get fresh status directly from inventory object
        const wagonCondition = inventory.wagonCondition;
        const oxenCondition = inventory.oxenCondition;
        const status = inventory.getStatus();
        
        console.log(`[UI] updateWagon called - wagonCondition: ${wagonCondition}%, status.wagonCondition: ${status.wagonCondition}%`);
        
        const wagonColor = wagonCondition > 75 ? 'var(--success)' : 
                          wagonCondition > 50 ? 'var(--primary-gold)' : 'var(--warning)';
        const oxenColor = oxenCondition > 75 ? 'var(--success)' : 
                         oxenCondition > 50 ? 'var(--primary-gold)' : 'var(--warning)';
        
        // Use direct values to ensure we get the latest
        const displayCondition = wagonCondition;
        const displayOxenCondition = oxenCondition;
        
        this.wagonContainerEl.innerHTML = `
            <div class="wagon-stat">
                <div class="wagon-label">
                    <span>Condition</span>
                    <span class="wagon-value">${displayCondition}%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${displayCondition}%; background: ${wagonColor};"></div>
                </div>
            </div>
            <div class="wagon-stat">
                <div class="wagon-label">
                    <span>Oxen (${status.oxen})</span>
                    <span class="wagon-value">${displayOxenCondition}%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${displayOxenCondition}%; background: ${oxenColor};"></div>
                </div>
            </div>
            <div style="margin-top: 10px; font-size: 12px; color: var(--text-secondary);">
                <div>🔩 Axles: ${status.wagonAxles}</div>
                <div>⚙️ Wheels: ${status.wagonWheels}</div>
                <div>🔗 Tongues: ${status.wagonTongues}</div>
            </div>
        `;
        
        // Force browser reflow to ensure visual updates
        void this.wagonContainerEl.offsetHeight;
        
        console.log(`[UI] updateWagon completed - displayed condition: ${displayCondition}%`);
    }
    
    updateSettings(pace, rations) {
        if (!this.settingsContainerEl) return;
        
        const paceIcons = {
            'rest': '😴',
            'slow': '🚶',
            'normal': '🚶‍♂️',
            'strenuous': '🏃',
            'grueling': '🏃‍♂️'
        };
        
        const rationIcons = {
            'filling': '🍖',
            'normal': '🍗',
            'meager': '🥩',
            'barebones': '🦴'
        };
        
        const paceDisplay = pace.charAt(0).toUpperCase() + pace.slice(1);
        const rationsDisplay = rations === 'barebones' ? 'Bare Bones' : 
                              rations.charAt(0).toUpperCase() + rations.slice(1);
        
        this.settingsContainerEl.innerHTML = `
            <div class="setting-item">
                <span class="setting-icon">${paceIcons[pace] || '🚶'}</span>
                <div class="setting-info">
                    <div class="setting-label">Pace</div>
                    <div class="setting-value">${paceDisplay}</div>
                </div>
            </div>
            <div class="setting-item">
                <span class="setting-icon">${rationIcons[rations] || '🍗'}</span>
                <div class="setting-info">
                    <div class="setting-label">Rations</div>
                    <div class="setting-value">${rationsDisplay}</div>
                </div>
            </div>
        `;
    }
    
    displayEvent(event, gameEngine) {
        return new Promise((resolve) => {
            // Store resolve function so it can be called when choice is made
            this.pendingEventResolve = resolve;
            const modal = this.eventModal;
            const title = document.getElementById('event-title');
            const icon = document.getElementById('event-icon');
            const description = document.getElementById('event-description');
            const choices = document.getElementById('event-choices');
            
            // Event icons with colors
            const eventIcons = {
                'disease': { icon: '🦠', color: 'var(--warning)' },
                'injury': { icon: '🩹', color: 'var(--warning)' },
                'wagon_damage': { icon: '🔧', color: 'var(--info)' },
                'environmental': { icon: '🌪️', color: 'var(--info)' },
                'positive': { icon: '✨', color: 'var(--success)' },
                'bandit': { icon: '🔫', color: 'var(--warning)' }
            };
            
            const eventData = eventIcons[event.type] || { icon: '⚠️', color: 'var(--warning)' };
            
            if (title) title.textContent = event.name;
            if (icon) {
                icon.textContent = eventData.icon;
                icon.style.color = eventData.color;
            }
            if (description) description.textContent = event.description;
            
            if (choices) {
                choices.innerHTML = '';
                if (event.choices && event.choices.length > 0) {
                    event.choices.forEach((choice, index) => {
                        const btn = document.createElement('button');
                        btn.className = 'choice-btn';
                        let text = choice.text;
                        let disabled = false;
                        
                        if (choice.requiresItem && gameEngine) {
                            const hasItem = gameEngine.checkItemAvailability(choice.requiresItem, event);
                            if (!hasItem) {
                                text += ' (NOT AVAILABLE)';
                                disabled = true;
                            }
                        }
                        
                        btn.textContent = `${index + 1}. ${text}`;
                        if (disabled) {
                            btn.classList.add('disabled');
                        }
                        
                        btn.onclick = () => {
                            if (!disabled) {
                                this.closeModals();
                                if (this.pendingEventResolve) {
                                    this.pendingEventResolve(index);
                                    this.pendingEventResolve = null;
                                }
                            }
                        };
                        
                        // Keyboard navigation
                        btn.onkeydown = (e) => {
                            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                                e.preventDefault();
                                btn.click();
                            }
                        };
                        
                        choices.appendChild(btn);
                    });
                } else {
                    const btn = document.createElement('button');
                    btn.className = 'choice-btn';
                    btn.textContent = 'Continue';
                    btn.onclick = () => {
                        this.closeModals();
                        if (this.pendingEventResolve) {
                            this.pendingEventResolve(null);
                            this.pendingEventResolve = null;
                        }
                    };
                    choices.appendChild(btn);
                }
            }
            
            modal.style.display = 'flex';
            // Focus first button for keyboard navigation
            setTimeout(() => {
                const firstBtn = choices?.querySelector('.choice-btn:not(.disabled)');
                if (firstBtn) firstBtn.focus();
            }, 100);
        });
    }
    
    async visitStore(store, budget, inventory, isInitial = false) {
        return new Promise((resolve) => {
            const modal = this.storeModal;
            const budgetEl = document.getElementById('store-budget');
            const itemsEl = document.getElementById('store-items');
            const doneBtn = document.getElementById('store-done');
            
            let totalSpent = 0;
            const purchases = {};
            const quantityInputs = {};
            
            const updateBudget = () => {
                if (budgetEl) {
                    const remaining = budget - totalSpent;
                    budgetEl.textContent = `$${remaining.toFixed(2)}`;
                    budgetEl.style.color = remaining < 10 ? 'var(--warning)' : 'var(--primary-gold)';
                }
            };
            
            const updateStore = () => {
                if (itemsEl) {
                    itemsEl.innerHTML = '';
                    Object.keys(store.items).forEach(itemKey => {
                        const item = store.items[itemKey];
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'store-item';
                        
                        const itemIcons = {
                            'food': '🌾',
                            'bullets': '🔫',
                            'clothing': '👕',
                            'oxen': '🐂',
                            'wagonAxles': '🔩',
                            'wagonWheels': '⚙️',
                            'wagonTongues': '🔗',
                            'tools': '🔧',
                            'medicine': '💊'
                        };
                        
                        const qty = purchases[itemKey] || 0;
                        const inputId = `qty-${itemKey}`;
                        
                        itemDiv.innerHTML = `
                            <div class="store-item-icon">${itemIcons[itemKey] || '📦'}</div>
                            <div class="store-item-name">${item.name}</div>
                            <div class="store-item-price">$${item.price.toFixed(2)}</div>
                            ${qty > 0 ? `<div style="font-size: 12px; color: var(--success); margin: 5px 0;">Purchased: ${qty}</div>` : ''}
                            <div class="store-item-input">
                                <input type="number" id="${inputId}" min="0" value="0" style="width: 70px; padding: 6px; background: rgba(0,0,0,0.5); border: 1px solid var(--card-border); border-radius: 6px; color: var(--text-primary); text-align: center;">
                                <button class="btn-primary" style="padding: 6px 12px; font-size: 12px;">Add</button>
                            </div>
                        `;
                        
                        const addBtn = itemDiv.querySelector('.btn-primary');
                        const qtyInput = itemDiv.querySelector(`#${inputId}`);
                        quantityInputs[itemKey] = qtyInput;
                        
                        addBtn.onclick = () => {
                            const qty = parseInt(qtyInput.value) || 0;
                            if (qty > 0) {
                                const cost = item.price * qty;
                                if (totalSpent + cost <= budget) {
                                    totalSpent += cost;
                                    purchases[itemKey] = (purchases[itemKey] || 0) + qty;
                                    store.purchase(itemKey, qty, inventory);
                                    qtyInput.value = 0;
                                    updateBudget();
                                    updateStore();
                                } else {
                                    alert(`Cannot afford that! You only have $${(budget - totalSpent).toFixed(2)} remaining.`);
                                }
                            }
                        };
                        
                        itemsEl.appendChild(itemDiv);
                    });
                }
                updateBudget();
            };
            
            updateStore();
            
            doneBtn.onclick = () => {
                // Check if oxen required for initial store
                if (isInitial && inventory.oxen === 0) {
                    alert('You must purchase at least one pair of oxen before leaving!');
                    return;
                }
                this.closeModals();
                resolve();
            };
            
            modal.style.display = 'flex';
            // Focus first input
            setTimeout(() => {
                const firstInput = itemsEl?.querySelector('input');
                if (firstInput) firstInput.focus();
            }, 100);
        });
    }
    
    closeModals() {
        if (this.eventModal) this.eventModal.style.display = 'none';
        if (this.storeModal) this.storeModal.style.display = 'none';
    }
    
    displayMessage(message) {
        this.printLine('');
        this.printLine(message);
        this.printLine('');
    }
    
    displayWin() {
        this.clear();
        const winContent = document.createElement('div');
        winContent.style.cssText = 'text-align: center; padding: 40px;';
        winContent.innerHTML = `
            <div style="font-size: 64px; margin-bottom: 20px;">🎉</div>
            <h2 style="font-family: Playfair Display, serif; font-size: 36px; color: var(--primary-gold); margin-bottom: 20px;">CONGRATULATIONS!</h2>
            <p style="font-size: 18px; line-height: 1.8; margin-bottom: 10px;">You have successfully reached Oregon City!</p>
            <p style="font-size: 16px; line-height: 1.8; color: var(--text-secondary);">Your journey across the Oregon Trail is complete.</p>
            <p style="font-size: 16px; line-height: 1.8; color: var(--text-secondary); margin-top: 20px;">The surviving members of your party can now start their new life in the Oregon Territory.</p>
        `;
        this.outputElement.appendChild(winContent);
    }
    
    displayLoss(reason) {
        this.clear();
        const lossContent = document.createElement('div');
        lossContent.style.cssText = 'text-align: center; padding: 40px;';
        lossContent.innerHTML = `
            <div style="font-size: 64px; margin-bottom: 20px;">💀</div>
            <h2 style="font-family: Playfair Display, serif; font-size: 36px; color: var(--warning); margin-bottom: 20px;">GAME OVER</h2>
            <p style="font-size: 18px; line-height: 1.8; margin-bottom: 10px; color: var(--warning);">Your journey has ended: ${reason}</p>
            <p style="font-size: 16px; line-height: 1.8; color: var(--text-secondary); margin-top: 20px;">The Oregon Trail has claimed another group of travelers.</p>
            <p style="font-size: 16px; line-height: 1.8; color: var(--text-secondary);">Better luck next time!</p>
        `;
        this.outputElement.appendChild(lossContent);
    }
    
    close() {
        // Browser doesn't need to close anything
    }
}
