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

    getLevelConfig(level) {
        const levelLength = 2000 + level * 500;
        const platforms = [];
        const hazards = [];

        const platHeight = 40;
        const topY = 0;
        const bottomY = this.canvasHeight - platHeight;

        // Continuous top and bottom platforms with some gaps
        // Increased platform width and gap spacing for better "completable" feel
        const step = 500; // More frequent transitions
        const platWidth = 400; // Smaller platforms = harder!

        for (let x = 0; x < levelLength; x += step) {
            // First 600px are safe
            const isStart = x < 600;
            const gapChance = isStart ? 0 : (0.15 + (level / 30)); // Progression gets much harder

            if (Math.random() < gapChance) continue;

            platforms.push(new Platform(x, topY, platWidth, platHeight));
            platforms.push(new Platform(x, bottomY, platWidth, platHeight));

            // Hazard density increases significantly with level
            if (x > 800) {
                const count = Math.min(Math.floor(1 + level / 3), 4);
                for (let i = 0; i < count; i++) {
                    const hx = x + 40 + Math.random() * (platWidth - 80);
                    // Hazard on top or bottom
                    if (Math.random() < 0.5) {
                        hazards.push(new Spike(hx, topY + platHeight, 30, '#ff0000', -1));
                    } else {
                        hazards.push(new Spike(hx, bottomY - 30, 30, '#ff0000', 1));
                    }
                }
            }
        }

        const goal = new Goal(levelLength - 100, 0, this.canvasHeight);

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
