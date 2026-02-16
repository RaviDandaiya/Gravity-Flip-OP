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
        ctx.save();
        ctx.translate(this.x + this.width / 2 - offsetX, this.y + this.height / 2);

        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        if (this.direction === 1) {
            // Triangle pointing up
            ctx.moveTo(0, -this.height / 2);
            ctx.lineTo(this.width / 2, this.height / 2);
            ctx.lineTo(-this.width / 2, this.height / 2);
        } else {
            // Triangle pointing down
            ctx.moveTo(0, this.height / 2);
            ctx.lineTo(this.width / 2, -this.height / 2);
            ctx.lineTo(-this.width / 2, -this.height / 2);
        }
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}
