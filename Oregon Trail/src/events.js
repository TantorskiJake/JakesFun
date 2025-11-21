/**
 * Events class - manages random events with weighted probabilities
 */
export class Events {
    constructor() {
        this.eventHistory = [];
    }
    
    /**
     * Get a random event based on current game state
     */
    getRandomEvent(gameState) {
        const { weather, terrain, season, party, inventory, date } = gameState;
        
        // Build weighted event pool
        const events = [];
        
        // Disease events (more likely in bad weather, poor conditions)
        const diseaseChance = this.calculateDiseaseChance(gameState);
        if (diseaseChance > 0) {
            events.push({ type: 'disease', weight: diseaseChance });
        }
        
        // Injury events (more likely with fast pace, difficult terrain)
        const injuryChance = this.calculateInjuryChance(gameState);
        if (injuryChance > 0) {
            events.push({ type: 'injury', weight: injuryChance });
        }
        
        // Wagon damage (more likely with poor condition, difficult terrain)
        const wagonDamageChance = this.calculateWagonDamageChance(gameState);
        if (wagonDamageChance > 0) {
            events.push({ type: 'wagon_damage', weight: wagonDamageChance });
        }
        
        // Environmental events (weather dependent)
        const envChance = this.calculateEnvironmentalChance(gameState);
        if (envChance > 0) {
            events.push({ type: 'environmental', weight: envChance });
        }
        
        // Positive events (less common)
        events.push({ type: 'positive', weight: 5 });
        
        // Bandit events (rare)
        events.push({ type: 'bandit', weight: 3 });
        
        // Select event type
        const selectedType = this.weightedRandom(events);
        
        if (!selectedType) {
            return null; // No event this turn
        }
        
        return this.generateEvent(selectedType, gameState);
    }
    
    calculateDiseaseChance(gameState) {
        let chance = 5; // Base chance
        
        // Weather effects
        if (gameState.weather === 'rain' || gameState.weather === 'snow') {
            chance += 10;
        }
        
        // Season effects
        if (gameState.season === 'winter') {
            chance += 15;
        }
        
        // Health effects
        const avgHealth = gameState.party.getAverageHealth();
        if (avgHealth < 50) {
            chance += 20;
        } else if (avgHealth < 75) {
            chance += 10;
        }
        
        // Hunger effects
        const avgHunger = gameState.party.getAliveMembers().reduce((sum, m) => sum + m.hunger, 0) / 
                         Math.max(1, gameState.party.getAliveMembers().length);
        if (avgHunger > 60) {
            chance += 15;
        }
        
        return Math.min(chance, 50);
    }
    
    calculateInjuryChance(gameState) {
        let chance = 3;
        
        // Pace effects
        if (gameState.pace === 'grueling') {
            chance += 15;
        } else if (gameState.pace === 'strenuous') {
            chance += 8;
        }
        
        // Terrain effects
        if (gameState.terrain.difficulty > 1.5) {
            chance += 10;
        }
        
        // Stamina effects
        const avgStamina = gameState.party.getAverageStamina();
        if (avgStamina < 30) {
            chance += 15;
        }
        
        return Math.min(chance, 40);
    }
    
    calculateWagonDamageChance(gameState) {
        let chance = 2;
        
        // Wagon condition
        if (gameState.inventory.wagonCondition < 50) {
            chance += 20;
        } else if (gameState.inventory.wagonCondition < 75) {
            chance += 10;
        }
        
        // Terrain effects
        if (gameState.terrain.difficulty > 1.5) {
            chance += 8;
        }
        
        // Weather effects
        if (gameState.weather === 'storm') {
            chance += 15;
        }
        
        return Math.min(chance, 35);
    }
    
    calculateEnvironmentalChance(gameState) {
        let chance = 8;
        
        // Season effects
        if (gameState.season === 'summer') {
            chance += 5; // Heat waves
        } else if (gameState.season === 'winter') {
            chance += 10; // Snow storms
        }
        
        return Math.min(chance, 25);
    }
    
