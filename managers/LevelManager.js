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
        const levelLength = 4000 + level * 1000;
        const platforms = [];
        const hazards = [];
        const tileSize = 60;
        const gridRows = Math.floor(this.canvasHeight / tileSize);
        const gridCols = Math.floor(levelLength / tileSize);

        // Helper to add platform
        const addP = (r, c, w = 1, h = 1) => {
            platforms.push(new Platform(c * tileSize, r * tileSize, w * tileSize, h * tileSize, '#bdbdbd'));
        };

        // Helper to add spike
        const addS = (r, c, dir) => {
            const size = 20;
            const x = c * tileSize + (tileSize - size) / 2;
            const y = dir === 1 ? (r + 1) * tileSize - size : r * tileSize;
            hazards.push(new Spike(x, y, size, '#fff', dir));
        };

        // Initialize with top and bottom borders
        for (let c = 0; c < gridCols; c++) {
            addP(0, c);
            addP(gridRows - 1, c);
        }

        // Generate winding path segments
        let currentR = Math.floor(gridRows / 2);
        const corridorHeight = 6; // Wider tunnels (Easy Mode)

        for (let c = 0; c < gridCols; c += 4) {
            const segmentWidth = 4;
            const isStart = c < 12; // 720px safe start
            const isEnd = c > gridCols - 8;

            if (isStart || isEnd) continue;

            const rand = Math.random();
            const halfH = Math.floor(corridorHeight / 2);

            if (rand < 0.1) { // Reduced verticality
                // Vertical Shaft UP
                const upDist = 1;
                const newR = Math.max(3, currentR - upDist);
                for (let r = newR - halfH; r <= currentR + halfH; r++) {
                    addP(r, c);
                    addP(r, c + 3);
                }
                currentR = newR;
            } else if (rand > 0.9) {
                // Vertical Shaft DOWN
                const downDist = 1;
                const newR = Math.min(gridRows - 4, currentR + downDist);
                for (let r = currentR - halfH; r <= newR + halfH; r++) {
                    addP(r, c);
                    addP(r, c + 3);
                }
                currentR = newR;
            } else {
                // Horizontal Corridor
                const ceil = currentR - halfH;
                const floor = currentR + halfH;
                addP(ceil, c, 4, 1);
                addP(floor, c, 4, 1);

                // Fewer spikes (Probability 0.2 instead of 0.4+)
                if (Math.random() > 0.8) addS(ceil, c + 1, -1);
                if (Math.random() > 0.8) addS(floor - 1, c + 2, 1);

                // Occasional floating block, but not blocking the path
                if (Math.random() > 0.9) addP(currentR, c + 2, 1, 1);
            }

            // Smoothing borders
            addP(currentR - (halfH + 1), c, 4, 1);
            addP(currentR + (halfH + 1), c, 4, 1);
        }

        const goal = new Goal(levelLength - 150, 0, this.canvasHeight);
        return { platforms, hazards, goal, levelLength };
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
