/**
 * BrowserUI class - handles text display and user input in browser
 */
export class BrowserUI {
    constructor() {
        this.isNode = false; // Always false for browser
        this.outputElement = document.getElementById('game-output');
        this.promptContainer = document.getElementById('prompt-container');
        this.inputContainer = document.getElementById('input-container');
        this.textInput = document.getElementById('text-input');
        this.submitBtn = document.getElementById('submit-btn');
        this.choiceContainer = document.getElementById('choice-container');
        
        // Setup event listeners
        this.submitBtn.addEventListener('click', () => this.handleSubmit());
        this.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSubmit();
            }
        });
        
        // Focus input when shown
        this.textInput.addEventListener('focus', () => {
            this.textInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }
    
    async prompt(question) {
        return new Promise((resolve) => {
            this.showPrompt(question);
            this.showTextInput();
            this.hideChoices();
            
            const handleSubmit = () => {
                const answer = this.textInput.value.trim();
                this.textInput.value = '';
                this.hideTextInput();
                this.hidePrompt();
                this.submitBtn.removeEventListener('click', handleSubmit);
                this.textInput.removeEventListener('keypress', handleKeyPress);
                resolve(answer);
            };
            
            const handleKeyPress = (e) => {
                if (e.key === 'Enter') {
                    handleSubmit();
                }
            };
            
            this.submitBtn.addEventListener('click', handleSubmit);
            this.textInput.addEventListener('keypress', handleKeyPress);
            this.textInput.focus();
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
            this.showPrompt(question);
            this.hideTextInput();
            this.showChoices(choices);
            
            const handleChoice = (index) => {
                this.hideChoices();
                this.hidePrompt();
                choices.forEach((_, i) => {
                    const btn = document.getElementById(`choice-${i}`);
                    if (btn) {
                        btn.removeEventListener('click', () => handleChoice(i));
                    }
                });
                resolve(index);
            };
            
            choices.forEach((choice, index) => {
                const btn = document.createElement('button');
                btn.id = `choice-${index}`;
                btn.className = 'choice-btn';
                btn.textContent = `${index + 1}. ${choice}`;
                btn.addEventListener('click', () => handleChoice(index));
                this.choiceContainer.appendChild(btn);
            });
        });
    }
    
    print(text) {
        if (this.outputElement) {
            // Handle newlines in text
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
        } else {
            console.log(text);
        }
    }
    
    printLine(text = '', className = '') {
        if (this.outputElement) {
            const line = document.createElement('div');
            line.className = `line ${className}`;
            
            // Check for special formatting
            if (text.includes('═══')) {
                line.className += ' header';
            } else if (text.startsWith('===')) {
                line.className += ' section';
            } else if (text.includes('DEAD') || text.includes('died') || text.includes('GAME OVER')) {
                line.className += ' warning';
            } else if (text.includes('successfully') || text.includes('Congratulations')) {
                line.className += ' success';
            } else if (text.includes('Location:') || text.includes('Date:')) {
                line.className += ' info';
            }
            
            line.textContent = text;
            this.outputElement.appendChild(line);
            this.scrollToBottom();
        } else {
            console.log(text);
        }
    }
    
    clear() {
        if (this.outputElement) {
            this.outputElement.innerHTML = '';
        } else {
            console.clear();
        }
    }
    
    showPrompt(text) {
        if (this.promptContainer) {
            this.promptContainer.textContent = text;
            this.promptContainer.style.display = 'block';
            this.promptContainer.style.color = '#ffd700';
            this.promptContainer.style.fontWeight = 'bold';
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
            this.textInput.focus();
        }
    }
    
    hideTextInput() {
        if (this.inputContainer) {
            this.inputContainer.style.display = 'none';
        }
    }
    
    showChoices(choices) {
        if (this.choiceContainer) {
            this.choiceContainer.style.display = 'flex';
            this.choiceContainer.innerHTML = ''; // Clear previous choices
        }
    }
    
    hideChoices() {
        if (this.choiceContainer) {
            this.choiceContainer.style.display = 'none';
            this.choiceContainer.innerHTML = '';
        }
    }
    
    handleSubmit() {
        // This is handled in the prompt method
    }
    
    scrollToBottom() {
        if (this.outputElement) {
            this.outputElement.scrollTop = this.outputElement.scrollHeight;
        }
    }
    
    displayGameState(gameState) {
        this.clear();
        const { date, locations, party, inventory, milesTraveled, pace, rations } = gameState;
        
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
                this.printLine(`${member.name}: DEAD`, 'warning');
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
        const paceDisplay = pace.charAt(0).toUpperCase() + pace.slice(1);
        const rationsDisplay = rations === 'barebones' ? 'Bare Bones' : (rations.charAt(0).toUpperCase() + rations.slice(1));
        this.printLine(`Pace: ${paceDisplay}`);
        this.printLine(`Rations: ${rationsDisplay}`);
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
        // Browser doesn't need to close anything
    }
}

