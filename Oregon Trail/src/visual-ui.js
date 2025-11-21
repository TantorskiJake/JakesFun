/**
 * Enhanced Visual UI components for Oregon Trail
 */
export class VisualUI {
    constructor() {
        this.outputElement = document.getElementById('game-output');
        this.promptContainer = document.getElementById('prompt-container');
        this.inputContainer = document.getElementById('input-container');
        this.textInput = document.getElementById('text-input');
        this.submitBtn = document.getElementById('submit-btn');
        this.choiceContainer = document.getElementById('choice-container');
        this.isNode = false;
    }
    
    createProgressBar(value, max = 100, color = '#51cf66') {
        const percentage = Math.min(100, Math.max(0, (value / max) * 100));
        const bar = document.createElement('div');
        bar.className = 'progress-bar-container';
        bar.innerHTML = `
            <div class="progress-bar-fill" style="width: ${percentage}%; background: ${color};"></div>
            <span class="progress-bar-text">${Math.round(value)}/${max}</span>
        `;
        return bar;
    }
    
    createStatCard(title, value, icon, color = '#74c0fc') {
        const card = document.createElement('div');
        card.className = 'stat-card';
        card.innerHTML = `
            <div class="stat-icon" style="color: ${color};">${icon}</div>
            <div class="stat-content">
                <div class="stat-title">${title}</div>
                <div class="stat-value" style="color: ${color};">${value}</div>
            </div>
        `;
        return card;
    }
    
    createPartyMemberCard(member) {
        const card = document.createElement('div');
        card.className = `party-member-card ${!member.alive ? 'dead' : ''}`;
        
        const healthColor = member.health > 75 ? '#51cf66' : member.health > 50 ? '#ffd700' : member.health > 25 ? '#ff9800' : '#ff6b6b';
        const staminaColor = member.stamina > 50 ? '#74c0fc' : '#ff6b6b';
        const moraleColor = member.morale > 50 ? '#9c27b0' : '#ff6b6b';
        
        let statusBadges = [];
        if (member.disease) statusBadges.push(`<span class="status-badge">🦠 ${member.disease}</span>`);
        if (member.injury) statusBadges.push(`<span class="status-badge">🩹 ${member.injury}</span>`);
        if (member.hunger > 60) statusBadges.push(`<span class="status-badge">🍽️ Hungry</span>`);
        
        card.innerHTML = `
            <div class="member-header">
                <div class="member-name">${member.name}</div>
                ${!member.alive ? '<span class="dead-badge">💀</span>' : ''}
            </div>
            ${statusBadges.length > 0 ? `<div class="status-badges">${statusBadges.join('')}</div>` : ''}
            <div class="member-stats">
                <div class="stat-row">
                    <span class="progress-label">❤️</span>
                    ${this.createProgressBar(member.health, 100, healthColor).outerHTML}
                </div>
                <div class="stat-row">
                    <span class="progress-label">⚡</span>
                    ${this.createProgressBar(member.stamina, 100, staminaColor).outerHTML}
                </div>
                <div class="stat-row">
                    <span class="progress-label">😊</span>
                    ${this.createProgressBar(member.morale, 100, moraleColor).outerHTML}
                </div>
            </div>
        `;
        return card;
    }
    
