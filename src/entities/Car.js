class Car {
    constructor(x, y, type = 'parked', road = null, game = null) {
        this.x = x;
        this.y = y;
        this.width = 20; // Smaller to fit in shoulder (25px)
        this.height = 20;
        this.type = type;
        this.game = game; // Need game reference for level access

        if (type === 'parked') {
            this.color = '#32CD32';
            this.vx = 0;
            this.vy = 0;
        } else {
            this.color = '#FF4500';
            this.speed = 2; // Fixed speed for consistency

            // Initial velocity based on road type
            if (road) {
                if (road.type === 'horizontal') {
                    const roadCenterY = road.y + road.h / 2;
                    this.vx = (y < roadCenterY) ? -this.speed : this.speed;
                    this.vy = 0;
                } else {
                    const roadCenterX = road.x + road.w / 2;
                    this.vx = 0;
                    this.vy = (x < roadCenterX) ? -this.speed : this.speed;
                }
            } else {
                this.vx = this.speed;
                this.vy = 0;
            }
        }
    }

    update(deltaTime) {
        if (this.type !== 'moving') return;

        // 1. Move
        this.x += this.vx;
        this.y += this.vy;

        // 2. Check for intersections / walls
        const level = this.game.level;

        // Check strict lane for moving cars based on CURRENT direction
        if (!level.isPositionValidForDirection(this.x, this.y, this.width, this.height, this.vx, this.vy)) {
            // We hit a wall or went off lane. Revert and find new direction.
            this.x -= this.vx;
            this.y -= this.vy;

            // Force a direction change
            this.changeDirection(true);
        } else {
            // We are on road. Are we at an intersection?
            if (Math.random() < 0.02) { // 2% chance per frame to try turning
                this.changeDirection(false);
            }
        }
    }

    changeDirection(force) {
        const level = this.game.level;
        const speed = this.speed;
        const candidates = [];
        const buffer = 5;

        // Helper to check validity based on direction
        const isValid = (x, y, vx, vy) => level.isPositionValidForDirection(x, y, this.width, this.height, vx, vy);

        // Check all 4 neighbors
        if (isValid(this.x + speed + buffer, this.y, speed, 0)) candidates.push({ vx: speed, vy: 0 });
        if (isValid(this.x - speed - buffer, this.y, -speed, 0)) candidates.push({ vx: -speed, vy: 0 });
        if (isValid(this.x, this.y + speed + buffer, 0, speed)) candidates.push({ vx: 0, vy: speed });
        if (isValid(this.x, this.y - speed - buffer, 0, -speed)) candidates.push({ vx: 0, vy: -speed });

        // Filter out reverse direction unless it's the only option
        const reverseVx = -this.vx;
        const reverseVy = -this.vy;

        const nonReverseCandidates = candidates.filter(d => d.vx !== reverseVx || d.vy !== reverseVy);

        let finalCandidates = nonReverseCandidates.length > 0 ? nonReverseCandidates : candidates;

        // If we are NOT forced, we only want to turn if there's an actual choice (intersection)
        if (!force) {
            if (this.vx !== 0) {
                finalCandidates = finalCandidates.filter(d => d.vy !== 0);
            } else {
                finalCandidates = finalCandidates.filter(d => d.vx !== 0);
            }
        }

        if (finalCandidates.length > 0) {
            const choice = finalCandidates[Math.floor(Math.random() * finalCandidates.length)];
            this.vx = choice.vx;
            this.vy = choice.vy;
        }
    }

    draw(context) {
        if (this.type === 'parked') {
            // Parked car - sedan style
            const gradient = context.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
            gradient.addColorStop(0, '#4ADE80');
            gradient.addColorStop(1, '#22C55E');
            
            // Car body
            context.fillStyle = gradient;
            context.fillRect(this.x, this.y + 4, this.width, this.height - 8);
            
            // Car roof
            context.fillStyle = '#16A34A';
            context.fillRect(this.x + 3, this.y + 6, this.width - 6, this.height - 12);
            
            // Windows
            context.fillStyle = '#60A5FA';
            context.fillRect(this.x + 4, this.y + 7, this.width - 8, 4);
            
            // Wheels
            context.fillStyle = '#1a1a1a';
            context.fillRect(this.x - 1, this.y + 2, 3, 4);
            context.fillRect(this.x + this.width - 2, this.y + 2, 3, 4);
            context.fillRect(this.x - 1, this.y + this.height - 6, 3, 4);
            context.fillRect(this.x + this.width - 2, this.y + this.height - 6, 3, 4);
            
        } else {
            // Moving car - sports car style with motion
            const gradient = context.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
            gradient.addColorStop(0, '#FF6347');
            gradient.addColorStop(1, '#DC143C');
            
            // Car body with rounded edges
            context.fillStyle = gradient;
            context.beginPath();
            context.roundRect(this.x, this.y + 3, this.width, this.height - 6, 2);
            context.fill();
            
            // Spoiler/roof accent
            context.fillStyle = '#8B0000';
            context.fillRect(this.x + 2, this.y + 5, this.width - 4, this.height - 10);
            
            // Window
            context.fillStyle = '#1a1a1a';
            context.fillRect(this.x + 3, this.y + 6, this.width - 6, 3);
            
            // Wheels
            context.fillStyle = '#000';
            context.beginPath();
            context.arc(this.x + 3, this.y + this.height - 4, 2.5, 0, Math.PI * 2);
            context.fill();
            context.beginPath();
            context.arc(this.x + this.width - 3, this.y + this.height - 4, 2.5, 0, Math.PI * 2);
            context.fill();
            
            // Motion lines for moving car
            context.strokeStyle = 'rgba(255, 99, 71, 0.3)';
            context.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                const offset = i * 3;
                if (this.vx > 0) {
                    context.beginPath();
                    context.moveTo(this.x - 5 - offset, this.y + 5 + i * 3);
                    context.lineTo(this.x - 2 - offset, this.y + 5 + i * 3);
                    context.stroke();
                } else if (this.vx < 0) {
                    context.beginPath();
                    context.moveTo(this.x + this.width + 2 + offset, this.y + 5 + i * 3);
                    context.lineTo(this.x + this.width + 5 + offset, this.y + 5 + i * 3);
                    context.stroke();
                } else if (this.vy > 0) {
                    context.beginPath();
                    context.moveTo(this.x + 5 + i * 3, this.y - 5 - offset);
                    context.lineTo(this.x + 5 + i * 3, this.y - 2 - offset);
                    context.stroke();
                } else if (this.vy < 0) {
                    context.beginPath();
                    context.moveTo(this.x + 5 + i * 3, this.y + this.height + 2 + offset);
                    context.lineTo(this.x + 5 + i * 3, this.y + this.height + 5 + offset);
                    context.stroke();
                }
            }
        }
    }
}
