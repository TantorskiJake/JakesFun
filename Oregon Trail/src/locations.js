/**
 * Locations class - manages landmarks, distances, and special location events
 */
export class Locations {
    constructor() {
        this.locations = [
            { name: 'Independence, Missouri', miles: 0, type: 'start' },
            { name: 'Kansas River', miles: 102, type: 'river' },
            { name: 'Big Blue River', miles: 185, type: 'river' },
            { name: 'Fort Kearny', miles: 304, type: 'fort' },
            { name: 'Chimney Rock', miles: 550, type: 'landmark' },
            { name: 'Fort Laramie', miles: 640, type: 'fort' },
            { name: 'Independence Rock', miles: 828, type: 'landmark' },
            { name: 'South Pass', miles: 932, type: 'landmark' },
            { name: 'Snake River', miles: 1200, type: 'river' },
            { name: 'Fort Boise', miles: 1350, type: 'fort' },
            { name: 'Blue Mountains', miles: 1600, type: 'landmark' },
            { name: 'The Dalles', miles: 1800, type: 'landmark' },
            { name: 'Oregon City', miles: 2040, type: 'end' }
        ];
        
        this.currentLocationIndex = 0;
    }
    
    getCurrentLocation() {
        return this.locations[this.currentLocationIndex];
    }
    
    getNextLocation() {
        if (this.currentLocationIndex < this.locations.length - 1) {
            return this.locations[this.currentLocationIndex + 1];
        }
        return null;
    }
    
    getDistanceToNext() {
        const current = this.getCurrentLocation();
        const next = this.getNextLocation();
        if (!next) return 0;
        return next.miles - current.miles;
    }
    
    getTotalDistance() {
        return this.locations[this.locations.length - 1].miles;
    }
    
    getDistanceTraveled() {
        return this.getCurrentLocation().miles;
    }
    
    getRemainingDistance() {
        return this.getTotalDistance() - this.getDistanceTraveled();
    }
    
    advanceLocation(milesTraveled) {
        const currentMiles = this.getCurrentLocation().miles;
        const newMiles = currentMiles + milesTraveled;
        
        // Check if we've reached the next location
        while (this.currentLocationIndex < this.locations.length - 1) {
            const nextLocation = this.locations[this.currentLocationIndex + 1];
            if (newMiles >= nextLocation.miles) {
                this.currentLocationIndex++;
            } else {
                break;
            }
        }
        
        return this.getCurrentLocation();
    }
    
    isAtLocation(locationName) {
        return this.getCurrentLocation().name === locationName;
    }
    
    isAtRiver() {
        return this.getCurrentLocation().type === 'river';
    }
    
    isAtFort() {
        return this.getCurrentLocation().type === 'fort';
    }
    
    isAtEnd() {
        return this.getCurrentLocation().type === 'end';
    }
    
    getLocationType() {
        return this.getCurrentLocation().type;
    }
    
    getLocationName() {
        return this.getCurrentLocation().name;
    }
    
    getTerrain() {
        const miles = this.getDistanceTraveled();
        
        if (miles < 300) {
            return { type: 'plains', difficulty: 1, description: 'Rolling Plains' };
        } else if (miles < 600) {
            return { type: 'prairie', difficulty: 1.2, description: 'Prairie' };
        } else if (miles < 900) {
            return { type: 'foothills', difficulty: 1.5, description: 'Foothills' };
        } else if (miles < 1200) {
            return { type: 'mountains', difficulty: 2, description: 'Mountain Passes' };
        } else if (miles < 1800) {
            return { type: 'desert', difficulty: 1.8, description: 'Desert' };
        } else {
            return { type: 'forest', difficulty: 1.3, description: 'Dense Forest' };
        }
    }
    
    getSeason(date) {
        // Assuming start date is around March 1, 1848
        const month = date.getMonth(); // 0-11
        if (month >= 2 && month < 5) return 'spring';
        if (month >= 5 && month < 8) return 'summer';
        if (month >= 8 && month < 11) return 'fall';
        return 'winter';
    }
    
    toJSON() {
        return {
            currentLocationIndex: this.currentLocationIndex
        };
    }
    
    static fromJSON(data) {
        const locations = new Locations();
        locations.currentLocationIndex = data.currentLocationIndex || 0;
        return locations;
    }
}

