import { Entity } from './Entity.js';

export class Goal extends Entity {
    constructor(x, y, height, color = '#ffffff') {
        super(x, y, 20, height, color);
    }

    draw(ctx, offsetX, offsetY = 0) {
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#fff';

        const drawY = this.y - offsetY;

        ctx.fillStyle = this.color;
        // Draw checkered pattern
        const size = 10;
        for (let j = 0; j < this.height / size; j++) {
            for (let i = 0; i < this.width / size; i++) {
                if ((i + j) % 2 === 0) {
                    ctx.fillRect(this.x + i * size - offsetX, drawY + j * size, size, size);
                }
            }
        }

        ctx.restore();
    }
}
