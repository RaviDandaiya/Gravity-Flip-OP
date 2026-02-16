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
        const corridorHeight = 6; // Total height of the "bubble" around currentR
        const pathGap = 3; // Guaranteed empty space in the middle of currentR

        for (let c = 0; c < gridCols; c += 4) {
            const isStart = c < 12; // Safe zone
            const isEnd = c > gridCols - 8;

            if (isStart || isEnd) continue;

            const rand = Math.random();

            // 1. Move the focal path height occasionally (Slowly)
            if (rand < 0.15) currentR = Math.max(3, currentR - 1);
            else if (rand > 0.85) currentR = Math.min(gridRows - 4, currentR + 1);

            // 2. Define the "Safe Zone" around currentR that MUST be empty
            const safeTop = currentR - Math.floor(pathGap / 2);
            const safeBottom = currentR + Math.floor(pathGap / 2);

            // 3. Define the "Corridor Walls" (Outer boundary)
            const ceil = currentR - Math.floor(corridorHeight / 2);
            const floor = currentR + Math.floor(corridorHeight / 2);

            // Add Ceiling and Floor blocks
            addP(ceil, c, 4, 1);
            addP(floor, c, 4, 1);

            // 4. Randomize obstacles OUTSIDE the safe path
            let obstaclePlacedInThisSegment = false;

            if (rand > 0.3 && rand < 0.7) {
                // Add a "Pillar" or "Spike" that doesn't block the pathGap
                const side = Math.random() > 0.5 ? 'top' : 'bottom';
                if (side === 'top') {
                    // Block from ceil down to safeTop
                    for (let r = ceil + 1; r < safeTop; r++) addP(r, c + 1);
                    obstaclePlacedInThisSegment = true;
                } else {
                    // Block from floor up to safeBottom
                    for (let r = floor - 1; r > safeBottom; r--) addP(r, c + 2);
                    obstaclePlacedInThisSegment = true;
                }
            }

            // ONLY add spikes if no vertical pillar was placed in this 4-tile segment
            if (!obstaclePlacedInThisSegment && rand > 0.7) {
                if (Math.random() > 0.5) addS(safeTop - 1, c + 1, -1);
                else addS(safeBottom + 1, c + 2, 1);
            }

            // Fill borders slightly for visual continuity
            addP(ceil - 1, c, 4, 1);
            addP(floor + 1, c, 4, 1);
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
