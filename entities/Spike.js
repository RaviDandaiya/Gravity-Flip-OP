import { Entity } from './Entity.js';

export class Spike extends Entity {
    constructor(x, y, size, color = '#ff0000', direction = 1) {
        super(x, y, size, size, color);
        this.direction = direction; // 1 for pointing up, -1 for pointing down
    }

    update(dt) {
        // Static
    }

    draw(ctx, offsetX) {
        const drawX = this.x - offsetX;
        ctx.fillStyle = '#ff3333';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        ctx.beginPath();
        if (this.direction === 1) { // Facing up
            ctx.moveTo(drawX, this.y + this.height);
            ctx.lineTo(drawX + this.width / 2, this.y);
            ctx.lineTo(drawX + this.width, this.y + this.height);
        } else { // Facing down
            ctx.moveTo(drawX, this.y);
            ctx.lineTo(drawX + this.width / 2, this.y + this.height);
            ctx.lineTo(drawX + this.width, this.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}
