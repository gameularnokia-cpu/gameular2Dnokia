const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');

// Game settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{x: 10, y: 10}];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let gameRunning = false;
let gamePaused = false;
let gameLoop;

// Generate random apple position
function randomFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
}

// Draw apple (🍎 pixel art)
function drawApple(x, y) {
    const size = gridSize;
    const cx = x * size + size/2;
    const cy = y * size + size/2;
    
    // Apple body - merah
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(cx, cy + 2, size/2 - 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Apple highlight
    ctx.fillStyle = '#ff6666';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Apple stem
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(cx - 1, cy - size/2 + 1, 2, 6);
    
    // Apple leaf
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.moveTo(cx + 2, cy - size/2 + 2);
    ctx.lineTo(cx + 6, cy - size/2 - 1);
    ctx.lineTo(cx + 4, cy - size/2 + 4);
    ctx.fill();
    
    // Shine effect
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 1, 2, 0, Math.PI * 2);
    ctx.fill();
}

// Draw game elements
function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake body
    ctx.fillStyle = '#00ff00';
    for (let i = 1; i < snake.length; i++) {
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 2, gridSize - 2);
    }

    // Draw snake head
    ctx.fillStyle = '#00cc00';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 10;
    ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 2, gridSize - 2);
    ctx.shadowBlur = 0;

    // Draw apple
    drawApple(food.x, food.y);

    // Draw grid (Nokia style)
    ctx.strokeStyle = '#003300';
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

// Move snake
function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Apple collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = `SKOR: ${score}`;
        randomFood();
    } else {
        snake.pop();
    }
}

// Game loop
function gameLoop() {
    if (!gamePaused) {
        moveSnake();
    }
    drawGame();
}

// Game over
function gameOver() {
    gameRunning = false;
    gameOverElement.style.display = 'block';
    clearInterval(gameLoop);
}

// Start game
function startGame() {
    snake = [{x: 10, y: 10}];
    dx = 0;
    dy = 0;
    score = 0;
    gameRunning = true;
    gamePaused = false;
    gameOverElement.style.display = 'none';
    scoreElement.textContent = 'SKOR: 0';
    randomFood();
    
    clearInterval(gameLoop);
    gameLoop = setInterval(gameLoop, 150);
}

// Pause game
function pauseGame() {
    gamePaused = !gamePaused;
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    switch(e.keyCode) {
        case 37: case 65: // Left/A
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 38: case 87: // Up/W
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 39: case 68: // Right/D
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
        case 40: case 83: // Down/S
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 32: // Space
            e.preventDefault();
            pauseGame();
            break;
    }
});

// Touch controls (mobile)
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', (e) => {
    if (!gameRunning) return;
    
    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;
    
    let deltaX = touchEndX - touchStartX;
    let deltaY = touchEndY - touchStartY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0 && dx !== -1) { dx = 1; dy = 0; }
        else if (deltaX < 0 && dx !== 1) { dx = -1; dy = 0; }
    } else {
        if (deltaY > 0 && dy !== -1) { dx = 0; dy = 1; }
        else if (deltaY < 0 && dy !== 1) { dx = 0; dy = -1; }
    }
});

// Initialize
randomFood();
drawGame();
