/**
 * Player class - manages individual player stats and state
 */
export class Player {
    constructor(name, profession = 'farmer') {
        this.name = name;
        this.profession = profession;
        this.health = 100;
        this.stamina = 100;
        this.morale = 100;
        this.hunger = 0; // 0 = well-fed, 100 = starving
        this.disease = null; // null or disease name
        this.injury = null; // null or injury name
        this.alive = true;
        
        // Profession bonuses
        this.setProfessionStats(profession);
    }
    
    setProfessionStats(profession) {
        const bonuses = {
            'farmer': { health: 10, stamina: 5, morale: 0 },
            'carpenter': { health: 5, stamina: 10, morale: 5 },
            'banker': { health: 0, stamina: 0, morale: 20 },
            'doctor': { health: 15, stamina: 0, morale: 10 },
            'hunter': { health: 5, stamina: 15, morale: 0 }
        };
        
        const bonus = bonuses[profession] || bonuses['farmer'];
        this.health = Math.min(100, this.health + bonus.health);
        this.stamina = Math.min(100, this.stamina + bonus.stamina);
        this.morale = Math.min(100, this.morale + bonus.morale);
    }
    
    updateHealth(amount) {
        this.health = Math.max(0, Math.min(100, this.health + amount));
        if (this.health <= 0) {
            this.alive = false;
        }
    }
    
    updateStamina(amount) {
        this.stamina = Math.max(0, Math.min(100, this.stamina + amount));
    }
    
    updateMorale(amount) {
        this.morale = Math.max(0, Math.min(100, this.morale + amount));
    }
    
    updateHunger(amount) {
        this.hunger = Math.max(0, Math.min(100, this.hunger + amount));
        if (this.hunger > 80) {
            this.updateHealth(-2);
        } else if (this.hunger > 60) {
            this.updateHealth(-1);
        }
    }
    
    setDisease(diseaseName) {
        this.disease = diseaseName;
    }
    
    setInjury(injuryName) {
        this.injury = injuryName;
    }
    
    cureDisease() {
        this.disease = null;
    }
    
    healInjury() {
        this.injury = null;
    }
    
    getStatus() {
        const status = {
            name: this.name,
            health: this.health,
            stamina: this.stamina,
            morale: this.morale,
            hunger: this.hunger,
            alive: this.alive
        };
        
        if (this.disease) status.disease = this.disease;
        if (this.injury) status.injury = this.injury;
        
        return status;
    }
    
    toJSON() {
        return {
            name: this.name,
            profession: this.profession,
            health: this.health,
            stamina: this.stamina,
            morale: this.morale,
            hunger: this.hunger,
            disease: this.disease,
            injury: this.injury,
            alive: this.alive
        };
    }
    
    static fromJSON(data) {
        const player = new Player(data.name, data.profession);
        player.health = data.health;
        player.stamina = data.stamina;
        player.morale = data.morale;
        player.hunger = data.hunger;
        player.disease = data.disease;
        player.injury = data.injury;
        player.alive = data.alive;
        return player;
    }
}

