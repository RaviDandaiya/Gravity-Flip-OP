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
        const platHeight = 40;
        const corridorHeight = 150;

        // Background and basic structure
        const topY = 0;
        const bottomY = this.canvasHeight - platHeight;

        // Grid-based generation
        for (let x = 0; x < levelLength; x += 300) {
            const isStart = x < 500;
            const isEnd = x > levelLength - 500;

            // Thick ceiling and floor for "Escape" feel
            platforms.push(new Platform(x, topY, 305, platHeight, '#888'));
            platforms.push(new Platform(x, bottomY, 305, platHeight, '#888'));

            if (!isStart && !isEnd) {
                const type = Math.floor(Math.random() * 5);

                switch (type) {
                    case 0: // Narrow corridor with spikes on both sides
                        hazards.push(new Spike(x + 50, topY + platHeight, 40, '#ff3333', -1));
                        hazards.push(new Spike(x + 200, bottomY - 40, 40, '#ff3333', 1));
                        break;
                    case 1: // Vertical pillar from top
                        platforms.push(new Platform(x + 100, topY + platHeight, 100, 200, '#666'));
                        hazards.push(new Spike(x + 50, bottomY - 40, 40, '#ff3333', 1));
                        hazards.push(new Spike(x + 210, bottomY - 40, 40, '#ff3333', 1));
                        break;
                    case 2: // Vertical pillar from bottom
                        platforms.push(new Platform(x + 100, bottomY - 200, 100, 200, '#666'));
                        hazards.push(new Spike(x + 50, topY + platHeight, 40, '#ff3333', -1));
                        hazards.push(new Spike(x + 210, topY + platHeight, 40, '#ff3333', -1));
                        break;
                    case 3: // Floating central blocks
                        platforms.push(new Platform(x + 50, 150, 200, 40, '#aaa'));
                        platforms.push(new Platform(x + 50, 260, 200, 40, '#aaa'));
                        break;
                    case 4: // Symmetrical zig-zag
                        platforms.push(new Platform(x + 50, topY + 100, 100, 40, '#777'));
                        platforms.push(new Platform(x + 150, bottomY - 140, 100, 40, '#777'));
                        break;
                }
            }
        }

        const goal = new Goal(levelLength - 200, 0, this.canvasHeight);

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
