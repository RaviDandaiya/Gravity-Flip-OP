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

    getDungeonLevelConfig(level) {
        const levelLength = 2500 + level * 400;
        const platforms = [];
        const hazards = [];
        const platHeight = 40;

        // Walls and Floors
        const topY = 0;
        const bottomY = this.canvasHeight - platHeight;
        const midY = (this.canvasHeight / 2) - (platHeight / 2);

        for (let x = 0; x < levelLength; x += 400) {
            const isStart = x < 500;
            const isEnd = x > levelLength - 500;

            // Always have ceiling and floor in dungeon (Escape the Room feel)
            platforms.push(new Platform(x, topY, 405, platHeight, '#222'));
            platforms.push(new Platform(x, bottomY, 405, platHeight, '#222'));

            if (!isStart && !isEnd) {
                const rand = Math.random();

                // 1. Horizontal Dividers (Middle path)
                if (rand < 0.6) {
                    platforms.push(new Platform(x + 100, midY, 200, 20, '#333'));
                }

                // 2. Vertical Blockages (Force gravity flip)
                if (rand > 0.7) {
                    // Top blockage
                    platforms.push(new Platform(x + 200, topY + platHeight, 40, 150, '#222'));
                    // Bottom hazards near blockage
                    hazards.push(new Spike(x + 150, bottomY - 30, 30, '#ff3333', 1));
                    hazards.push(new Spike(x + 250, bottomY - 30, 30, '#ff3333', 1));
                } else if (rand < 0.3) {
                    // Bottom blockage
                    platforms.push(new Platform(x + 200, bottomY - 150, 40, 150, '#222'));
                    // Top hazards
                    hazards.push(new Spike(x + 150, topY + platHeight, 30, '#ff3333', -1));
                    hazards.push(new Spike(x + 250, topY + platHeight, 30, '#ff3333', -1));
                }

                // 3. Cluster of spikes
                if (rand > 0.4 && rand < 0.6) {
                    const hx = x + 50;
                    hazards.push(new Spike(hx, bottomY - 30, 30, '#ff3333', 1));
                    hazards.push(new Spike(hx + 40, bottomY - 30, 30, '#ff3333', 1));
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
