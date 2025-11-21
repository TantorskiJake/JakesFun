import { Party } from './party.js';
import { Inventory } from './inventory.js';
import { Locations } from './locations.js';
import { Events } from './events.js';
import { Store } from './store.js';
import { UI } from './ui.js';
import fs from 'fs';
import path from 'path';

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
        this.rations = 'normal'; // 'filling', 'normal', 'meager', 'bare bones'
        this.weather = 'clear';
        this.season = 'spring';
        this.milesTraveled = 0;
        this.gameOver = false;
        this.gameWon = false;
        
        // River crossing state
        this.atRiver = false;
        this.currentRiverEvent = null;
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
        
        // Initial store visit
        await this.visitStore(true);
        
        // Check minimum requirements
        if (this.inventory.oxen === 0) {
            this.ui.displayMessage('You must purchase at least one pair of oxen to begin!');
            await this.visitStore(true);
        }
        
        if (this.inventory.food < 100) {
            this.ui.displayMessage('Warning: You have very little food. Consider purchasing more.');
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
        const profession = professions[profIndex].toLowerCase();
        
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
        
        this.ui.clear();
        this.ui.printLine(this.store.getStoreDisplay(budget));
        
        const purchases = {};
        let totalSpent = 0;
        
        while (true) {
            this.ui.printLine(`Remaining budget: ${this.store.formatPrice(budget - totalSpent)}`);
            this.ui.printLine();
            this.ui.printLine('What would you like to purchase? (or "done" to finish)');
            const item = await this.ui.prompt('Item: ').toLowerCase();
            
            if (item === 'done' || item === '') {
                break;
            }
            
            if (!this.store.items[item]) {
                this.ui.printLine('Invalid item. Available items: ' + this.store.getAllItems().join(', '));
                continue;
            }
            
            const quantity = await this.ui.promptNumber(
                `How many ${this.store.items[item].unit}? `,
                1
            );
            
            const cost = this.store.getItemPrice(item, quantity);
            
            if (totalSpent + cost > budget) {
                this.ui.printLine('You cannot afford that!');
                continue;
            }
            
            this.store.purchase(item, quantity, this.inventory);
            purchases[item] = (purchases[item] || 0) + quantity;
            totalSpent += cost;
            
            this.ui.printLine(`Purchased ${quantity} ${this.store.items[item].unit} of ${item} for ${this.store.formatPrice(cost)}`);
        }
        
        this.ui.printLine();
        this.ui.printLine(`Total spent: ${this.store.formatPrice(totalSpent)}`);
        this.ui.printLine('Press Enter to continue...');
        await this.ui.prompt('');
    }
    
    /**
     * Main game loop
     */
    async run() {
        await this.initialize();
        
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
            
            // Check if at river
            if (this.locations.isAtRiver() && !this.atRiver) {
                this.atRiver = true;
                await this.handleRiverCrossing();
                return; // Exit to advance day
            }
            
            // Check if at fort
            if (this.locations.isAtFort()) {
                const choice = await this.ui.promptChoice(
                    'You have reached a fort! What would you like to do?',
                    ['Continue traveling', 'Rest for a day', 'Visit store', 'Hunt']
                );
                
                if (choice === 1) {
                    // Rest
                    this.rest();
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
                // Continue traveling falls through
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
        this.locations.advanceLocation(this.milesTraveled);
        
        // Consume food based on rations
        this.consumeFood();
        
        // Update party stats
        this.updatePartyStats();
        
        // Random event
        const event = this.events.getRandomEvent(this.getGameState());
        if (event) {
            await this.handleEvent(event);
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
            case 'bare bones':
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
        this.ui.displayEvent(event);
        
        if (event.choices && event.choices.length > 0) {
            const choiceTexts = event.choices.map(c => {
                let text = c.text;
                if (c.requiresItem) {
                    const hasItem = this.checkItemAvailability(c.requiresItem, event);
                    text += hasItem ? '' : ' (NOT AVAILABLE)';
                }
                return text;
            });
            
            const choiceIndex = await this.ui.promptChoice(
                'What would you like to do?',
                choiceTexts
            );
            
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
            
            if (selectedChoice.effect) {
                selectedChoice.effect();
            }
        }
        
        this.ui.printLine('Press Enter to continue...');
        await this.ui.prompt('');
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
                this.atRiver = false;
                return;
        }
        
        this.atRiver = false;
    }
    
    async fordRiver() {
        const success = Math.random() > 0.3; // 70% success
        
        if (success) {
            this.ui.displayMessage('You successfully forded the river!');
            // Advance to next location
            if (this.locations.currentLocationIndex < this.locations.locations.length - 1) {
                this.locations.currentLocationIndex++;
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
            if (this.locations.currentLocationIndex < this.locations.locations.length - 1) {
                this.locations.currentLocationIndex++;
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
        
        if (success) {
            this.ui.displayMessage('You successfully crossed using the caulked wagon!');
        } else {
            this.ui.displayMessage('The crossing was rough but you made it. Some supplies were lost.');
            this.inventory.consumeFood(Math.floor(this.inventory.food * 0.05));
            this.inventory.damageWagon(5);
        }
        // Advance to next location
        if (this.locations.currentLocationIndex < this.locations.locations.length - 1) {
            this.locations.currentLocationIndex++;
        }
    }
    
    async ferryRiver() {
        // Assume player has money (simplified)
        this.ui.displayMessage('You took the ferry across safely.');
        // Advance to next location
        if (this.locations.currentLocationIndex < this.locations.locations.length - 1) {
            this.locations.currentLocationIndex++;
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
        this.pace = paces[choice].toLowerCase();
        this.ui.displayMessage(`Pace changed to ${this.pace}.`);
    }
    
    /**
     * Change rations
     */
    async changeRations() {
        const rations = ['Filling', 'Normal', 'Meager', 'Bare Bones'];
        const choice = await this.ui.promptChoice('Select rations:', rations);
        this.rations = rations[choice].toLowerCase().replace(' ', '');
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
            party: this.party.toJSON(),
            inventory: this.inventory.toJSON(),
            locations: this.locations.toJSON()
        };
        
        const saveString = JSON.stringify(saveData, null, 2);
        
        if (this.ui.isNode) {
            // Node.js - save to file
            const savePath = path.join(process.cwd(), 'savegame.json');
            fs.writeFileSync(savePath, saveString);
            this.ui.displayMessage('Game saved to savegame.json');
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
        this.party = Party.fromJSON(saveData.party);
        this.inventory = Inventory.fromJSON(saveData.inventory);
        this.locations = Locations.fromJSON(saveData.locations);
        
        this.ui.displayMessage('Game loaded successfully!');
        this.ui.printLine('Press Enter to continue...');
        await this.ui.prompt('');
    }
}

