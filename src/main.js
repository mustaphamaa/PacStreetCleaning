window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    const game = new Game(canvas);
    game.start();
});
