import { Party } from './party.js';
import { Inventory } from './inventory.js';
import { Locations } from './locations.js';
import { Events } from './events.js';
import { Store } from './store.js';
import { UI } from './ui.js';

// Node.js modules - only available in Node.js environment
// These will be undefined in browser, which is handled in save/load methods

/**
 * GameEngine class - core game loop and logic
 */
export class GameEngine {
    constructor() {
        this.party = new Party();
        this.inventory = new Inventory();
        this.locations = new Locations();
        this.events = new Events();
        this.store = new Store();
        this.ui = new UI();
        
        // Game state
        this.date = new Date(1848, 2, 1); // March 1, 1848
        this.pace = 'normal'; // 'rest', 'slow', 'normal', 'strenuous', 'grueling'
        this.rations = 'normal'; // 'filling', 'normal', 'meager', 'barebones'
        this.weather = 'clear';
        this.season = 'spring';
        this.milesTraveled = 0;
        this.gameOver = false;
        this.gameWon = false;
        
        // River crossing state
        this.atRiver = false;
        this.currentRiverEvent = null;
        this.atFort = false;
    }
    
    /**
     * Initialize the game - setup party and initial purchases
     */
    async initialize() {
        this.ui.clear();
        this.ui.printLine('═══════════════════════════════════════════════════════════');
        this.ui.printLine('                    THE OREGON TRAIL');
        this.ui.printLine('═══════════════════════════════════════════════════════════');
        this.ui.printLine();
        this.ui.printLine('You are about to embark on a journey across the Oregon Trail.');
        this.ui.printLine('You will begin in Independence, Missouri, and travel');
        this.ui.printLine('2,040 miles to Oregon City.');
        this.ui.printLine();
        
        // Setup party
        await this.setupParty();
        
        // Initial store visit - must purchase oxen
        while (this.inventory.oxen === 0) {
            await this.visitStore(true);
            if (this.inventory.oxen === 0) {
                this.ui.displayMessage('You must purchase at least one pair of oxen to begin your journey!');
                this.ui.printLine('You cannot start without oxen to pull your wagon.');
                this.ui.printLine('Press Enter to return to the store...');
                await this.ui.prompt('');
            }
        }
        
        if (this.inventory.food < 100) {
            this.ui.displayMessage('Warning: You have very little food. Consider purchasing more.');
            this.ui.printLine('Press Enter to continue anyway...');
            await this.ui.prompt('');
        }
    }
    
    /**
     * Setup party members
     */
    async setupParty() {
        this.ui.printLine('=== PARTY SETUP ===');
        this.ui.printLine();
        
        // Party size
        const partySize = await this.ui.promptNumber(
            'How many people are in your party? (1-5): ',
            1, 5
        );
        
        // Leader profession
        this.ui.printLine();
        this.ui.printLine('Choose your profession:');
        const professions = ['Farmer', 'Carpenter', 'Banker', 'Doctor', 'Hunter'];
        const profIndex = await this.ui.promptChoice('Select profession:', professions);
        const profession = professions[profIndex] ? professions[profIndex].toLowerCase() : 'farmer';
        
        // Leader name
        const leaderName = await this.ui.prompt('Enter your name: ');
        this.party.addMember(leaderName || 'You', profession);
        
        // Additional members
        for (let i = 1; i < partySize; i++) {
            const name = await this.ui.prompt(`Enter name for party member ${i + 1}: `);
            this.party.addMember(name || `Traveler ${i}`, 'farmer');
        }
        
        this.ui.printLine();
        this.ui.printLine(`Your party consists of ${this.party.members.length} members.`);
        this.ui.printLine('Press Enter to continue...');
        await this.ui.prompt('');
    }
    
