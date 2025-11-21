/**
 * UI class - handles text display and user input
 * Works in both Node.js (readline) and browser (prompt)
 */
export class UI {
    constructor() {
        this.isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
        this.readline = null;
        
        if (this.isNode) {
            const readline = require('readline');
            this.readline = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
        }
    }
    
    async prompt(question) {
        return new Promise((resolve) => {
            if (this.isNode && this.readline) {
                this.readline.question(question, (answer) => {
                    resolve(answer.trim());
                });
            } else {
                const answer = prompt(question);
                resolve(answer ? answer.trim() : '');
            }
        });
    }
    
    async promptNumber(question, min = null, max = null) {
        while (true) {
            const answer = await this.prompt(question);
            const num = parseInt(answer, 10);
            
            if (isNaN(num)) {
                this.print('Please enter a valid number.\n');
                continue;
            }
            
            if (min !== null && num < min) {
                this.print(`Please enter a number at least ${min}.\n`);
                continue;
            }
            
            if (max !== null && num > max) {
                this.print(`Please enter a number no more than ${max}.\n`);
                continue;
            }
            
            return num;
        }
    }
    
    async promptChoice(question, choices) {
        this.print(question + '\n');
        choices.forEach((choice, index) => {
            this.print(`  ${index + 1}. ${choice}\n`);
        });
        
        while (true) {
            const answer = await this.promptNumber(`\nEnter your choice (1-${choices.length}): `, 1, choices.length);
            return answer - 1; // Return 0-based index
        }
    }
    
    print(text) {
        if (this.isNode) {
            process.stdout.write(text);
        } else {
            console.log(text);
        }
    }
    
    printLine(text = '') {
        this.print(text + '\n');
    }
    
    clear() {
        if (this.isNode) {
            process.stdout.write('\x1B[2J\x1B[0f'); // ANSI clear screen
        } else {
            console.clear();
        }
    }
    
    displayGameState(gameState) {
        const { date, locations, party, inventory, milesTraveled, pace, rations } = gameState;
        
        this.clear();
        this.printLine('═══════════════════════════════════════════════════════════');
        this.printLine('                    THE OREGON TRAIL');
        this.printLine('═══════════════════════════════════════════════════════════');
        this.printLine();
        
        // Date and location
        const dateStr = date.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
        this.printLine(`Date: ${dateStr}`);
        this.printLine(`Location: ${locations.getLocationName()}`);
        this.printLine(`Miles Traveled: ${locations.getDistanceTraveled()}`);
        this.printLine(`Miles Remaining: ${locations.getRemainingDistance()}`);
        this.printLine();
        
        // Weather and terrain
        const terrain = locations.getTerrain();
        this.printLine(`Weather: ${gameState.weather}`);
        this.printLine(`Terrain: ${terrain.description}`);
        this.printLine(`Season: ${gameState.season}`);
        this.printLine();
        
        // Party status
        this.printLine('=== PARTY STATUS ===');
        const partyStatus = party.getStatus();
        this.printLine(`Members: ${partyStatus.alive} alive, ${partyStatus.dead} dead`);
        this.printLine(`Average Health: ${partyStatus.averageHealth}%`);
        this.printLine(`Average Stamina: ${partyStatus.averageStamina}%`);
        this.printLine(`Average Morale: ${partyStatus.averageMorale}%`);
        this.printLine();
        
        // Individual members
        partyStatus.members.forEach(member => {
            if (member.alive) {
                let status = `${member.name}: Health ${member.health}%, Stamina ${member.stamina}%, Morale ${member.morale}%`;
                if (member.hunger > 60) {
                    status += ` (HUNGRY: ${member.hunger}%)`;
                }
                if (member.disease) {
                    status += ` [DISEASED: ${member.disease}]`;
                }
                if (member.injury) {
                    status += ` [INJURED: ${member.injury}]`;
                }
                this.printLine(status);
            } else {
                this.printLine(`${member.name}: DEAD`);
            }
        });
        this.printLine();
        
        // Inventory
        this.printLine('=== SUPPLIES ===');
        const invStatus = inventory.getStatus();
        this.printLine(`Food: ${invStatus.food} lbs`);
        this.printLine(`Bullets: ${invStatus.bullets}`);
        this.printLine(`Clothing: ${invStatus.clothing} sets`);
        this.printLine(`Medicine: ${invStatus.medicine} doses`);
        this.printLine();
        this.printLine(`Wagon Condition: ${invStatus.wagonCondition}%`);
        this.printLine(`Oxen: ${invStatus.oxen} (Condition: ${invStatus.oxenCondition}%)`);
        this.printLine(`Spare Parts: ${invStatus.wagonAxles} axles, ${invStatus.wagonWheels} wheels, ${invStatus.wagonTongues} tongues`);
        this.printLine(`Tools: ${invStatus.tools}`);
        this.printLine();
        
        // Current settings
        this.printLine('=== CURRENT SETTINGS ===');
        this.printLine(`Pace: ${pace}`);
        this.printLine(`Rations: ${rations}`);
        this.printLine();
        
        this.printLine('═══════════════════════════════════════════════════════════');
        this.printLine();
    }
    
    displayEvent(event) {
        this.printLine();
        this.printLine('═══════════════════════════════════════════════════════════');
        this.printLine(`                    ${event.name.toUpperCase()}`);
        this.printLine('═══════════════════════════════════════════════════════════');
        this.printLine();
        this.printLine(event.description);
        this.printLine();
    }
    
    displayMessage(message) {
        this.printLine();
        this.printLine(message);
        this.printLine();
    }
    
    displayWin() {
        this.clear();
        this.printLine('═══════════════════════════════════════════════════════════');
        this.printLine('                    CONGRATULATIONS!');
        this.printLine('═══════════════════════════════════════════════════════════');
        this.printLine();
        this.printLine('You have successfully reached Oregon City!');
        this.printLine('Your journey across the Oregon Trail is complete.');
        this.printLine();
        this.printLine('The surviving members of your party can now start');
        this.printLine('their new life in the Oregon Territory.');
        this.printLine();
    }
    
    displayLoss(reason) {
        this.clear();
        this.printLine('═══════════════════════════════════════════════════════════');
        this.printLine('                    GAME OVER');
        this.printLine('═══════════════════════════════════════════════════════════');
        this.printLine();
        this.printLine(`Your journey has ended: ${reason}`);
        this.printLine();
        this.printLine('The Oregon Trail has claimed another group of travelers.');
        this.printLine('Better luck next time!');
        this.printLine();
    }
    
    close() {
        if (this.readline) {
            this.readline.close();
        }
    }
}

