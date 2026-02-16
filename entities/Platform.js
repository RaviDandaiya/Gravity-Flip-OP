import { Entity } from './Entity.js';

export class Platform extends Entity {
    constructor(x, y, width, height, color = '#ff8c00') {
        super(x, y, width, height, color);
    }

    draw(ctx, offsetX) {
        ctx.fillStyle = this.color;
        // Draw main platform
        ctx.fillRect(this.x - offsetX, this.y, this.width, this.height);

        // Add ground detail for motion
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        for (let x = 0; x < this.width; x += 30) {
            ctx.fillRect(this.x + x - offsetX, this.y + 4, 15, 2);
            ctx.fillRect(this.x + x + 15 - offsetX, this.y + this.height - 6, 15, 2);
        }

        // Add a slight top/bottom border for definition
        ctx.fillRect(this.x - offsetX, this.y, this.width, 4);
        ctx.fillRect(this.x - offsetX, this.y + this.height - 4, this.width, 4);
    }
}
