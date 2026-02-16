import { Game } from './engine/Game.js';

class UIManager {
    constructor() {
        console.log("GRAVITY FLIP VERSION 1.8 LOADED");
        this.screens = ['menu-screen', 'game-ui', 'game-over-screen', 'level-complete-screen'];
        this.levelDisplay = document.getElementById('level-display');
        this.scoreDisplay = document.getElementById('score-display');
        this.winnerText = document.getElementById('winner-text');
        this.finalLevel = document.getElementById('final-level');
        this.finalDistance = document.getElementById('final-distance');
    }

    showScreen(screenId) {
        console.log('Showing screen:', screenId);
        this.screens.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            if (id === screenId) el.classList.remove('hidden');
            else el.classList.add('hidden');
        });
    }

    updateLevel(level) {
        this.levelDisplay.textContent = `LEVEL: ${level}`;
    }

    updateTimer(distance) {
        this.scoreDisplay.textContent = `GOAL: ${distance}m`;
    }

    setGameOver(msg, level, distance) {
        this.winnerText.textContent = msg;
        this.finalLevel.textContent = `Level: ${level}`;
        this.finalDistance.textContent = `Distance: ${distance}m`;
    }
}

const canvas = document.getElementById('gameCanvas');
const ui = new UIManager();
const game = new Game(canvas, ui);

const uiAction = (id, fn) => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            fn();
        });
        // Fallback for non-pointer devices if any
        el.addEventListener('click', (e) => {
            e.preventDefault();
            fn();
        });
    }
};

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r') {
        console.log('R key pressed in main');
        game.resetGame();
    }
});

uiAction('start-solo', () => game.startSolo());
uiAction('start-multi', () => game.startMulti());
uiAction('restart-btn', () => game.resetGame());
uiAction('ingame-reset', () => game.resetGame());
uiAction('main-menu-btn', () => ui.showScreen('menu-screen'));

// Theme selection
document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        game.setTheme(theme);

        // Update active class
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Start main loop
requestAnimationFrame((t) => game.update(t));