    createInventoryCard(inventory) {
        const card = document.createElement('div');
        card.className = 'inventory-card';
        
        const wagonColor = inventory.wagonCondition > 75 ? '#51cf66' : inventory.wagonCondition > 50 ? '#ffd700' : '#ff6b6b';
        const oxenColor = inventory.oxenCondition > 75 ? '#51cf66' : inventory.oxenCondition > 50 ? '#ffd700' : '#ff6b6b';
        
        card.innerHTML = `
            <h3 class="card-title">📦 Supplies</h3>
            <div class="inventory-grid">
                <div class="inventory-item">
                    <span class="item-icon">🌾</span>
                    <span class="item-name">Food</span>
                    <span class="item-value">${inventory.food} lbs</span>
                </div>
                <div class="inventory-item">
                    <span class="item-icon">🔫</span>
                    <span class="item-name">Bullets</span>
                    <span class="item-value">${inventory.bullets}</span>
                </div>
                <div class="inventory-item">
                    <span class="item-icon">👕</span>
                    <span class="item-name">Clothing</span>
                    <span class="item-value">${inventory.clothing} sets</span>
                </div>
                <div class="inventory-item">
                    <span class="item-icon">💊</span>
                    <span class="item-name">Medicine</span>
                    <span class="item-value">${inventory.medicine} doses</span>
                </div>
                <div class="inventory-item">
                    <span class="item-icon">🔧</span>
                    <span class="item-name">Tools</span>
                    <span class="item-value">${inventory.tools}</span>
                </div>
            </div>
            <div class="wagon-section">
                <h4>🚛 Wagon</h4>
                <div class="stat-row">
                    <span class="stat-label">Condition</span>
                    ${this.createProgressBar(inventory.wagonCondition, 100, wagonColor).outerHTML}
                </div>
                <div class="stat-row">
                    <span class="stat-label">Oxen (${inventory.oxen})</span>
                    ${this.createProgressBar(inventory.oxenCondition, 100, oxenColor).outerHTML}
                </div>
                <div class="spare-parts">
                    <span>🔩 Axles: ${inventory.wagonAxles}</span>
                    <span>⚙️ Wheels: ${inventory.wagonWheels}</span>
                    <span>🔗 Tongues: ${inventory.wagonTongues}</span>
                </div>
            </div>
        `;
        return card;
    }
    
    createTrailProgress(currentMiles, totalMiles, currentLocation) {
        const percentage = (currentMiles / totalMiles) * 100;
        const progress = document.createElement('div');
        progress.className = 'trail-progress';
        progress.innerHTML = `
            <div class="trail-header">
                <h3>🗺️ Trail Progress</h3>
                <span class="location-name">📍 ${currentLocation}</span>
            </div>
            <div class="trail-bar-container">
                <div class="trail-bar-fill" style="width: ${percentage}%"></div>
                <div class="trail-marker" style="left: ${percentage}%"></div>
            </div>
            <div class="trail-stats">
                <span>${currentMiles} / ${totalMiles} miles</span>
                <span>${Math.round(100 - percentage)}% remaining</span>
            </div>
        `;
        return progress;
    }
    
    createWeatherCard(weather, season, terrain) {
        const weatherIcons = {
            'clear': '☀️',
            'rain': '🌧️',
            'storm': '⛈️',
            'snow': '❄️'
        };
        
        const seasonIcons = {
            'spring': '🌸',
            'summer': '☀️',
            'fall': '🍂',
            'winter': '❄️'
        };
        
        const card = document.createElement('div');
        card.className = 'weather-card';
        card.innerHTML = `
            <div class="weather-icon">${weatherIcons[weather] || '🌤️'}</div>
            <div class="weather-info">
                <div class="weather-type">${weather.charAt(0).toUpperCase() + weather.slice(1)}</div>
                <div class="weather-details">
                    <span>${seasonIcons[season] || '📅'} ${season}</span>
                    <span>🏔️ ${terrain.description}</span>
                </div>
            </div>
        `;
        return card;
    }
    
    createSettingsCard(pace, rations) {
        const card = document.createElement('div');
        card.className = 'settings-card';
        
        const paceIcons = {
            'rest': '😴',
            'slow': '🚶',
            'normal': '🚶‍♂️',
            'strenuous': '🏃',
            'grueling': '🏃‍♂️'
        };
        
        const rationIcons = {
            'filling': '🍖',
            'normal': '🍗',
            'meager': '🥩',
            'barebones': '🦴'
        };
        
        card.innerHTML = `
            <h3 class="card-title">⚙️ Current Settings</h3>
            <div class="settings-grid">
                <div class="setting-item">
                    <span class="setting-icon">${paceIcons[pace] || '🚶'}</span>
                    <div class="setting-info">
                        <div class="setting-label">Pace</div>
                        <div class="setting-value">${pace.charAt(0).toUpperCase() + pace.slice(1)}</div>
                    </div>
                </div>
                <div class="setting-item">
                    <span class="setting-icon">${rationIcons[rations] || '🍗'}</span>
                    <div class="setting-info">
                        <div class="setting-label">Rations</div>
                        <div class="setting-value">${rations === 'barebones' ? 'Bare Bones' : rations.charAt(0).toUpperCase() + rations.slice(1)}</div>
                    </div>
                </div>
            </div>
        `;
        return card;
    }
}

