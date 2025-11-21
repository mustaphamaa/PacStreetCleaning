class Player {
    constructor(game) {
        this.game = game;
        this.width = 20; // Smaller to fit in shoulder (25px)
        this.height = 20;
        this.x = 55; // Start in top-left shoulder area (safer)
        this.y = 55;
        this.speed = 0.2;
    }

    update(deltaTime) {
        let nextX = this.x;
        let nextY = this.y;

        if (this.game.input.isDown('ArrowUp')) nextY -= this.speed * deltaTime;
        if (this.game.input.isDown('ArrowDown')) nextY += this.speed * deltaTime;
        if (this.game.input.isDown('ArrowLeft')) nextX -= this.speed * deltaTime;
        if (this.game.input.isDown('ArrowRight')) nextX += this.speed * deltaTime;

        // Check if next position is valid on the level AND doesn't hit a parked car
        const nextRect = { x: nextX, y: nextY, width: this.width, height: this.height };

        const hitParkedCar = this.game.cars.some(car =>
            car.type === 'parked' && this.game.checkCollision(nextRect, car)
        );

        if (!hitParkedCar && this.game.level.isPositionOnRoad(nextX, nextY, this.width, this.height)) {
            this.x = nextX;
            this.y = nextY;
        }
    }

    draw(context) {
        // Truck body with gradient
        const gradient = context.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, '#FFE44D');
        gradient.addColorStop(1, '#FFD700');
        
        // Main truck body
        context.fillStyle = gradient;
        context.fillRect(this.x, this.y, this.width, this.height);
        
        // Cab (front part)
        context.fillStyle = '#FFC700';
        context.fillRect(this.x, this.y, this.width * 0.4, this.height * 0.6);
        
        // Window
        context.fillStyle = '#87CEEB';
        context.fillRect(this.x + 2, this.y + 2, this.width * 0.3, this.height * 0.25);
        
        // Wheels with rim detail
        context.fillStyle = '#1a1a1a';
        const wheelSize = 5;
        // Left wheels
        context.beginPath();
        context.arc(this.x + 3, this.y + this.height - 3, wheelSize/2, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.arc(this.x + this.width - 3, this.y + this.height - 3, wheelSize/2, 0, Math.PI * 2);
        context.fill();
        
        // Wheel rims
        context.fillStyle = '#666';
        context.beginPath();
        context.arc(this.x + 3, this.y + this.height - 3, wheelSize/4, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.arc(this.x + this.width - 3, this.y + this.height - 3, wheelSize/4, 0, Math.PI * 2);
        context.fill();
        
        // Outline for depth
        context.strokeStyle = '#CC9900';
        context.lineWidth = 1;
        context.strokeRect(this.x, this.y, this.width, this.height);
    }
}
