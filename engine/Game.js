import { Player } from '../entities/Player.js';
import { Spike } from '../entities/Spike.js';
import { Enemy } from '../entities/Enemy.js';
import { Goal } from '../entities/Goal.js';
import { LevelManager } from '../managers/LevelManager.js';

export class Game {
    constructor(canvas, ui) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ui = ui;
        this.levelManager = new LevelManager();

        this.width = canvas.width = 800;
        this.height = canvas.height = 450;

        this.players = [];
        this.platforms = [];
        this.hazards = [];
        this.goal = null;

        this.state = 'MENU';
        this.mode = 'SOLO';
        this.offsetX = 0;
        this.offsetY = 0;

        this.themes = {
            'NEON': { sky: '#1a1a1a', platform: '#bdbdbd', hazard: '#ffffff', p1: '#4fc3f7', bot: '#aab' },
            'MONO': { sky: '#111', platform: '#eee', hazard: '#fff', p1: '#00ccff', bot: '#888' },
            'SPACE': { sky: '#050505', platform: '#aaa', hazard: '#fff', p1: '#4fc3f7', bot: '#999' }
        };
        this.currentTheme = 'NEON';

        this.lastTime = 0;
        this.setupListeners();
    }

    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            const t = this.themes[themeName];
            document.documentElement.style.setProperty('--bg-color', t.sky);
            document.documentElement.style.setProperty('--primary-color', t.platform);
            document.documentElement.style.setProperty('--hazard-color', t.hazard);

            // Re-apply to all entities
            if (this.platforms) this.platforms.forEach(p => p.color = t.platform);
            if (this.hazards) this.hazards.forEach(h => h.color = t.hazard);
            if (this.players && this.players.length > 0) {
                this.players[0].color = t.p1;
                if (this.players[1]) this.players[1].color = t.bot;
            }
        }
    }

    setupListeners() {
        window.addEventListener('keydown', (e) => {
            const code = e.code;
            const key = e.key.toLowerCase();

            // Prevent scrolling for game keys
            const scrollKeys = ['space', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
            if (scrollKeys.includes(key) || scrollKeys.includes(code.toLowerCase())) {
                e.preventDefault();
            }

            // Manual movement keys
            if (this.players[0]) {
                if (key === 'arrowleft' || key === 'a') this.players[0].keys.left = true;
                if (key === 'arrowright' || key === 'd') this.players[0].keys.right = true;
            }

            if (this.state !== 'PLAYING') {
                if (key === 'enter' || code === 'Space') {
                    if (this.state === 'MENU' || this.state === 'GAME_OVER') this.resetGame();
                }
                if (key === 'r') this.resetGame();
                return;
            }

            // Global R key for reset
            if (key === 'r') {
                this.resetGame();
                return;
            }

            // If it's RACE VS BOT, let P1 use ALL common keys
            if (this.mode === 'SOLO' || (this.mode === 'MULTI' && this.players[1].isBot)) {
                const flipKeys = ['space', 'arrowup', 'arrowdown', 'w', 's'];
                if (flipKeys.includes(key) || flipKeys.includes(code.toLowerCase())) {
                    this.players[0].flipGravity();
                }
            } else if (this.mode === 'MULTI') {
                // Real 2-player local (legacy if we ever re-add it)
                if (key === 'w' || key === 's') this.players[0].flipGravity();
                if (key === 'arrowup' || key === 'arrowdown') this.players[1].flipGravity();
            }
        });

        this.canvas.addEventListener('pointerdown', (e) => {
            if (this.state !== 'PLAYING') return;

            if (this.mode === 'SOLO' || (this.mode === 'MULTI' && this.players[1].isBot)) {
                this.players[0].flipGravity();
            } else {
                const rect = this.canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width * this.width;
                if (x < this.width / 2) this.players[0].flipGravity();
                else this.players[1].flipGravity();
            }
        });

        window.addEventListener('keyup', (e) => {
            // No manual horizontal cleanup needed in auto-move
        });
    }

    startSolo() {
        this.mode = 'SOLO';
        this.resetGame();
    }

    startMulti() {
        this.mode = 'MULTI';
        this.resetGame();
    }

    resetGame() {
        console.log('--- RESTARTING GAME ---');
        this.levelManager.reset();
        this.initLevel();
        this.state = 'PLAYING';
        this.lastTime = performance.now(); // Use current high-res time
        this.ui.showScreen('game-ui');
        console.log('Game State:', this.state, 'Level:', this.levelManager.currentLevel);
    }

    gameOver(msg) {
        this.state = 'GAME_OVER';
        const leadPlayerX = Math.max(...this.players.map(p => p.x), 100);
        const distanceCovered = Math.floor((leadPlayerX - 100) / 10);
        this.ui.setGameOver(msg, this.levelManager.currentLevel, distanceCovered);
        this.ui.showScreen('game-over-screen');
    }

    initLevel() {
        const config = this.levelManager.getMazeLevelConfig(this.levelManager.currentLevel);

        this.platforms = config.platforms;
        this.hazards = config.hazards;
        this.goal = config.goal;
        this.offsetX = 0;

        // Reset particles (Minimalist mode - no clouds/dust)
        this.clouds = [];

        this.players = [];
        if (this.mode === 'SOLO') {
            this.players.push(new Player(100, this.height / 2, '#4fc3f7', 'YOU'));
        } else {
            // Player 1 starts at 100, Bot starts at 50 (trailing slightly)
            this.players.push(new Player(100, this.height / 3, '#4fc3f7', 'P1'));
            const bot = new Player(50, 2 * this.height / 3, '#aab', 'PRO BOT', true);
            bot.baseSpeed = 530; // Significant speed advantage
            this.players.push(bot);
        }

        this.ui.updateLevel(this.levelManager.currentLevel);
        this.setTheme(this.currentTheme);
    }

    update(currentTime) {
        // Schedule next frame immediately so loop never dies
        requestAnimationFrame((t) => this.update(t));

        if (!this.lastTime) {
            this.lastTime = currentTime;
            return;
        }
        const dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        if (this.state === 'PLAYING') {
            const cappedDt = Math.min(dt, 0.1);
            this.players.forEach(p => {
                if (p.isBot) p.think(this.platforms, this.hazards);
                p.update(cappedDt, this.height, this.platforms);
            });

            const humanPlayer = this.players[0];
            this.offsetX = humanPlayer.x - 200;
            this.offsetY = humanPlayer.y - this.height / 2;

            const dist = Math.floor((this.goal.x - humanPlayer.x) / 10);
            this.ui.updateTimer(dist > 0 ? dist : 0);

            // Goal/Death checks
            let goalReached = false;
            for (const player of this.players) {
                if (player.collidesWith(this.goal)) {
                    goalReached = true;
                    break;
                }

                if (player.y < -100 || player.y > this.height + 100) {
                    this.gameOver(this.mode === 'MULTI' ? (player === this.players[0] ? 'BOT WINS!' : 'PLAYER 1 WINS!') : 'GAME OVER');
                    return;
                }

                for (const hazard of this.hazards) {
                    if (player.collidesWith(hazard)) {
                        this.gameOver(this.mode === 'MULTI' ? (player === this.players[0] ? 'BOT WINS!' : 'PLAYER 1 WINS!') : 'GAME OVER');
                        return;
                    }
                }
            }

            if (goalReached) {
                this.state = 'LEVEL_COMPLETE';
                this.completeTimer = 1.5; // 1.5s animation
                this.ui.showScreen('level-complete-screen');
                return;
            }
        }

        if (this.state === 'LEVEL_COMPLETE') {
            const cappedDt = Math.min(dt, 0.1);
            this.completeTimer -= cappedDt;

            // Subtle slow down effect
            this.players.forEach(p => {
                p.vx *= 0.95;
                p.update(cappedDt, this.height, this.platforms);
            });
            this.offsetX += 150 * cappedDt;

            if (this.completeTimer <= 0) {
                if (this.levelManager.nextLevel()) {
                    this.initLevel();
                    this.state = 'PLAYING';
                    this.ui.showScreen('game-ui');
                } else {
                    this.gameOver('CONGRATULATIONS! ALL LEVELS CLEAR!');
                }
            }
        }

        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Dark Textured Stone Background
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Stone blocks with details
        const bh = 50;
        const bw = 100;
        const bOffset = this.offsetX % bw;

        for (let y = 0; y < this.height; y += bh) {
            const rowShift = (y / bh) % 2 === 0 ? 0 : bw / 2;
            for (let x = -bw - rowShift + (bw - bOffset); x < this.width + bw; x += bw) {
                // Main block
                this.ctx.fillStyle = '#0f0f0f';
                this.ctx.fillRect(x, y, bw - 2, bh - 2);

                // Subtle cracks/texture noise
                this.ctx.fillStyle = 'rgba(255,255,255,0.02)';
                if ((x + y) % 3 === 0) {
                    this.ctx.fillRect(x + 10, y + 20, 20, 1);
                    this.ctx.fillRect(x + 40, y + 10, 1, 15);
                }
            }
        }

        if (this.platforms) this.platforms.forEach(p => p.draw(this.ctx, this.offsetX, this.offsetY));
        if (this.hazards) this.hazards.forEach(h => h.draw(this.ctx, this.offsetX, this.offsetY));
        if (this.goal) this.goal.draw(this.ctx, this.offsetX, this.offsetY);
        if (this.players) this.players.forEach(p => p.draw(this.ctx, this.offsetX, this.offsetY));
    }
}
