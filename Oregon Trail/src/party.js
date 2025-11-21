import { Player } from './player.js';

/**
 * Party class - manages the group of travelers
 */
export class Party {
    constructor() {
        this.members = [];
        this.leader = null;
    }
    
    addMember(name, profession = 'farmer') {
        const member = new Player(name, profession);
        this.members.push(member);
        if (this.members.length === 1) {
            this.leader = member;
        }
        return member;
    }
    
    removeMember(member) {
        const index = this.members.indexOf(member);
        if (index > -1) {
            this.members.splice(index, 1);
            if (this.leader === member && this.members.length > 0) {
                this.leader = this.members[0];
            }
        }
    }
    
    getAliveMembers() {
        return this.members.filter(m => m.alive);
    }
    
    getDeadMembers() {
        return this.members.filter(m => !m.alive);
    }
    
    hasAliveMembers() {
        return this.getAliveMembers().length > 0;
    }
    
    getAverageHealth() {
        const alive = this.getAliveMembers();
        if (alive.length === 0) return 0;
        const sum = alive.reduce((acc, m) => acc + m.health, 0);
        return Math.round(sum / alive.length);
    }
    
    getAverageStamina() {
        const alive = this.getAliveMembers();
        if (alive.length === 0) return 0;
        const sum = alive.reduce((acc, m) => acc + m.stamina, 0);
        return Math.round(sum / alive.length);
    }
    
    getAverageMorale() {
        const alive = this.getAliveMembers();
        if (alive.length === 0) return 0;
        const sum = alive.reduce((acc, m) => acc + m.morale, 0);
        return Math.round(sum / alive.length);
    }
    
    updateAllHunger(amount) {
        this.getAliveMembers().forEach(member => {
            member.updateHunger(amount);
        });
    }
    
    updateAllStamina(amount) {
        this.getAliveMembers().forEach(member => {
            member.updateStamina(amount);
        });
    }
    
    updateAllMorale(amount) {
        this.getAliveMembers().forEach(member => {
            member.updateMorale(amount);
        });
    }
    
    updateAllHealth(amount) {
        console.log(`[PARTY] updateAllHealth(${amount}) called for ${this.getAliveMembers().length} members`);
        this.getAliveMembers().forEach(member => {
            const before = member.health;
            member.updateHealth(amount);
            const after = member.health;
            console.log(`[PARTY] ${member.name}: health ${before} -> ${after} (${amount > 0 ? '+' : ''}${amount})`);
        });
    }
    
    getStatus() {
        return {
            total: this.members.length,
            alive: this.getAliveMembers().length,
            dead: this.getDeadMembers().length,
            averageHealth: this.getAverageHealth(),
            averageStamina: this.getAverageStamina(),
            averageMorale: this.getAverageMorale(),
            members: this.members.map(m => m.getStatus())
        };
    }
    
    toJSON() {
        return {
            members: this.members.map(m => m.toJSON()),
            leaderIndex: this.members.indexOf(this.leader)
        };
    }
    
    static fromJSON(data) {
        const party = new Party();
        party.members = data.members.map(m => Player.fromJSON(m));
        if (data.leaderIndex !== undefined && data.leaderIndex >= 0) {
            party.leader = party.members[data.leaderIndex];
        } else if (party.members.length > 0) {
            party.leader = party.members[0];
        }
        return party;
    }
}

