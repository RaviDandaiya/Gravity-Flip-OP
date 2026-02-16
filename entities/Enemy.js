import { Entity } from './Entity.js';

export class Enemy extends Entity {
    constructor(x, y, size, color) {
        super(x, y, size, size, color);
        this.vx = (Math.random() < 0.5 ? 1 : -1) * (150 + Math.random() * 100);
        this.vy = (Math.random() < 0.5 ? 1 : -1) * (150 + Math.random() * 100);
    }

    update(dt, arenaWidth, arenaHeight) {
        super.update(dt);

        // Simple bounce with slight speed variation
        if (this.x < 0 || this.x + this.width > arenaWidth) {
            this.vx *= -1.05; // Slightly faster each bounce
            this.x = this.x < 0 ? 0 : arenaWidth - this.width;
            if (Math.abs(this.vx) > 500) this.vx = Math.sign(this.vx) * 500;
        }
        if (this.y < 0 || this.y + this.height > arenaHeight) {
            this.vy *= -1.05;
            this.y = this.y < 0 ? 0 : arenaHeight - this.height;
            if (Math.abs(this.vy) > 500) this.vy = Math.sign(this.vy) * 500;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;

        // Pulsing effect
        const scale = 1 + Math.sin(Date.now() / 200) * 0.1;
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.scale(scale, scale);

        ctx.fillStyle = this.color;
        // Diamond shape
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(this.width / 2, 0);
        ctx.lineTo(0, this.height / 2);
        ctx.lineTo(-this.width / 2, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}