    weightedRandom(events) {
        const totalWeight = events.reduce((sum, e) => sum + e.weight, 0);
        if (totalWeight === 0) return null;
        
        let random = Math.random() * totalWeight;
        
        for (const event of events) {
            random -= event.weight;
            if (random <= 0) {
                return event.type;
            }
        }
        
        return null;
    }
    
    generateEvent(type, gameState) {
        switch (type) {
            case 'disease':
                return this.generateDiseaseEvent(gameState);
            case 'injury':
                return this.generateInjuryEvent(gameState);
            case 'wagon_damage':
                return this.generateWagonDamageEvent(gameState);
            case 'environmental':
                return this.generateEnvironmentalEvent(gameState);
            case 'positive':
                return this.generatePositiveEvent(gameState);
            case 'bandit':
                return this.generateBanditEvent(gameState);
            default:
                return null;
        }
    }
    
    generateDiseaseEvent(gameState) {
        const diseases = [
            { name: 'cholera', severity: 'high', healthLoss: 30 },
            { name: 'dysentery', severity: 'medium', healthLoss: 20 },
            { name: 'fever', severity: 'medium', healthLoss: 15 },
            { name: 'measles', severity: 'low', healthLoss: 10 },
            { name: 'typhoid', severity: 'high', healthLoss: 25 }
        ];
        
        const disease = diseases[Math.floor(Math.random() * diseases.length)];
        const victim = this.selectRandomAliveMember(gameState.party);
        
        if (!victim) return null;
        
        return {
            type: 'disease',
            name: `${victim.name} has ${disease.name}!`,
            description: `${victim.name} has come down with ${disease.name}. ${this.getDiseaseDescription(disease.name)}`,
            disease: disease.name,
            victim: victim,
            severity: disease.severity,
            healthLoss: disease.healthLoss,
            requiresMedicine: disease.severity !== 'low',
            choices: [
                { text: 'Continue traveling', effect: () => {
                    victim.setDisease(disease.name);
                    victim.updateHealth(-disease.healthLoss);
                }},
                { text: 'Rest for a day', effect: () => {
                    victim.setDisease(disease.name);
                    victim.updateHealth(-Math.floor(disease.healthLoss * 0.7));
                    gameState.party.updateAllStamina(10);
                }},
                { text: 'Use medicine', effect: () => {
                    if (gameState.inventory.useMedicine(1)) {
                        victim.setDisease(disease.name);
                        victim.updateHealth(-Math.floor(disease.healthLoss * 0.3));
                        victim.cureDisease();
                    } else {
                        victim.setDisease(disease.name);
                        victim.updateHealth(-disease.healthLoss);
                    }
                }, requiresItem: 'medicine'}
            ]
        };
    }
    
    generateInjuryEvent(gameState) {
        const injuries = [
            { name: 'broken leg', severity: 'high', healthLoss: 25, staminaLoss: 30 },
            { name: 'snake bite', severity: 'medium', healthLoss: 20, staminaLoss: 15 },
            { name: 'sprained ankle', severity: 'low', healthLoss: 10, staminaLoss: 20 },
            { name: 'exhaustion', severity: 'medium', healthLoss: 5, staminaLoss: 40 }
        ];
        
        const injury = injuries[Math.floor(Math.random() * injuries.length)];
        const victim = this.selectRandomAliveMember(gameState.party);
        
        if (!victim) return null;
        
        return {
            type: 'injury',
            name: `${victim.name} is injured!`,
            description: `${victim.name} has suffered a ${injury.name}. ${this.getInjuryDescription(injury.name)}`,
            injury: injury.name,
            victim: victim,
            severity: injury.severity,
            healthLoss: injury.healthLoss,
            staminaLoss: injury.staminaLoss,
            choices: [
                { text: 'Continue traveling', effect: () => {
                    victim.setInjury(injury.name);
                    victim.updateHealth(-injury.healthLoss);
                    victim.updateStamina(-injury.staminaLoss);
                }},
                { text: 'Rest for a day', effect: () => {
                    victim.setInjury(injury.name);
                    victim.updateHealth(-Math.floor(injury.healthLoss * 0.6));
                    victim.updateStamina(-Math.floor(injury.staminaLoss * 0.5));
                    gameState.party.updateAllStamina(10);
                }},
                { text: 'Use medicine', effect: () => {
                    if (gameState.inventory.useMedicine(1)) {
                        victim.setInjury(injury.name);
                        victim.updateHealth(-Math.floor(injury.healthLoss * 0.4));
                        victim.updateStamina(-Math.floor(injury.staminaLoss * 0.3));
                        victim.healInjury();
                    } else {
                        victim.setInjury(injury.name);
                        victim.updateHealth(-injury.healthLoss);
                        victim.updateStamina(-injury.staminaLoss);
                    }
                }, requiresItem: 'medicine'}
            ]
        };
    }
    
