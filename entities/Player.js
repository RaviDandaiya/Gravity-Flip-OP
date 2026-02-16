import { Entity } from './Entity.js';

export class Player extends Entity {
    constructor(x, y, color, name, isBot = false) {
        super(x, y, 40, 40, color);
        this.name = name;
        this.gravity = 1500;
        this.gravityDir = 1; // 1 for down, -1 for up
        this.baseSpeed = 500; // Faster game!
        this.baseSpeed = 500; // Manual speed
        this.vx = 0; // Starts still
        this.vy = 0;
        this.isGrounded = false;
        this.flipCooldown = 0;
        this.isBot = isBot;
        this.trail = []; // Array of {x, y, scale} for shadow animation
        this.keys = { left: false, right: false };
    }

    flipGravity() {
        if (this.flipCooldown <= 0) {
            this.gravityDir *= -1;
            this.flipCooldown = 0.05; // 50ms cooldown for fast response
        }
    }

    think(platforms, hazards) {
        if (!this.isBot || this.flipCooldown > 0) return;

        // Dynamic lookahead based on speed
        const lookAheadDist = this.vx * 0.4; // 0.4s lookahead (~180-200px)
        const checkPoints = [this.x + 50, this.x + 100, this.x + 150, this.x + lookAheadDist];

        // 1. Check if we have solid ground ahead on CURRENT side
        let safeOnCurrent = true;
        for (const cp of checkPoints) {
            let pointOnPlatform = false;
            for (const p of platforms) {
                const pb = p.getBounds();
                if (cp > pb.left && cp < pb.right) {
                    if (this.gravityDir === 1 && pb.top >= this.y + this.height) pointOnPlatform = true;
                    if (this.gravityDir === -1 && pb.bottom <= this.y) pointOnPlatform = true;
                }
            }
            if (!pointOnPlatform) {
                safeOnCurrent = false;
                break;
            }
        }

        // 2. Check for hazards on CURRENT side
        let hazardAhead = false;
        for (const h of hazards) {
            const hb = h.getBounds();
            // Hazard is ahead and on our current gravity side
            if (hb.left > this.x && hb.left < this.x + lookAheadDist + 50) {
                if (this.gravityDir === 1 && hb.top < this.y + this.height + 60) hazardAhead = true;
                if (this.gravityDir === -1 && hb.bottom > this.y - 60) hazardAhead = true;
            }
        }

        // 3. If unsafe, check if OTHER side is better
        if (!safeOnCurrent || hazardAhead) {
            let safeOnOther = true;

            // Check for platforms on other side
            let platformOnOther = false;
            for (const cp of checkPoints) {
                let pointOnOtherPlatform = false;
                for (const p of platforms) {
                    const pb = p.getBounds();
                    if (cp > pb.left && cp < pb.right) {
                        if (this.gravityDir === 1 && pb.bottom <= this.y) pointOnOtherPlatform = true;
                        if (this.gravityDir === -1 && pb.top >= this.y + this.height) pointOnOtherPlatform = true;
                    }
                }
                if (pointOnOtherPlatform) platformOnOther = true;
            }

            // Check for hazards on other side
            let hazardOnOther = false;
            for (const h of hazards) {
                const hb = h.getBounds();
                if (hb.left > this.x && hb.left < this.x + lookAheadDist + 50) {
                    if (this.gravityDir === 1 && hb.bottom > this.y - 60) hazardOnOther = true;
                    if (this.gravityDir === -1 && hb.top < this.y + this.height + 60) hazardOnOther = true;
                }
            }

            if (platformOnOther && !hazardOnOther) {
                this.flipGravity();
            }
        }
    }

    update(dt, arenaHeight, platforms) {
        if (!platforms) return;

        // 1. Horizontal Movement & Resolution
        let moveX = 0;
        if (this.isBot) {
            moveX = this.baseSpeed * dt;
        } else {
            if (this.keys.left) moveX -= this.baseSpeed * dt;
            if (this.keys.right) moveX += this.baseSpeed * dt;
        }

        this.vx = moveX / dt; // Track current velocity for animation/bots
        this.x += moveX;

        for (const platform of platforms) {
            if (this.collidesWith(platform)) {
                const pb = platform.getBounds();
                if (moveX > 0) { // Moving right
                    this.x = pb.left - this.width;
                } else if (moveX < 0) { // Moving left
                    this.x = pb.right;
                }
                this.vx = 0;
            }
        }

        // 2. Vertical Movement & Resolution
        this.vy += this.gravity * this.gravityDir * dt;
        const moveY = this.vy * dt;
        this.y += moveY;
        this.isGrounded = false;

        for (const platform of platforms) {
            if (this.collidesWith(platform)) {
                const pb = platform.getBounds();
                // If moving into platform vertically
                const movingDown = this.vy * this.gravityDir > 0;

                if (movingDown) { // Landing/Falling onto
                    if (this.gravityDir === 1) { // Normal gravity
                        this.y = pb.top - this.height;
                    } else { // Inverted gravity
                        this.y = pb.bottom;
                    }
                    this.vy = 0;
                    this.isGrounded = true;
                } else { // Hitting ceiling
                    if (this.gravityDir === 1) {
                        this.y = pb.bottom;
                    } else {
                        this.y = pb.top - this.height;
                    }
                    this.vy = 0;
                }
            }
        }

        // Update trail for shadow animation
        this.trail.unshift({ x: this.x, y: this.y, scale: this.currentVisualScale || this.gravityDir });
        if (this.trail.length > 5) this.trail.pop(); // Keep last 5 frames

        if (this.flipCooldown > 0) {
            this.flipCooldown -= dt;
        }

        // Smooth visual scale
        const targetScale = this.gravityDir;
        if (!this.currentVisualScale) this.currentVisualScale = targetScale;
        this.currentVisualScale += (targetScale - this.currentVisualScale) * 15 * dt;
    }

    draw(ctx, offsetX) {
        // 1. Draw Shadow Trail
        this.trail.forEach((t, i) => {
            const alpha = (0.3 - (i * 0.05));
            if (alpha <= 0) return;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(t.x + this.width / 2 - offsetX, t.y + this.height / 2);
            ctx.scale(1, t.scale);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        });

        // 2. Draw Main Player
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;

        ctx.translate(this.x + this.width / 2 - offsetX, this.y + this.height / 2);

        // Apply smooth flip animation
        ctx.scale(1, this.currentVisualScale || this.gravityDir);

        // Neon Border Style
        ctx.fillStyle = '#111111'; // Black body
        ctx.strokeStyle = this.color; // Neon border
        ctx.lineWidth = 4;

        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Eyes (drawn on top of black body)
        ctx.fillStyle = '#ffffff';
        const eyeW = 6;
        const eyeH = 6;
        ctx.fillRect(-10, -8, eyeW, eyeH);
        ctx.fillRect(4, -8, eyeW, eyeH);

        // Pupils
        ctx.fillStyle = '#000000';
        ctx.fillRect(-8, -6, 2, 2);
        ctx.fillRect(6, -6, 2, 2);

        ctx.restore();

        // 3. Draw Name Tag
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'black';
        const nameY = this.gravityDir === 1 ? this.y - 10 : this.y + this.height + 25;
        ctx.fillText(this.name.toUpperCase(), this.x + this.width / 2 - offsetX, nameY);
        ctx.restore();
    }
}
