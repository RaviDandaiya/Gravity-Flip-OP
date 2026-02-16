import { Entity } from './Entity.js';

export class Platform extends Entity {
    constructor(x, y, width, height, color = '#ff8c00') {
        super(x, y, width, height, color);
    }

    draw(ctx, offsetX, offsetY = 0) {
        const drawX = this.x - offsetX;
        const drawY = this.y - offsetY;

        // Cave block style
        ctx.fillStyle = '#bdbdbd';
        ctx.fillRect(drawX, drawY, this.width, this.height);

        // Dark border
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 1;
        ctx.strokeRect(drawX, drawY, this.width, this.height);
    }
}