    /**
     * Visit the store
     */
    async visitStore(isInitial = false) {
        let budget = isInitial ? this.store.getStartingBudget() : 0;
        
        if (!isInitial) {
            // At a fort, player can sell items or has limited money
            budget = 50; // Small amount for emergency purchases
        }
        
        // Use visual store modal - loop until oxen purchased if initial
        while (true) {
            await this.ui.visitStore(this.store, budget, this.inventory, isInitial);
            
            // Check minimum requirements after store visit
            if (isInitial && this.inventory.oxen === 0) {
                this.ui.displayMessage('⚠️  You MUST purchase at least one pair of oxen to begin your journey!');
                this.ui.printLine('Please return to the store and purchase oxen.');
                await this.ui.prompt('Press Enter to return to store...');
            } else {
                break;
            }
        }
    }
    
    /**
     * Main game loop
     */
    async run() {
        await this.initialize();
        
        // Final check after initialization - don't start if we don't have oxen
        if (this.inventory.oxen === 0) {
            this.ui.displayLoss('You cannot begin your journey without oxen to pull your wagon.');
            this.ui.close();
            return;
        }
        
        while (!this.gameOver && !this.gameWon) {
            // Check win/loss conditions
            if (this.checkWinCondition()) {
                this.gameWon = true;
                break;
            }
            
            if (this.checkLossCondition()) {
                this.gameOver = true;
                break;
            }
            
            // Daily actions
            await this.dailyActions();
            
            // Advance day
            this.advanceDay();
        }
        
        // End game
        if (this.gameWon) {
            this.ui.displayWin();
        } else {
            const reason = this.getLossReason();
            this.ui.displayLoss(reason);
        }
        
        this.ui.printLine('Press Enter to exit...');
        await this.ui.prompt('');
        this.ui.close();
    }
    
    /**
     * Daily actions menu
     */
    async dailyActions() {
        while (true) {
            this.updateWeather();
            this.season = this.locations.getSeason(this.date);
            
            this.ui.displayGameState(this.getGameState());
            
            // Check if at river (only trigger once per river)
            const currentLoc = this.locations.getCurrentLocation();
            if (currentLoc.type === 'river' && !this.atRiver) {
                this.atRiver = true;
                await this.handleRiverCrossing();
                // After crossing, reset flag if we're no longer at the river
                if (!this.locations.isAtRiver()) {
                    this.atRiver = false;
                }
                return; // Exit to advance day
            }
            
            // Check if at fort (only show once per visit)
            if (this.locations.isAtFort() && !this.atFort) {
                this.atFort = true;
                const choice = await this.ui.promptChoice(
                    'You have reached a fort! What would you like to do?',
                    ['Continue traveling', 'Rest for a day', 'Visit store', 'Hunt']
                );
                
                if (choice === 0) {
                    // Continue traveling - actually travel
                    await this.travel();
                    this.atFort = false; // Reset so we can visit again if we come back
                    return;
                } else if (choice === 1) {
                    // Rest
                    this.rest();
                    this.atFort = false;
                    return; // Exit to advance day
                } else if (choice === 2) {
                    // Store
                    await this.visitStore(false);
                    continue;
                } else if (choice === 3) {
                    // Hunt
                    await this.hunt();
                    continue;
                }
            }
            
            // Main menu
            const choice = await this.ui.promptChoice(
                'What would you like to do?',
                ['Continue on trail', 'Check supplies', 'Change pace', 'Change rations', 'Rest', 'Hunt', 'Save game', 'Load game']
            );
            
            switch (choice) {
                case 0:
                    await this.travel();
                    return; // Exit daily actions after travel
                case 1:
                    await this.displaySupplies();
                    break;
                case 2:
                    await this.changePace();
                    break;
                case 3:
                    await this.changeRations();
                    break;
                case 4:
                    this.rest();
                    return; // Exit to advance day
                case 5:
                    await this.hunt();
                    break;
                case 6:
                    await this.saveGame();
                    break;
                case 7:
                    await this.loadGame();
                    break;
            }
        }
    }
    
