/**
 * Store class - manages purchasing supplies at the start and at forts
 */
export class Store {
    constructor() {
        this.items = {
            food: { name: 'Food (per pound)', price: 0.20, unit: 'pound' },
            bullets: { name: 'Bullets (per box of 20)', price: 2.00, unit: 'box' },
            clothing: { name: 'Clothing (per set)', price: 10.00, unit: 'set' },
            oxen: { name: 'Oxen (per pair)', price: 40.00, unit: 'pair' },
            wagonAxles: { name: 'Wagon Axle', price: 10.00, unit: 'each' },
            wagonWheels: { name: 'Wagon Wheel', price: 10.00, unit: 'each' },
            wagonTongues: { name: 'Wagon Tongue', price: 10.00, unit: 'each' },
            tools: { name: 'Repair Kit', price: 10.00, unit: 'each' },
            medicine: { name: 'Medicine (per dose)', price: 2.50, unit: 'dose' }
        };
        
        this.startingBudget = 800.00;
    }
    
    getItemPrice(itemName, quantity = 1) {
        const item = this.items[itemName];
        if (!item) return 0;
        return item.price * quantity;
    }
    
    getItemInfo(itemName) {
        return this.items[itemName];
    }
    
    getAllItems() {
        return Object.keys(this.items);
    }
    
    formatPrice(price) {
        return `$${price.toFixed(2)}`;
    }
    
    canAfford(itemName, quantity, budget) {
        return this.getItemPrice(itemName, quantity) <= budget;
    }
    
    purchase(itemName, quantity, inventory) {
        const item = this.items[itemName];
        if (!item) return { success: false, message: 'Invalid item' };
        
        const cost = this.getItemPrice(itemName, quantity);
        
        switch (itemName) {
            case 'food':
                inventory.addFood(quantity);
                break;
            case 'bullets':
                inventory.addBullets(quantity * 20); // Box of 20
                break;
            case 'clothing':
                inventory.addClothing(quantity);
                break;
            case 'oxen':
                inventory.addOxen(quantity * 2); // Pair = 2 oxen
                break;
            case 'wagonAxles':
                inventory.addWagonPart('axle', quantity);
                break;
            case 'wagonWheels':
                inventory.addWagonPart('wheel', quantity);
                break;
            case 'wagonTongues':
                inventory.addWagonPart('tongue', quantity);
                break;
            case 'tools':
                inventory.addTools(quantity);
                break;
            case 'medicine':
                inventory.addMedicine(quantity);
                break;
            default:
                return { success: false, message: 'Unknown item' };
        }
        
        return { success: true, cost: cost };
    }
    
    getStartingBudget() {
        return this.startingBudget;
    }
    
    getStoreDisplay(budget) {
        let display = '\n=== GENERAL STORE ===\n\n';
        display += `You have ${this.formatPrice(budget)} to spend.\n\n`;
        display += 'Available Items:\n';
        display += '-------------------\n';
        
        for (const [key, item] of Object.entries(this.items)) {
            const canAfford = this.canAfford(key, 1, budget);
            const status = canAfford ? '' : ' (CANNOT AFFORD)';
            display += `${key.padEnd(15)} - ${item.name.padEnd(30)} ${this.formatPrice(item.price)}${status}\n`;
        }
        
        display += '\n';
        return display;
    }
}

