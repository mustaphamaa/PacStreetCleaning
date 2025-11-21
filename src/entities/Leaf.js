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
        
        // Leaf shadow
        context.fillStyle = 'rgba(0, 0, 0, 0.2)';
        context.beginPath();
        context.ellipse(this.x + this.width/2 + 1, this.y + this.height/2 + 1, this.width/2, this.height/3, 0, 0, Math.PI * 2);
        context.fill();
        
        // Main leaf shape - Orange gradient
        const gradient = context.createRadialGradient(
            this.x + this.width/2, this.y + this.height/2, 0,
            this.x + this.width/2, this.y + this.height/2, this.width/2
        );
        gradient.addColorStop(0, '#FFB347');
        gradient.addColorStop(0.7, '#FF8C00');
        gradient.addColorStop(1, '#D2691E');
        
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        context.fill();
        
        // Leaf vein detail
        context.strokeStyle = '#8B4513';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(this.x + this.width/2, this.y + this.height/2 - 4);
        context.lineTo(this.x + this.width/2, this.y + this.height/2 + 4);
        context.stroke();
    }
}
