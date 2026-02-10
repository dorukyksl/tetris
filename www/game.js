// Tetris Game - Main Logic

// Canvas setup
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextCtx = nextCanvas.getContext('2d');

// Game constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = Math.min(
    Math.floor((window.innerWidth - 100) / COLS),
    Math.floor((window.innerHeight - 350) / ROWS),
    30
);

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;
nextCanvas.width = 4 * BLOCK_SIZE;
nextCanvas.height = 4 * BLOCK_SIZE;

// Colors for tetrominoes
const COLORS = [
    null,
    '#00f0f0', // I - Cyan
    '#0000f0', // J - Blue
    '#f0a000', // L - Orange
    '#f0f000', // O - Yellow
    '#00f000', // S - Green
    '#a000f0', // T - Purple
    '#f00000', // Z - Red
];

// Tetromino shapes
const SHAPES = [
    null,
    [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], // I
    [[2,0,0], [2,2,2], [0,0,0]],                   // J
    [[0,0,3], [3,3,3], [0,0,0]],                   // L
    [[4,4], [4,4]],                                 // O
    [[0,5,5], [5,5,0], [0,0,0]],                   // S
    [[0,6,0], [6,6,6], [0,0,0]],                   // T
    [[7,7,0], [0,7,7], [0,0,0]],                   // Z
];

// Game state
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let gameOver = false;
let paused = false;
let gameStarted = false;
let dropInterval = 1000;
let lastDrop = 0;
let animationId = null;

// DOM elements
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const linesEl = document.getElementById('lines');
const startScreen = document.getElementById('start-screen');
const pauseScreen = document.getElementById('pause-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const finalScoreEl = document.getElementById('final-score');
const finalLevelEl = document.getElementById('final-level');

// Initialize board
function createBoard() {
    board = [];
    for (let row = 0; row < ROWS; row++) {
        board.push(new Array(COLS).fill(0));
    }
}

// Create a new piece
function createPiece(type) {
    return {
        shape: SHAPES[type].map(row => [...row]),
        color: type,
        x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0].length / 2),
        y: 0
    };
}

// Get random piece type
function randomPiece() {
    return Math.floor(Math.random() * 7) + 1;
}

// Draw a block
function drawBlock(ctx, x, y, color, blockSize = BLOCK_SIZE) {
    const padding = 1;
    ctx.fillStyle = COLORS[color];
    ctx.fillRect(x * blockSize + padding, y * blockSize + padding, 
                 blockSize - padding * 2, blockSize - padding * 2);
    
    // Add shine effect
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(x * blockSize + padding, y * blockSize + padding, 
                 blockSize - padding * 2, (blockSize - padding * 2) / 3);
}

// Draw the board
function drawBoard() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(canvas.width, y * BLOCK_SIZE);
        ctx.stroke();
    }
    
    // Draw placed blocks
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) {
                drawBlock(ctx, col, row, board[row][col]);
            }
        }
    }
}

// Draw current piece
function drawPiece() {
    if (!currentPiece) return;
    
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                drawBlock(ctx, currentPiece.x + col, currentPiece.y + row, currentPiece.color);
            }
        }
    }
}

// Draw ghost piece (preview)
function drawGhost() {
    if (!currentPiece) return;
    
    let ghostY = currentPiece.y;
    while (!collision(currentPiece.x, ghostY + 1, currentPiece.shape)) {
        ghostY++;
    }
    
    ctx.globalAlpha = 0.3;
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                drawBlock(ctx, currentPiece.x + col, ghostY + row, currentPiece.color);
            }
        }
    }
    ctx.globalAlpha = 1;
}

// Draw next piece preview
function drawNext() {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (!nextPiece) return;
    
    const shape = SHAPES[nextPiece];
    const offsetX = (4 - shape[0].length) / 2;
    const offsetY = (4 - shape.length) / 2;
    
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                drawBlock(nextCtx, col + offsetX, row + offsetY, nextPiece, BLOCK_SIZE);
            }
        }
    }
}

// Check collision
function collision(x, y, shape) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = x + col;
                const newY = y + row;
                
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }
                if (newY >= 0 && board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Rotate piece
function rotate(shape) {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated = [];
    
    for (let col = 0; col < cols; col++) {
        rotated.push([]);
        for (let row = rows - 1; row >= 0; row--) {
            rotated[col].push(shape[row][col]);
        }
    }
    return rotated;
}

// Try to rotate with wall kicks
function tryRotate() {
    const rotated = rotate(currentPiece.shape);
    const kicks = [0, 1, -1, 2, -2];
    
    for (const kick of kicks) {
        if (!collision(currentPiece.x + kick, currentPiece.y, rotated)) {
            currentPiece.shape = rotated;
            currentPiece.x += kick;
            return true;
        }
    }
    return false;
}

// Merge piece to board
function merge() {
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                const y = currentPiece.y + row;
                const x = currentPiece.x + col;
                if (y >= 0) {
                    board[y][x] = currentPiece.color;
                }
            }
        }
    }
}

