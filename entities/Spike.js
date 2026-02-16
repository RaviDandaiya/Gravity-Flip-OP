import { Entity } from './Entity.js';

export class Spike extends Entity {
    constructor(x, y, size, color = '#ff0000', direction = 1) {
        super(x, y, size, size, color);
        this.direction = direction; // 1 for pointing up, -1 for pointing down
    }

    update(dt) {
        // Static
    }

    draw(ctx, offsetX, offsetY = 0) {
        const drawX = this.x - offsetX;
        const drawY = this.y - offsetY;
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;

        ctx.beginPath();
        if (this.direction === 1) { // Facing up
            ctx.moveTo(drawX, drawY + this.height);
            ctx.lineTo(drawX + this.width / 2, drawY);
            ctx.lineTo(drawX + this.width, drawY + this.height);
        } else { // Facing down
            ctx.moveTo(drawX, drawY);
            ctx.lineTo(drawX + this.width / 2, drawY + this.height);
            ctx.lineTo(drawX + this.width, drawY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}
