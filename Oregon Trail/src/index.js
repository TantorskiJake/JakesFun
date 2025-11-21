import { GameEngine } from './gameEngine.js';

/**
 * Main entry point for The Oregon Trail game
 */
async function main() {
    const game = new GameEngine();
    await game.run();
}

// Start the game
main().catch(error => {
    console.error('An error occurred:', error);
    process.exit(1);
});