// Clear completed lines
function clearLines() {
    let cleared = 0;
    
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(new Array(COLS).fill(0));
            cleared++;
            row++; // Check same row again
        }
    }
    
    if (cleared > 0) {
        // Scoring: 100, 300, 500, 800 for 1, 2, 3, 4 lines
        const points = [0, 100, 300, 500, 800];
        score += points[cleared] * level;
        lines += cleared;
        
        // Level up every 10 lines
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        }
        
        updateUI();
    }
}

// Update UI
function updateUI() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
    linesEl.textContent = lines;
}

// Spawn new piece
function spawnPiece() {
    currentPiece = createPiece(nextPiece || randomPiece());
    nextPiece = randomPiece();
    
    if (collision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
        gameOver = true;
        showGameOver();
    }
    
    drawNext();
}

// Move piece
function movePiece(dx, dy) {
    if (gameOver || paused || !gameStarted) return;
    
    if (!collision(currentPiece.x + dx, currentPiece.y + dy, currentPiece.shape)) {
        currentPiece.x += dx;
        currentPiece.y += dy;
        return true;
    }
    return false;
}

// Hard drop
function hardDrop() {
    if (gameOver || paused || !gameStarted) return;
    
    while (!collision(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
        currentPiece.y++;
        score += 2;
    }
    
    merge();
    clearLines();
    spawnPiece();
    updateUI();
}

// Soft drop
function softDrop() {
    if (movePiece(0, 1)) {
        score += 1;
        updateUI();
    }
}

// Game loop
function gameLoop(timestamp) {
    if (gameOver || paused || !gameStarted) {
        animationId = requestAnimationFrame(gameLoop);
        return;
    }
    
    if (timestamp - lastDrop > dropInterval) {
        if (!movePiece(0, 1)) {
            merge();
            clearLines();
            spawnPiece();
        }
        lastDrop = timestamp;
    }
    
    drawBoard();
    drawGhost();
    drawPiece();
    
    animationId = requestAnimationFrame(gameLoop);
}

// Show screens
function showGameOver() {
    finalScoreEl.textContent = score;
    finalLevelEl.textContent = level;
    gameoverScreen.classList.remove('hidden');
}

function hideAllScreens() {
    startScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
}

// Start game
function startGame() {
    createBoard();
    score = 0;
    level = 1;
    lines = 0;
    dropInterval = 1000;
    gameOver = false;
    paused = false;
    gameStarted = true;
    
    nextPiece = randomPiece();
    spawnPiece();
    updateUI();
    hideAllScreens();
    
    lastDrop = performance.now();
    if (!animationId) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Pause/Resume
function togglePause() {
    if (!gameStarted || gameOver) return;
    
    paused = !paused;
    if (paused) {
        pauseScreen.classList.remove('hidden');
    } else {
        pauseScreen.classList.add('hidden');
        lastDrop = performance.now();
    }
}

// Event listeners
document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-restart').addEventListener('click', startGame);
document.getElementById('btn-pause').addEventListener('click', togglePause);
document.getElementById('btn-resume').addEventListener('click', togglePause);

// Control buttons
document.getElementById('btn-left').addEventListener('click', () => movePiece(-1, 0));
document.getElementById('btn-right').addEventListener('click', () => movePiece(1, 0));
document.getElementById('btn-down').addEventListener('click', softDrop);
document.getElementById('btn-rotate').addEventListener('click', tryRotate);
document.getElementById('btn-drop').addEventListener('click', hardDrop);

// Touch event handling (prevent double triggers)
const buttons = document.querySelectorAll('.control-btn');
buttons.forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
    }, { passive: false });
});

// Keyboard controls (for testing on PC)
document.addEventListener('keydown', (e) => {
    if (!gameStarted) {
        if (e.key === 'Enter' || e.key === ' ') startGame();
        return;
    }
    
    switch(e.key) {
        case 'ArrowLeft':
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
            movePiece(1, 0);
            break;
        case 'ArrowDown':
            softDrop();
            break;
        case 'ArrowUp':
            tryRotate();
            break;
        case ' ':
            hardDrop();
            break;
        case 'p':
        case 'P':
        case 'Escape':
            togglePause();
            break;
    }
});

// Swipe controls
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const touchDuration = Date.now() - touchStartTime;
    
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    
    if (absDx < 10 && absDy < 10 && touchDuration < 200) {
        // Tap - rotate
        tryRotate();
    } else if (absDx > absDy && absDx > 30) {
        // Horizontal swipe
        if (dx > 0) {
            movePiece(1, 0);
        } else {
            movePiece(-1, 0);
        }
    } else if (absDy > absDx && absDy > 30) {
        // Vertical swipe
        if (dy > 0) {
            if (absDy > 100) {
                hardDrop();
            } else {
                softDrop();
            }
        }
    }
}, { passive: true });

// Initialize
createBoard();
drawBoard();
drawNext();

// Prevent zoom on double tap
document.addEventListener('dblclick', (e) => {
    e.preventDefault();
}, { passive: false });
