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
        context.fillStyle = '#FFD700'; // Safety Yellow
        context.fillRect(this.x, this.y, this.width, this.height);

        // Add some truck details
        context.fillStyle = 'black';
        // Wheels
        context.fillRect(this.x - 1, this.y + 3, 2, 5);
        context.fillRect(this.x + this.width - 1, this.y + 3, 2, 5);
        context.fillRect(this.x - 1, this.y + this.height - 8, 2, 5);
        context.fillRect(this.x + this.width - 1, this.y + this.height - 8, 2, 5);
    }
}
