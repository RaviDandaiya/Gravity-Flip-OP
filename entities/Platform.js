import { Entity } from './Entity.js';

export class Platform extends Entity {
    constructor(x, y, width, height, color = '#ff8c00') {
        super(x, y, width, height, color);
    }

    draw(ctx, offsetX) {
        const drawX = this.x - offsetX;

        // High contrast minimalist style
        ctx.fillStyle = this.color;
        ctx.fillRect(drawX, this.y, this.width, this.height);

        // Sharp border/outline for structural look
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(drawX, this.y, this.width, this.height);
    }
}
