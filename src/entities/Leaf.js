class Leaf {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 15;
        this.height = 15;
        this.active = true;
    }

    draw(context) {
        if (!this.active) return;
        context.fillStyle = '#32CD32'; // Lime Green
        context.beginPath();
        context.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        context.fill();
    }
}
