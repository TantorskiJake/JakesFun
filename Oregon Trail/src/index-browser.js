/**
 * Browser entry point for The Oregon Trail game
 */
import { GameEngine } from './gameEngine.js';
import { BrowserUI } from './browser-ui.js';

/**
 * Main entry point for browser
 */
async function main() {
    // Wait a moment for DOM to be fully ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const game = new GameEngine();
    
    // Replace UI with browser UI
    game.ui = new BrowserUI();
    
    // Hide loading message
    if (game.ui.loadingMessage) {
        game.ui.loadingMessage.style.display = 'none';
    }
    
    try {
        await game.run();
    } catch (error) {
        console.error('An error occurred:', error);
        game.ui.printLine(`An error occurred: ${error.message}`, 'warning');
        game.ui.printLine('Please check the browser console (F12) for more details.', 'warning');
        if (loadingMsg) {
            loadingMsg.style.display = 'block';
            loadingMsg.textContent = 'Error loading game. Check console (F12) for details.';
            loadingMsg.style.color = '#ff6b6b';
        }
    }
}

// Start the game when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}

