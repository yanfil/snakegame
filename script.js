const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 15; // Μικρότερο για mobile
let snake = [];
let food = {};
let direction = null;
let game = null;
let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;
let speed = 100;
let lastX = null;
let lastY = null;

// Αρχικοποίηση
document.getElementById("highScore").textContent = `High Score: ${highScore}`;
document.getElementById("startBtn").addEventListener("click", startGame);

function startGame() {
    // Reset game
    clearInterval(game);
    snake = [{ x: 10 * box, y: 10 * box }];
    food = generateFood();
    direction = null;
    score = 0;
    document.getElementById("currentScore").textContent = `Score: ${score}`;
    speed = parseInt(document.getElementById("difficulty").value);
    
    // Εκκίνηση accelerometer (αν υποστηρίζεται)
    setupAccelerometer();
    
    game = setInterval(drawGame, speed);
}

function generateFood() {
    return {
        x: Math.floor(Math.random() * (canvas.width / box)) * box,
        y: Math.floor(Math.random() * (canvas.height / box)) * box
    };
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "green" : "lightgreen";
        ctx.fillRect(segment.x, segment.y, box, box);
        ctx.strokeStyle = "black";
        ctx.strokeRect(segment.x, segment.y, box, box);
    });

    // Draw food
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // Move snake
    let head = { ...snake[0] };
    if (direction === "UP") head.y -= box;
    if (direction === "DOWN") head.y += box;
    if (direction === "LEFT") head.x -= box;
    if (direction === "RIGHT") head.x += box;

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById("currentScore").textContent = `Score: ${score}`;
        food = generateFood();
    } else {
        snake.pop();
    }

    // Check game over
    if (
        head.x < 0 || head.x >= canvas.width ||
        head.y < 0 || head.y >= canvas.height ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)
    ) {
        gameOver();
        return;
    }

    snake.unshift(head);
}

function gameOver() {
    clearInterval(game);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHighScore", highScore);
        document.getElementById("highScore").textContent = `High Score: ${highScore}`;
    }
    alert(`Game Over! Score: ${score}`);
}

// Accelerometer Logic
function setupAccelerometer() {
    if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", handleOrientation);
    } else {
        console.log("Accelerometer not supported");
    }
}

function handleOrientation(event) {
    const beta = event.beta;  // Κίνηση μπρος-πίσω (UP/DOWN)
    const gamma = event.gamma; // Κίνηση αριστερά-δεξιά (LEFT/RIGHT)
    
    if (Math.abs(gamma) > Math.abs(beta)) {
        direction = gamma > 10 ? "RIGHT" : "LEFT";
    } else {
        direction = beta > 10 ? "DOWN" : "UP";
    }
}

// Keyboard fallback
document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});