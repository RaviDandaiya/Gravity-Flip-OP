import { Platform } from '../entities/Platform.js';
import { Spike } from '../entities/Spike.js';
import { Goal } from '../entities/Goal.js';

export class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.maxLevel = 20;
        this.canvasHeight = 450;
    }

    reset() {
        this.currentLevel = 1;
    }

    getMazeLevelConfig(level) {
        const levelLength = 3000 + level * 500;
        const platforms = [];
        const hazards = [];
        const platHeight = 60; // Thicker walls

        // Background and basic structure
        const topY = 0;
        const bottomY = this.canvasHeight - platHeight;

        // Grid-based generation
        for (let x = 0; x < levelLength; x += 200) {
            const isStart = x < 400;
            const isEnd = x > levelLength - 400;

            // Thick ceiling and floor for "Escape" feel
            platforms.push(new Platform(x, topY, 205, platHeight, '#888'));
            platforms.push(new Platform(x, bottomY, 205, platHeight, '#888'));

            if (!isStart && !isEnd) {
                const type = Math.floor(Math.random() * 6);

                switch (type) {
                    case 0: // Narrow vertical gap from top
                        platforms.push(new Platform(x + 50, topY + platHeight, 100, 180, '#777'));
                        hazards.push(new Spike(x + 10, bottomY - 40, 40, '#ff3333', 1));
                        hazards.push(new Spike(x + 150, bottomY - 40, 40, '#ff3333', 1));
                        break;
                    case 1: // Narrow vertical gap from bottom
                        platforms.push(new Platform(x + 50, bottomY - 180, 100, 180, '#777'));
                        hazards.push(new Spike(x + 10, topY + platHeight, 40, '#ff3333', -1));
                        hazards.push(new Spike(x + 150, topY + platHeight, 40, '#ff3333', -1));
                        break;
                    case 2: // Symmetrical pinch
                        platforms.push(new Platform(x + 50, topY + platHeight, 100, 100, '#666'));
                        platforms.push(new Platform(x + 50, bottomY - 100, 100, 100, '#666'));
                        break;
                    case 3: // Central island
                        platforms.push(new Platform(x + 20, 180, 160, 90, '#999'));
                        break;
                    case 4: // Wall of spikes
                        for (let i = 0; i < 4; i++) {
                            hazards.push(new Spike(x + i * 50, bottomY - 40, 40, '#ff3333', 1));
                            hazards.push(new Spike(x + i * 50, topY + platHeight, 40, '#ff3333', -1));
                        }
                        break;
                    case 5: // Floating platforms staggered
                        platforms.push(new Platform(x, 140, 100, 40, '#aaa'));
                        platforms.push(new Platform(x + 100, 280, 100, 40, '#aaa'));
                        break;
                }
            }
        }

        const goal = new Goal(levelLength - 150, 0, this.canvasHeight);

        return {
            platforms,
            hazards,
            goal,
            levelLength
        };
    }

    nextLevel() {
        if (this.currentLevel < this.maxLevel) {
            this.currentLevel++;
            return true;
        }
        return false;
    }

    reset() {
        this.currentLevel = 1;
    }
}