    generateWagonDamageEvent(gameState) {
        const damages = [
            { part: 'axle', description: 'Your wagon axle has broken!', conditionLoss: 30 },
            { part: 'wheel', description: 'A wagon wheel has broken!', conditionLoss: 25 },
            { part: 'tongue', description: 'The wagon tongue has snapped!', conditionLoss: 20 },
            { part: 'general', description: 'Your wagon has suffered damage!', conditionLoss: 15 }
        ];
        
        const damage = damages[Math.floor(Math.random() * damages.length)];
        
        return {
            type: 'wagon_damage',
            name: 'Wagon Damage!',
            description: damage.description,
            part: damage.part,
            conditionLoss: damage.conditionLoss,
            choices: [
                { text: 'Continue with damaged wagon', effect: () => {
                    gameState.inventory.damageWagon(damage.conditionLoss);
                }},
                { text: `Replace ${damage.part}`, effect: () => {
                    if (gameState.inventory.useWagonPart(damage.part)) {
                        // Replacing the broken part prevents damage and slightly improves condition
                        gameState.inventory.repairWagon(5);
                    } else {
                        // If part replacement fails, take full damage
                        gameState.inventory.damageWagon(damage.conditionLoss);
                    }
                }, requiresItem: damage.part},
                { text: 'Use tools to repair', effect: () => {
                    if (gameState.inventory.useTools(1)) {
                        // Using tools prevents damage and repairs the wagon
                        gameState.inventory.repairWagon(10);
                    } else {
                        // If tools aren't available, take full damage
                        gameState.inventory.damageWagon(damage.conditionLoss);
                    }
                }, requiresItem: 'tools'}
            ]
        };
    }
    
    generateEnvironmentalEvent(gameState) {
        const events = [];
        
        if (gameState.season === 'summer') {
            events.push({
                name: 'Heat Wave',
                description: 'A scorching heat wave has hit! Everyone is exhausted.',
                effect: () => {
                    gameState.party.updateAllStamina(-20);
                    gameState.party.updateAllHealth(-5);
                }
            });
        }
        
        if (gameState.season === 'winter' || gameState.weather === 'snow') {
            events.push({
                name: 'Blizzard',
                description: 'A fierce blizzard has struck! Travel is difficult and dangerous.',
                effect: () => {
                    gameState.party.updateAllStamina(-30);
                    gameState.party.updateAllHealth(-10);
                    gameState.inventory.damageWagon(10);
                }
            });
        }
        
        events.push({
            name: 'Heavy Rain',
            description: 'Heavy rain has made the trail muddy and difficult.',
            effect: () => {
                gameState.party.updateAllStamina(-15);
                gameState.inventory.damageWagon(5);
            }
        });
        
        events.push({
            name: 'Strong Winds',
            description: 'Strong winds are slowing your progress.',
            effect: () => {
                gameState.party.updateAllStamina(-10);
            }
        });
        
        const event = events[Math.floor(Math.random() * events.length)];
        
        return {
            type: 'environmental',
            name: event.name,
            description: event.description,
            choices: [
                { text: 'Continue through the weather', effect: event.effect },
                { text: 'Wait for better conditions', effect: () => {
                    gameState.party.updateAllStamina(5);
                }}
            ]
        };
    }
    