    /**
     * Travel one day
     */
    async travel() {
        // Calculate miles based on pace, terrain, weather, and party condition
        let baseMiles = 0;
        switch (this.pace) {
            case 'rest':
                baseMiles = 0;
                break;
            case 'slow':
                baseMiles = 10;
                break;
            case 'normal':
                baseMiles = 20;
                break;
            case 'strenuous':
                baseMiles = 30;
                break;
            case 'grueling':
                baseMiles = 40;
                break;
        }
        
        // Terrain modifier
        const terrain = this.locations.getTerrain();
        baseMiles = Math.floor(baseMiles / terrain.difficulty);
        
        // Weather modifier
        if (this.weather === 'storm' || this.weather === 'snow') {
            baseMiles = Math.floor(baseMiles * 0.5);
        } else if (this.weather === 'rain') {
            baseMiles = Math.floor(baseMiles * 0.7);
        }
        
        // Party condition modifier
        const avgStamina = this.party.getAverageStamina();
        const avgHealth = this.party.getAverageHealth();
        const conditionModifier = (avgStamina + avgHealth) / 200;
        baseMiles = Math.floor(baseMiles * conditionModifier);
        
        // Wagon condition modifier
        if (this.inventory.wagonCondition < 50) {
            baseMiles = Math.floor(baseMiles * 0.7);
        }
        
        // Oxen condition modifier
        if (this.inventory.oxenCondition < 50) {
            baseMiles = Math.floor(baseMiles * 0.8);
        }
        
        this.milesTraveled = Math.max(0, baseMiles);
        console.log('Before advanceLocation:', {
            milesTraveled: this.milesTraveled,
            totalMilesTraveled: this.locations.totalMilesTraveled
        });
        this.locations.advanceLocation(this.milesTraveled);
        console.log('After advanceLocation:', {
            totalMilesTraveled: this.locations.totalMilesTraveled,
            getDistanceTraveled: this.locations.getDistanceTraveled()
        });
        
        // Consume food based on rations
        this.consumeFood();
        
        // Update party stats
        this.updatePartyStats();
        
        // Update UI immediately after travel to show progress
        this.ui.displayGameState(this.getGameState());
        
        // Random event (only if we actually traveled)
        if (this.milesTraveled > 0) {
            const event = this.events.getRandomEvent(this.getGameState());
            if (event) {
                // Show travel scene briefly
                if (this.ui.travelSceneEl) {
                    this.ui.travelSceneEl.style.display = 'flex';
                    this.ui.mainContentEl.style.display = 'none';
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
                await this.handleEvent(event);
                if (this.ui.travelSceneEl) {
                    this.ui.travelSceneEl.style.display = 'none';
                    this.ui.mainContentEl.style.display = 'block';
                }
                // Update UI again after event
                this.ui.displayGameState(this.getGameState());
            }
        }
        
        // Update disease/injury effects
        this.updateDiseaseInjuryEffects();
    }
    
    /**
     * Consume food based on rations
     */
    consumeFood() {
        if (this.pace === 'rest') {
            return; // No travel, minimal food consumption
        }
        
        let foodPerPerson = 0;
        switch (this.rations) {
            case 'filling':
                foodPerPerson = 3;
                break;
            case 'normal':
                foodPerPerson = 2;
                break;
            case 'meager':
                foodPerPerson = 1.5;
                break;
            case 'barebones':
                foodPerPerson = 1;
                break;
        }
        
        const totalFood = foodPerPerson * this.party.getAliveMembers().length;
        const consumed = this.inventory.consumeFood(totalFood);
        
        if (consumed < totalFood) {
            // Not enough food
            const shortage = totalFood - consumed;
            this.party.updateAllHunger(shortage * 10);
            this.party.updateAllMorale(-5);
        } else {
            // Well fed
            if (this.rations === 'filling') {
                this.party.updateAllHunger(-5);
                this.party.updateAllMorale(2);
            } else if (this.rations === 'normal') {
                this.party.updateAllHunger(-2);
            } else if (this.rations === 'meager') {
                this.party.updateAllHunger(5);
            } else {
                this.party.updateAllHunger(10);
            }
        }
    }
    
    /**
     * Update party stats based on travel
     */
    updatePartyStats() {
        // Stamina loss based on pace
        let staminaLoss = 0;
        switch (this.pace) {
            case 'slow':
                staminaLoss = 5;
                break;
            case 'normal':
                staminaLoss = 10;
                break;
            case 'strenuous':
                staminaLoss = 20;
                break;
            case 'grueling':
                staminaLoss = 30;
                break;
        }
        
        this.party.updateAllStamina(-staminaLoss);
        
        // Wagon wear
        if (this.milesTraveled > 0) {
            const wear = Math.floor(this.milesTraveled / 10);
            this.inventory.damageWagon(wear);
        }
        
        // Oxen wear
        if (this.milesTraveled > 0) {
            const oxenWear = Math.floor(this.milesTraveled / 20);
            this.inventory.damageOxen(oxenWear);
        }
    }
    
    /**
     * Handle random events
     */
    async handleEvent(event) {
        // Prepare event with game state for UI
        const eventWithState = {
            ...event,
            gameState: this.getGameState()
        };
        
        // Use visual event modal - it will return the choice index
        const choiceIndex = await this.ui.displayEvent(eventWithState, this);
        
        if (event.choices && event.choices.length > 0 && choiceIndex !== null && choiceIndex !== undefined) {
            const selectedChoice = event.choices[choiceIndex];
            
            // Check if item is required and available
            if (selectedChoice.requiresItem) {
                if (!this.checkItemAvailability(selectedChoice.requiresItem, event)) {
                    this.ui.displayMessage('You do not have the required item!');
                    // Apply default effect
                    if (event.choices[0]) {
                        event.choices[0].effect();
                    }
                    return;
                }
            }
            
            // Execute the selected choice's effect
            if (selectedChoice.effect) {
                selectedChoice.effect();
            }
        }
    }
    
    checkItemAvailability(item, event) {
        switch (item) {
            case 'medicine':
                return this.inventory.medicine > 0;
            case 'tools':
                return this.inventory.tools > 0;
            case 'axle':
                return this.inventory.wagonAxles > 0;
            case 'wheel':
                return this.inventory.wagonWheels > 0;
            case 'tongue':
                return this.inventory.wagonTongues > 0;
            default:
                return true;
        }
    }
    
    /**
     * Update disease and injury effects daily
     */
    updateDiseaseInjuryEffects() {
        this.party.getAliveMembers().forEach(member => {
            if (member.disease) {
                member.updateHealth(-2);
                member.updateStamina(-5);
            }
            if (member.injury) {
                member.updateHealth(-1);
                member.updateStamina(-10);
            }
        });
    }
    
    /**
     * Handle river crossing
     */
    async handleRiverCrossing() {
        const location = this.locations.getCurrentLocation();
        this.ui.displayMessage(`You have reached ${location.name}. You must cross the river.`);
        
        const choices = [
            'Ford the river (free, but risky)',
            'Caulk the wagon and float across (requires tools)',
            'Take a ferry (costs $10, safest)',
            'Wait for better conditions (lose a day)'
        ];
        
        const choice = await this.ui.promptChoice('How would you like to cross?', choices);
        
        switch (choice) {
            case 0: // Ford
                await this.fordRiver();
                break;
            case 1: // Caulk
                await this.caulkRiver();
                break;
            case 2: // Ferry
                await this.ferryRiver();
                break;
            case 3: // Wait
                this.rest();
                // Don't reset atRiver - we're still at the river, will trigger again next day
                return;
        }
        
        this.atRiver = false;
    }
    
    async fordRiver() {
        const success = Math.random() > 0.3; // 70% success
        
        // Consume food for river crossing
        const foodPerPerson = 1;
        const totalFood = foodPerPerson * this.party.getAliveMembers().length;
        this.inventory.consumeFood(totalFood);
        
        if (success) {
            this.ui.displayMessage('You successfully forded the river!');
            // Advance to next location by updating miles
            const nextLoc = this.locations.getNextLocation();
            if (nextLoc) {
                const distanceToNext = nextLoc.miles - this.locations.getCurrentLocation().miles;
                this.locations.advanceLocation(distanceToNext);
            }
        } else {
            this.ui.displayMessage('The crossing was difficult! You lost supplies and took damage.');
            this.inventory.consumeFood(Math.floor(this.inventory.food * 0.1));
            this.inventory.damageWagon(15);
            this.party.getAliveMembers().forEach(m => {
                if (Math.random() > 0.7) {
                    m.updateHealth(-10);
                }
            });
            // Still advance but with consequences
            const nextLoc = this.locations.getNextLocation();
            if (nextLoc) {
                const distanceToNext = nextLoc.miles - this.locations.getCurrentLocation().miles;
                this.locations.advanceLocation(distanceToNext);
            }
        }
    }
    
    async caulkRiver() {
        if (this.inventory.tools === 0) {
            this.ui.displayMessage('You do not have tools to caulk the wagon! Attempting to ford instead...');
            await this.fordRiver();
            return;
        }
        
        this.inventory.useTools(1);
        const success = Math.random() > 0.15; // 85% success
        
        // Consume food for river crossing
        const foodPerPerson = 1;
        const totalFood = foodPerPerson * this.party.getAliveMembers().length;
        this.inventory.consumeFood(totalFood);
        
        if (success) {
            this.ui.displayMessage('You successfully crossed using the caulked wagon!');
        } else {
            this.ui.displayMessage('The crossing was rough but you made it. Some supplies were lost.');
            this.inventory.consumeFood(Math.floor(this.inventory.food * 0.05));
            this.inventory.damageWagon(5);
        }
        // Advance to next location
        const nextLoc = this.locations.getNextLocation();
        if (nextLoc) {
            const distanceToNext = nextLoc.miles - this.locations.getCurrentLocation().miles;
            this.locations.advanceLocation(distanceToNext);
        }
    }
    
    async ferryRiver() {
        // Assume player has money (simplified)
        this.ui.displayMessage('You took the ferry across safely.');
        // Consume food for river crossing
        const foodPerPerson = 1;
        const totalFood = foodPerPerson * this.party.getAliveMembers().length;
        this.inventory.consumeFood(totalFood);
        // Advance to next location
        const nextLoc = this.locations.getNextLocation();
        if (nextLoc) {
            const distanceToNext = nextLoc.miles - this.locations.getCurrentLocation().miles;
            this.locations.advanceLocation(distanceToNext);
        }
    }
    
    /**
     * Rest for a day
     */
    rest() {
        this.party.updateAllStamina(20);
        this.party.updateAllMorale(5);
        this.inventory.healOxen(10);
        
        // Small food consumption
        const foodPerPerson = 1;
        const totalFood = foodPerPerson * this.party.getAliveMembers().length;
        this.inventory.consumeFood(totalFood);
        
        this.ui.displayMessage('Your party has rested. Stamina and morale have improved.');
    }
    
    /**
     * Hunt for food
     */
    async hunt() {
        if (this.inventory.bullets < 10) {
            this.ui.displayMessage('You do not have enough bullets to hunt!');
            return;
        }
        
        this.ui.displayMessage('You go hunting...');
        
        // Hunting success based on bullets, skill, and luck
        const bulletsUsed = Math.min(20, this.inventory.bullets);
        this.inventory.useBullets(bulletsUsed);
        
        const hasHunter = this.party.members.some(m => m.profession === 'hunter' && m.alive);
        const skillBonus = hasHunter ? 0.3 : 0;
        const luck = Math.random();
        const success = luck + skillBonus > 0.4;
        
        if (success) {
            const foodGained = Math.floor(Math.random() * 100) + 50;
            this.inventory.addFood(foodGained);
            this.ui.displayMessage(`Hunting successful! You gained ${foodGained} lbs of food.`);
            this.party.updateAllMorale(5);
        } else {
            this.ui.displayMessage('Hunting unsuccessful. No food gained.');
            this.party.updateAllStamina(-10);
        }
        
        this.ui.printLine('Press Enter to continue...');
        await this.ui.prompt('');
    }
    
    /**
     * Change pace
     */
    async changePace() {
        const paces = ['Rest', 'Slow', 'Normal', 'Strenuous', 'Grueling'];
        const currentIndex = ['rest', 'slow', 'normal', 'strenuous', 'grueling'].indexOf(this.pace);
        const choice = await this.ui.promptChoice('Select pace:', paces);
        this.pace = paces[choice] ? paces[choice].toLowerCase() : 'normal';
        this.ui.displayMessage(`Pace changed to ${this.pace}.`);
    }
    
    /**
     * Change rations
     */
    async changeRations() {
        const rations = ['Filling', 'Normal', 'Meager', 'Bare Bones'];
        const choice = await this.ui.promptChoice('Select rations:', rations);
        const selected = rations[choice] ? rations[choice].toLowerCase() : 'normal';
        // Convert to internal format: 'bare bones' -> 'barebones'
        this.rations = selected === 'bare bones' ? 'barebones' : selected;
        this.ui.displayMessage(`Rations changed to ${this.rations}.`);
    }
    
    /**
     * Display supplies
     */
    async displaySupplies() {
        const status = this.inventory.getStatus();
        this.ui.printLine('\n=== SUPPLIES ===');
        this.ui.printLine(`Food: ${status.food} lbs`);
        this.ui.printLine(`Bullets: ${status.bullets}`);
        this.ui.printLine(`Clothing: ${status.clothing} sets`);
        this.ui.printLine(`Medicine: ${status.medicine} doses`);
        this.ui.printLine(`Wagon Condition: ${status.wagonCondition}%`);
        this.ui.printLine(`Oxen: ${status.oxen} (Condition: ${status.oxenCondition}%)`);
        this.ui.printLine(`Spare Parts: ${status.wagonAxles} axles, ${status.wagonWheels} wheels, ${status.wagonTongues} tongues`);
        this.ui.printLine(`Tools: ${status.tools}`);
        this.ui.printLine('\nPress Enter to continue...');
        await this.ui.prompt('');
    }
    
    /**
     * Update weather
     */
    updateWeather() {
        const rand = Math.random();
        const season = this.locations.getSeason(this.date);
        
        if (season === 'winter') {
            if (rand < 0.3) {
                this.weather = 'snow';
            } else if (rand < 0.5) {
                this.weather = 'storm';
            } else {
                this.weather = 'clear';
            }
        } else if (season === 'spring' || season === 'fall') {
            if (rand < 0.2) {
                this.weather = 'rain';
            } else if (rand < 0.3) {
                this.weather = 'storm';
            } else {
                this.weather = 'clear';
            }
        } else { // summer
            if (rand < 0.1) {
                this.weather = 'rain';
            } else if (rand < 0.2) {
                this.weather = 'storm';
            } else {
                this.weather = 'clear';
            }
        }
    }
    
    /**
     * Advance day
     */
    advanceDay() {
        this.date.setDate(this.date.getDate() + 1);
    }
    
    /**
     * Check win condition
     */
    checkWinCondition() {
        return this.locations.isAtEnd() && this.party.hasAliveMembers();
    }
    
    /**
     * Check loss condition
     */
    checkLossCondition() {
        if (!this.party.hasAliveMembers()) {
            return true;
        }
        if (!this.inventory.hasWorkingWagon()) {
            return true;
        }
        return false;
    }
    
    /**
     * Get loss reason
     */
    getLossReason() {
        if (!this.party.hasAliveMembers()) {
            return 'All party members have died.';
        }
        if (this.inventory.oxen === 0) {
            return 'You have lost all your oxen.';
        }
        if (this.inventory.wagonCondition <= 0) {
            return 'Your wagon has been destroyed.';
        }
        return 'Unknown reason.';
    }
    
    /**
     * Get current game state
     */
    getGameState() {
        return {
            date: this.date,
            locations: this.locations,
            party: this.party,
            inventory: this.inventory,
            pace: this.pace,
            rations: this.rations,
            weather: this.weather,
            season: this.season,
            terrain: this.locations.getTerrain(),
            milesTraveled: this.milesTraveled
        };
    }
    
    /**
     * Save game
     */
    async saveGame() {
        const saveData = {
            date: this.date.toISOString(),
            pace: this.pace,
            rations: this.rations,
            weather: this.weather,
            season: this.season,
            milesTraveled: this.milesTraveled,
            atRiver: this.atRiver,
            atFort: this.atFort,
            party: this.party.toJSON(),
            inventory: this.inventory.toJSON(),
            locations: this.locations.toJSON()
        };
        
        const saveString = JSON.stringify(saveData, null, 2);
        
        if (this.ui.isNode) {
            // Node.js - save to file
            try {
                const fsModule = await import('fs');
                const pathModule = await import('path');
                const fs = fsModule.default || fsModule;
                const path = pathModule.default || pathModule;
                const savePath = path.join(process.cwd(), 'savegame.json');
                fs.writeFileSync(savePath, saveString);
                this.ui.displayMessage('Game saved to savegame.json');
            } catch (error) {
                this.ui.displayMessage('Error saving game: ' + error.message);
            }
        } else {
            // Browser - use localStorage
            localStorage.setItem('oregonTrailSave', saveString);
            this.ui.displayMessage('Game saved to browser storage');
        }
        
        this.ui.printLine('Press Enter to continue...');
        await this.ui.prompt('');
    }
    
    /**
     * Load game
     */
    async loadGame() {
        let saveData = null;
        
        if (this.ui.isNode) {
            // Node.js - load from file
            try {
                const fsModule = await import('fs');
                const pathModule = await import('path');
                const fs = fsModule.default || fsModule;
                const path = pathModule.default || pathModule;
                const savePath = path.join(process.cwd(), 'savegame.json');
                const saveString = fs.readFileSync(savePath, 'utf8');
                saveData = JSON.parse(saveString);
            } catch (error) {
                this.ui.displayMessage('No save file found or error loading save file.');
                this.ui.printLine('Press Enter to continue...');
                await this.ui.prompt('');
                return;
            }
        } else {
            // Browser - use localStorage
            const saveString = localStorage.getItem('oregonTrailSave');
            if (!saveString) {
                this.ui.displayMessage('No save file found.');
                this.ui.printLine('Press Enter to continue...');
                await this.ui.prompt('');
                return;
            }
            saveData = JSON.parse(saveString);
        }
        
        // Restore game state
        this.date = new Date(saveData.date);
        this.pace = saveData.pace;
        this.rations = saveData.rations;
        this.weather = saveData.weather;
        this.season = saveData.season;
        this.milesTraveled = saveData.milesTraveled;
        this.atRiver = saveData.atRiver || false;
        this.atFort = saveData.atFort || false;
        this.party = Party.fromJSON(saveData.party);
        this.inventory = Inventory.fromJSON(saveData.inventory);
        this.locations = Locations.fromJSON(saveData.locations);
        
        this.ui.displayMessage('Game loaded successfully!');
        this.ui.printLine('Press Enter to continue...');
        await this.ui.prompt('');
    }
}

