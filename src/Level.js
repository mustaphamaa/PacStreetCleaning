class Level {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.roads = [];
        this.initRoads();
    }

    initRoads() {
        // Road Specs:
        // Total Width: 150
        // Shoulder: 25 | Lane 1: 50 | Lane 2: 50 | Shoulder: 25
        const roadWidth = 150;

        // 1. Outer Loop
        // Top
        this.roads.push({ x: 50, y: 50, w: 700, h: roadWidth, type: 'horizontal' });
        // Bottom
        this.roads.push({ x: 50, y: 400, w: 700, h: roadWidth, type: 'horizontal' });
        // Left
        this.roads.push({ x: 50, y: 50, w: roadWidth, h: 500, type: 'vertical' });
        // Right
        this.roads.push({ x: 600, y: 50, w: roadWidth, h: 500, type: 'vertical' });

        // 2. Middle Cross
        // Horizontal Middle
        this.roads.push({ x: 150, y: 225, w: 500, h: roadWidth, type: 'horizontal' });
        // Vertical Middle
        this.roads.push({ x: 325, y: 150, w: roadWidth, h: 300, type: 'vertical' });
    }

    draw(context) {
        // Draw Grass/Background
        context.fillStyle = '#2a2a2a';
        context.fillRect(0, 0, this.width, this.height);

        this.roads.forEach(road => {
            // 1. Draw Main Road Surface (Lanes)
            context.fillStyle = '#444';
            context.fillRect(road.x, road.y, road.w, road.h);

            // 2. Draw Shoulders (Darker/Distinct)
            context.fillStyle = '#333'; // Darker shoulder
            const shoulderSize = 25;

            if (road.type === 'horizontal') {
                // Top Shoulder
                context.fillRect(road.x, road.y, road.w, shoulderSize);
                // Bottom Shoulder
                context.fillRect(road.x, road.y + road.h - shoulderSize, road.w, shoulderSize);

                // Lane Divider (White Dashed)
                context.strokeStyle = '#FFF';
                context.setLineDash([20, 20]);
                context.lineWidth = 2;
                context.beginPath();
                context.moveTo(road.x, road.y + road.h / 2);
                context.lineTo(road.x + road.w, road.y + road.h / 2);
                context.stroke();

                // Shoulder Lines (Solid Yellow/White)
                context.strokeStyle = '#AAA';
                context.setLineDash([]);
                context.lineWidth = 1;
                // Top Line
                context.beginPath();
                context.moveTo(road.x, road.y + shoulderSize);
                context.lineTo(road.x + road.w, road.y + shoulderSize);
                context.stroke();
                // Bottom Line
                context.beginPath();
                context.moveTo(road.x, road.y + road.h - shoulderSize);
                context.lineTo(road.x + road.w, road.y + road.h - shoulderSize);
                context.stroke();

            } else {
                // Left Shoulder
                context.fillRect(road.x, road.y, shoulderSize, road.h);
                // Right Shoulder
                context.fillRect(road.x + road.w - shoulderSize, road.y, shoulderSize, road.h);

                // Lane Divider
                context.strokeStyle = '#FFF';
                context.setLineDash([20, 20]);
                context.lineWidth = 2;
                context.beginPath();
                context.moveTo(road.x + road.w / 2, road.y);
                context.lineTo(road.x + road.w / 2, road.y + road.h);
                context.stroke();

                // Shoulder Lines
                context.strokeStyle = '#AAA';
                context.setLineDash([]);
                context.lineWidth = 1;
                // Left Line
                context.beginPath();
                context.moveTo(road.x + shoulderSize, road.y);
                context.lineTo(road.x + shoulderSize, road.y + road.h);
                context.stroke();
                // Right Line
                context.beginPath();
                context.moveTo(road.x + road.w - shoulderSize, road.y);
                context.lineTo(road.x + road.w - shoulderSize, road.y + road.h);
                context.stroke();
            }
        });
        context.setLineDash([]);
    }

    isPositionOnRoad(x, y, width, height) {
        const points = [
            { x: x, y: y },
            { x: x + width, y: y },
            { x: x, y: y + height },
            { x: x + width, y: y + height }
        ];

        return points.every(p => {
            return this.roads.some(r =>
                p.x >= r.x && p.x <= r.x + r.w &&
                p.y >= r.y && p.y <= r.y + r.h
            );
        });
    }

    isPositionInLane(x, y, width, height) {
        const points = [
            { x: x, y: y },
            { x: x + width, y: y },
            { x: x, y: y + height },
            { x: x + width, y: y + height }
        ];

        return points.every(p => {
            return this.roads.some(r => {
                const shoulderSize = 25;
                if (r.type === 'horizontal') {
                    return p.x >= r.x && p.x <= r.x + r.w &&
                        p.y >= r.y + shoulderSize && p.y <= r.y + r.h - shoulderSize;
                } else {
                    return p.x >= r.x + shoulderSize && p.x <= r.x + r.w - shoulderSize &&
                        p.y >= r.y && p.y <= r.y + r.h;
                }
            });
        });
    }

    isPositionValidForDirection(x, y, width, height, vx, vy) {
        const points = [
            { x: x, y: y },
            { x: x + width, y: y },
            { x: x, y: y + height },
            { x: x + width, y: y + height }
        ];

        return points.every(p => {
            return this.roads.some(r => {
                const shoulderSize = 25;

                // If moving horizontally, MUST be in a horizontal lane
                if (Math.abs(vx) > 0 && r.type === 'horizontal') {
                    return p.x >= r.x && p.x <= r.x + r.w &&
                        p.y >= r.y + shoulderSize && p.y <= r.y + r.h - shoulderSize;
                }

                // If moving vertically, MUST be in a vertical lane
                if (Math.abs(vy) > 0 && r.type === 'vertical') {
                    return p.x >= r.x + shoulderSize && p.x <= r.x + r.w - shoulderSize &&
                        p.y >= r.y && p.y <= r.y + r.h;
                }

                return false;
            });
        });
    }

    // Helper to get spawn positions
    getSpawnPosition(zone) {
        // zone: 'shoulder' or 'lane'
        const road = this.roads[Math.floor(Math.random() * this.roads.length)];
        const shoulderSize = 25;
        const laneWidth = 50;

        let x, y;

        if (road.type === 'horizontal') {
            if (zone === 'shoulder') {
                // Top or Bottom shoulder
                const isTop = Math.random() > 0.5;
                y = isTop ? road.y + 5 : road.y + road.h - shoulderSize + 5;
                x = road.x + Math.random() * (road.w - 40);
            } else {
                // Top or Bottom Lane
                const isTopLane = Math.random() > 0.5;
                // Center of lane
                y = isTopLane ? road.y + shoulderSize + 10 : road.y + shoulderSize + laneWidth + 10;
                x = road.x + Math.random() * (road.w - 40);
            }
        } else {
            if (zone === 'shoulder') {
                // Left or Right shoulder
                const isLeft = Math.random() > 0.5;
                x = isLeft ? road.x + 5 : road.x + road.w - shoulderSize + 5;
                y = road.y + Math.random() * (road.h - 40);
            } else {
                // Left or Right Lane
                const isLeftLane = Math.random() > 0.5;
                x = isLeftLane ? road.x + shoulderSize + 10 : road.x + shoulderSize + laneWidth + 10;
                y = road.y + Math.random() * (road.h - 40);
            }
        }

        return { x, y, road }; // Return road too for traffic direction
    }

    getAvailableDirections(x, y, width, height, currentVx, currentVy, speed) {
        const directions = [];
        const buffer = 5; // Look ahead a bit

        // Check Right
        if (currentVx >= 0 && this.isPositionOnRoad(x + speed + buffer, y, width, height)) {
            directions.push({ vx: speed, vy: 0 });
        }
        // Check Left
        if (currentVx <= 0 && this.isPositionOnRoad(x - speed - buffer, y, width, height)) {
            directions.push({ vx: -speed, vy: 0 });
        }
        // Check Down
        if (currentVy >= 0 && this.isPositionOnRoad(x, y + speed + buffer, width, height)) {
            directions.push({ vx: 0, vy: speed });
        }
        // Check Up
        if (currentVy <= 0 && this.isPositionOnRoad(x, y - speed - buffer, width, height)) {
            directions.push({ vx: 0, vy: -speed });
        }

        return directions;
    }
}