    generatePositiveEvent(gameState) {
        const events = [
            {
                name: 'Wild Berries Found',
                description: 'You found wild berries along the trail!',
                effect: () => {
                    const foodFound = Math.floor(Math.random() * 50) + 20;
                    gameState.inventory.addFood(foodFound);
                    gameState.party.updateAllMorale(5);
                }
            },
            {
                name: 'Friendly Travelers',
                description: 'You met friendly travelers who shared supplies with you.',
                effect: () => {
                    gameState.inventory.addFood(Math.floor(Math.random() * 30) + 10);
                    gameState.party.updateAllMorale(10);
                }
            },
            {
                name: 'Good Weather',
                description: 'Perfect weather conditions make for easy traveling.',
                effect: () => {
                    gameState.party.updateAllStamina(15);
                    gameState.party.updateAllMorale(5);
                }
            },
            {
                name: 'Wagon Repair Opportunity',
                description: 'You found materials to repair your wagon.',
                effect: () => {
                    gameState.inventory.repairWagon(Math.floor(Math.random() * 20) + 10);
                    gameState.inventory.addTools(1);
                }
            }
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        
        return {
            type: 'positive',
            name: event.name,
            description: event.description,
            choices: [
                { text: 'Continue', effect: event.effect }
            ]
        };
    }
    
    generateBanditEvent(gameState) {
        return {
            type: 'bandit',
            name: 'Bandit Encounter!',
            description: 'Bandits have appeared on the trail ahead!',
            choices: [
                { text: 'Fight them off', effect: () => {
                    if (gameState.inventory.bullets >= 20) {
                        gameState.inventory.useBullets(20);
                        gameState.party.updateAllMorale(5);
                    } else {
                        const foodLost = Math.floor(gameState.inventory.food * 0.3);
                        gameState.inventory.consumeFood(foodLost);
                        gameState.party.updateAllMorale(-10);
                    }
                }},
                { text: 'Give them supplies', effect: () => {
                    const foodLost = Math.floor(gameState.inventory.food * 0.2);
                    gameState.inventory.consumeFood(foodLost);
                    gameState.party.updateAllMorale(-5);
                }},
                { text: 'Try to outrun them', effect: () => {
                    if (Math.random() > 0.4) {
                        gameState.party.updateAllStamina(-15);
                    } else {
                        const foodLost = Math.floor(gameState.inventory.food * 0.25);
                        gameState.inventory.consumeFood(foodLost);
                        gameState.party.updateAllStamina(-20);
                    }
                }}
            ]
        };
    }
    
    selectRandomAliveMember(party) {
        const alive = party.getAliveMembers();
        if (alive.length === 0) return null;
        return alive[Math.floor(Math.random() * alive.length)];
    }
    
    getDiseaseDescription(disease) {
        const descriptions = {
            'cholera': 'This is a serious illness that requires rest and medicine.',
            'dysentery': 'This illness causes severe dehydration and weakness.',
            'fever': 'High fever makes travel difficult.',
            'measles': 'A common but uncomfortable illness.',
            'typhoid': 'A dangerous fever that can be fatal if untreated.'
        };
        return descriptions[disease] || 'This illness requires attention.';
    }
    
    getInjuryDescription(injury) {
        const descriptions = {
            'broken leg': 'This is a serious injury that will slow travel significantly.',
            'snake bite': 'A venomous bite that requires immediate attention.',
            'sprained ankle': 'Painful but manageable with rest.',
            'exhaustion': 'Complete exhaustion from overexertion.'
        };
        return descriptions[injury] || 'This injury needs care.';
    }
}

