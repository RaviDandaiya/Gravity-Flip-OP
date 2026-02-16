import { Entity } from './Entity.js';

export class Platform extends Entity {
    constructor(x, y, width, height, color = '#ff8c00') {
        super(x, y, width, height, color);
    }

    draw(ctx, offsetX) {
        const drawX = this.x - offsetX;

        // Outer glow/shadow for depth
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';

        // Main body
        ctx.fillStyle = this.color;
        ctx.fillRect(drawX, this.y, this.width, this.height);

        // Industrial details (lines/rivets)
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(drawX, this.y, this.width, 2); // Top highlight
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(drawX, this.y + this.height - 2, this.width, 2); // Bottom shadow

        // Rivets/Bolts
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        if (this.width > 50) {
            ctx.fillRect(drawX + 10, this.y + 10, 4, 4);
            ctx.fillRect(drawX + this.width - 14, this.y + 10, 4, 4);
            ctx.fillRect(drawX + 10, this.y + this.height - 14, 4, 4);
            ctx.fillRect(drawX + this.width - 14, this.y + this.height - 14, 4, 4);
        }

        ctx.shadowBlur = 0;
    }
}
