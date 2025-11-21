class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.input = new Input();

        this.state = 'MENU'; // MENU, PLAYING, GAME_OVER, LEVEL_COMPLETE
        this.score = 0;
        this.levelNumber = 1;

        // UI Elements
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.levelCompleteScreen = document.getElementById('level-complete-screen');
        this.scoreValue = document.getElementById('score-value');
        this.finalScore = document.getElementById('final-score');

        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('start-btn').addEventListener('click', () => {
            this.setGameState('PLAYING');
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.levelNumber = 1; // Reset to level 1 on game over
            this.resetGame();
            this.setGameState('PLAYING');
        });

        document.getElementById('next-level-btn').addEventListener('click', () => {
            this.nextLevel();
        });
    }

    setGameState(state) {
        this.state = state;

        if (state === 'MENU') {
            this.welcomeScreen.classList.add('active');
            this.gameOverScreen.classList.remove('active');
        } else if (state === 'PLAYING') {
            if (this.leaves && this.leaves.length === 0 && this.levelNumber > 1) {
                // Just continuing, don't full reset if we just leveled up? 
                // Actually resetGame handles level setup.
            } else if (!this.cars || this.cars.length === 0) {
                this.resetGame();
            }

            this.welcomeScreen.classList.remove('active');
            this.gameOverScreen.classList.remove('active');
            this.levelCompleteScreen.classList.remove('active');
            this.lastTime = performance.now();
            requestAnimationFrame(this.loop.bind(this));
        } else if (state === 'GAME_OVER') {
            this.welcomeScreen.classList.remove('active');
            this.gameOverScreen.classList.add('active');
            this.levelCompleteScreen.classList.remove('active');
            this.finalScore.textContent = Math.floor(this.score);
        } else if (state === 'LEVEL_COMPLETE') {
            this.welcomeScreen.classList.remove('active');
            this.gameOverScreen.classList.remove('active');
            this.levelCompleteScreen.classList.add('active');
        }
    }

    resetGame() {
        // Keep score if leveling up?
        if (this.levelNumber === 1) {
            this.score = 0;
            this.scoreValue.textContent = '0';
        }

        this.level = new Level(this.width, this.height);
        this.player = new Player(this);

        this.leaves = [];
        this.cars = [];
        this.initLevel();
    }

    initLevel() {
        // 1. Spawn Parked Cars (Green) on Shoulders
        for (let i = 0; i < 10; i++) {
            const pos = this.level.getSpawnPosition('shoulder');
            if (Math.abs(pos.x - this.player.x) > 50 || Math.abs(pos.y - this.player.y) > 50) {
                this.cars.push(new Car(pos.x, pos.y, 'parked', null, this));
            }
        }

        // 2. Spawn Leaves on Shoulders (Avoid Parked Cars)
        let leavesSpawned = 0;
        let attempts = 0;
        while (leavesSpawned < 40 && attempts < 200) {
            attempts++;
            const pos = this.level.getSpawnPosition('shoulder');
            const leafRect = { x: pos.x, y: pos.y, width: 15, height: 15 }; // Leaf size matches Leaf.js

            // Check collision with parked cars
            const hitCar = this.cars.some(car =>
                car.type === 'parked' && this.checkCollision(leafRect, car)
            );

            if (!hitCar) {
                this.leaves.push(new Leaf(pos.x, pos.y));
                leavesSpawned++;
            }
        }

        // 3. Spawn Moving Cars (Red) in Lanes
        // Base 5 cars + 1 per level
        const movingCarCount = 4 + this.levelNumber;

        for (let i = 0; i < movingCarCount; i++) {
            let pos, safe = false;
            let attempts = 0;
            while (!safe && attempts < 50) {
                attempts++;
                pos = this.level.getSpawnPosition('lane');
                // Ensure not too close to player (who is at 55,55)
                if (Math.abs(pos.x - this.player.x) > 60 || Math.abs(pos.y - this.player.y) > 60) {
                    safe = true;
                }
            }
            this.cars.push(new Car(pos.x, pos.y, 'moving', pos.road, this));
        }

        // Show level toast/message? (Optional)
        console.log('Starting Level ' + this.levelNumber);
    }

    nextLevel() {
        this.levelNumber++;
        this.resetGame();
        this.setGameState('PLAYING');
    }

    start() {
        this.setGameState('MENU');
    }

    loop(timestamp) {
        if (this.state !== 'PLAYING') return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.loop.bind(this));
    }

    update(deltaTime) {
        this.player.update(deltaTime);

        // Update Moving Cars
        this.cars.forEach(car => car.update(deltaTime));

        // Check collisions with leaves
        let leavesCollected = 0;
        this.leaves.forEach(leaf => {
            if (leaf.active) {
                if (this.checkCollision(this.player, leaf)) {
                    leaf.active = false;
                    this.score += 10;
                    this.scoreValue.textContent = this.score;
                }
            } else {
                leavesCollected++;
            }
        });

        // Check Level Completion
        if (leavesCollected === this.leaves.length) {
            this.setGameState('LEVEL_COMPLETE');
            return;
        }

        // Check collisions with moving cars
        this.cars.forEach(car => {
            if (car.type === 'moving' && this.checkCollision(this.player, car)) {
                this.setGameState('GAME_OVER');
            }
        });
    }

    checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    draw() {
        this.level.draw(this.context);
        this.leaves.forEach(leaf => leaf.draw(this.context));
        this.cars.forEach(car => car.draw(this.context));
        this.player.draw(this.context);

        // Draw Level Indicator
        this.context.fillStyle = 'white';
        this.context.font = '20px Inter';
        this.context.fillText('Level: ' + this.levelNumber, this.width - 100, 30);
    }
}
