// Get elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

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
let gameSpeed = 150;

// Initialize food position
function randomFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Make sure food doesn't spawn on snake
    for (let segment of snake) {
        if (food.x === segment.x && food.y === segment.y) {
            randomFood();
            return;
        }
    }
}

// Draw beautiful apple
function drawApple(x, y) {
    const size = gridSize;
    const cx = x * size + size / 2;
    const cy = y * size + size / 2;
    
    // Main apple body
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(cx, cy + 2, size / 2 - 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = '#ff6666';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Stem
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(cx - 1, cy - size / 2 + 1, 2, 6);
    
    // Leaf
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.moveTo(cx + 2, cy - size / 2 + 2);
    ctx.lineTo(cx + 6, cy - size / 2 - 1);
    ctx.lineTo(cx + 4, cy - size / 2 + 4);
    ctx.closePath();
    ctx.fill();
    
    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 1, 2, 0, Math.PI * 2);
    ctx.fill();
}

// Draw everything
function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Snake body
    ctx.fillStyle = '#00ff00';
    for (let i = 1; i < snake.length; i++) {
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 2, gridSize - 2);
    }

    // Snake head (glowing)
    ctx.save();
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#00cc00';
    ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 2, gridSize - 2);
    ctx.restore();

    // Draw apple
    drawApple(food.x, food.y);

    // Grid lines (Nokia style)
    ctx.strokeStyle = '#003300';
    ctx.lineWidth = 0.5;
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

// Update game logic
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

    // Eat apple
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = `SKOR: ${score}`;
        
        // Speed up slightly every 5 apples
        if (score % 50 === 0) {
            gameSpeed = Math.max(80, gameSpeed - 10);
            clearInterval(gameLoop);
            gameLoop = setInterval(gameLoop, gameSpeed);
        }
        
        randomFood();
    } else {
        snake.pop();
    }
}

// Main game loop
function gameLoop() {
    if (gameRunning && !gamePaused) {
        moveSnake();
    }
    drawGame();
}

// Game over
function gameOver() {
    gameRunning = false;
    gameOverElement.style.display = 'block';
    startBtn.textContent = 'MAIN LAGI';
    pauseBtn.disabled = true;
}

// Start/Restart game
function startGame() {
    snake = [{x: 10, y: 10}];
    dx = 1;  // Start moving right
    dy = 0;
    score = 0;
    gameSpeed = 150;
    gameRunning = true;
    gamePaused = false;
    gameOverElement.style.display = 'none';
    startBtn.textContent = 'MULAI GAME';
    pauseBtn.disabled = false;
    pauseBtn.textContent = 'PAUSE';
    scoreElement.textContent = 'SKOR: 0';
    
    randomFood();
    clearInterval(gameLoop);
    gameLoop = setInterval(gameLoop, gameSpeed);
}

// Pause/Resume
function pauseGame() {
    if (!gameRunning) return;
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? 'RESUME' : 'PAUSE';
}

// Controls
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    e.preventDefault();
    switch(e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'w':
        case 'arrowup':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'd':
        case 'arrowright':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
        case 's':
        case 'arrowdown':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case ' ':
            pauseGame();
            break;
    }
});

// Touch controls
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!gameRunning) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
        if (deltaX > 0 && dx !== -1) { dx = 1; dy = 0; }
        else if (deltaX < 0 && dx !== 1) { dx = -1; dy = 0; }
    } else if (Math.abs(deltaY) > 30) {
        if (deltaY > 0 && dy !== -1) { dx = 0; dy = 1; }
        else if (deltaY < 0 && dy !== 1) { dx = 0; dy = -1; }
    }
}, { passive: false });

// Mouse controls (click zones)
canvas.addEventListener('click', (e) => {
    if (!gameRunning) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (x < canvas.width / 2) {
        if (dx !== 1) { dx = -1; dy = 0; }
    } else {
        if (dx !== -1) { dx = 1; dy = 0; }
    }
});

// Initialize
randomFood();
drawGame();
