/**
 * Inventory class - manages all items, supplies, and wagon condition
 */
export class Inventory {
    constructor() {
        // Food and supplies
        this.food = 0; // pounds
        this.bullets = 0;
        this.clothing = 0; // sets
        this.medicine = 0; // doses
        
        // Wagon parts
        this.wagonAxles = 1; // spare axles
        this.wagonWheels = 1; // spare wheels
        this.wagonTongues = 1; // spare tongues
        
        // Tools
        this.tools = 0; // repair kits
        
        // Wagon condition (0-100)
        this.wagonCondition = 100;
        
        // Oxen
        this.oxen = 0; // number of oxen
        this.oxenCondition = 100; // 0-100
    }
    
    addFood(amount) {
        this.food += amount;
    }
    
    consumeFood(amount) {
        const consumed = Math.min(amount, this.food);
        this.food -= consumed;
        return consumed;
    }
    
    addBullets(amount) {
        this.bullets += amount;
    }
    
    useBullets(amount) {
        if (this.bullets >= amount) {
            this.bullets -= amount;
            return true;
        }
        return false;
    }
    
    addClothing(amount) {
        this.clothing += amount;
    }
    
    useClothing(amount) {
        if (this.clothing >= amount) {
            this.clothing -= amount;
            return true;
        }
        return false;
    }
    
    addMedicine(amount) {
        this.medicine += amount;
    }
    
    useMedicine(amount = 1) {
        if (this.medicine >= amount) {
            this.medicine -= amount;
            return true;
        }
        return false;
    }
    
    addWagonPart(part, amount = 1) {
        if (part === 'axle') {
            this.wagonAxles += amount;
        } else if (part === 'wheel') {
            this.wagonWheels += amount;
        } else if (part === 'tongue') {
            this.wagonTongues += amount;
        }
    }
    
    useWagonPart(part) {
        if (part === 'axle') {
            if (this.wagonAxles > 0) {
                this.wagonAxles--;
                return true;
            }
        } else if (part === 'wheel') {
            if (this.wagonWheels > 0) {
                this.wagonWheels--;
                return true;
            }
        } else if (part === 'tongue') {
            if (this.wagonTongues > 0) {
                this.wagonTongues--;
                return true;
            }
        }
        return false;
    }
    
    addTools(amount) {
        this.tools += amount;
    }
    
    useTools(amount = 1) {
        if (this.tools >= amount) {
            this.tools -= amount;
            return true;
        }
        return false;
    }
    
    damageWagon(amount) {
        this.wagonCondition = Math.max(0, this.wagonCondition - amount);
    }
    
    repairWagon(amount) {
        // Ensure amount is positive
        const repairAmount = Math.abs(amount);
        // Add to condition, cap at 100
        this.wagonCondition = Math.min(100, this.wagonCondition + repairAmount);
    }
    
    addOxen(amount) {
        this.oxen += amount;
    }
    
    damageOxen(amount) {
        this.oxenCondition = Math.max(0, this.oxenCondition - amount);
        if (this.oxenCondition <= 0 && this.oxen > 0) {
            this.oxen--;
            this.oxenCondition = 100; // Reset condition for remaining oxen
        }
    }
    
    healOxen(amount) {
        this.oxenCondition = Math.min(100, this.oxenCondition + amount);
    }
    
    hasWorkingWagon() {
        return this.wagonCondition > 0 && this.oxen > 0;
    }
    
    getStatus() {
        return {
            food: this.food,
            bullets: this.bullets,
            clothing: this.clothing,
            medicine: this.medicine,
            wagonAxles: this.wagonAxles,
            wagonWheels: this.wagonWheels,
            wagonTongues: this.wagonTongues,
            tools: this.tools,
            wagonCondition: this.wagonCondition,
            oxen: this.oxen,
            oxenCondition: this.oxenCondition
        };
    }
    
    toJSON() {
        return {
            food: this.food,
            bullets: this.bullets,
            clothing: this.clothing,
            medicine: this.medicine,
            wagonAxles: this.wagonAxles,
            wagonWheels: this.wagonWheels,
            wagonTongues: this.wagonTongues,
            tools: this.tools,
            wagonCondition: this.wagonCondition,
            oxen: this.oxen,
            oxenCondition: this.oxenCondition
        };
    }
    
    static fromJSON(data) {
        const inventory = new Inventory();
        inventory.food = data.food || 0;
        inventory.bullets = data.bullets || 0;
        inventory.clothing = data.clothing || 0;
        inventory.medicine = data.medicine || 0;
        inventory.wagonAxles = data.wagonAxles || 0;
        inventory.wagonWheels = data.wagonWheels || 0;
        inventory.wagonTongues = data.wagonTongues || 0;
        inventory.tools = data.tools || 0;
        inventory.wagonCondition = data.wagonCondition || 100;
        inventory.oxen = data.oxen || 0;
        inventory.oxenCondition = data.oxenCondition || 100;
        return inventory;
    }
}

