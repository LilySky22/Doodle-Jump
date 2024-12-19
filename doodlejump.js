// Initialize variables
let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

// Doodler
let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = boardWidth / 2 - doodlerWidth / 2;
let doodlerY = boardHeight * 7 / 8 - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

let doodler = {
    img: null,
    x: doodlerX,
    y: doodlerY,
    width: doodlerWidth,
    height: doodlerHeight,
    isJumping: false
}


// Physics
let velocityX = 0;
let velocityY = -6; // start with a moderate jump speed
let initialVelocityY = -6; // higher starting jump velocity
let gravity = 0.2; // lower gravity at the start

// Platforms
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

let score = 0;
let maxScore = 0;
let gameOver = false;
let timeElapsed = 0; // to track how long the game has been running

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Load images
    doodlerRightImg = new Image();
    doodlerRightImg.src = "./doodler-right.png";
    doodler.img = doodlerRightImg;
    doodlerRightImg.onload = function () {
        context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    }

    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "./doodler-left.png";

    platformImg = new Image();
    platformImg.src = "./platform.png";

    velocityY = initialVelocityY;
    placePlatforms();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveDoodler);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // Increase speed over time
    timeElapsed += 1;
    if (timeElapsed % 300 == 0) { // Every 300 frames, increase speed
        gravity += 0.05; // Increase gravity to make the game faster
        if (velocityY > -12) { // Limit jump speed to avoid too fast jumps
            velocityY -= 0.5; // Decrease the jump speed to make jumps less powerful
        }
    }

    // Doodler
    doodler.x += velocityX;
    if (doodler.x > boardWidth) {
        doodler.x = 0;
    }
    else if (doodler.x + doodler.width < 0) {
        doodler.x = boardWidth;
    }

    velocityY += gravity;
    doodler.y += velocityY;
    if (doodler.y > board.height) {
        gameOver = true;
    }
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    // Platforms
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];
        if (velocityY < 0 && doodler.y < boardHeight * 3 / 4) {
            platform.y -= initialVelocityY; // slide platform down
        }
        if (detectCollision(doodler, platform) && velocityY >= 0) {
            velocityY = initialVelocityY; // jump
        }
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    // Clear platforms and add new platform
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift(); // remove the first element from the array
        newPlatform(); // replace with new platform on top
    }

    // Score
    updateScore();
    context.font = "20px 'Press Start 2P', sans-serif"; // Use the desired font
    context.fillStyle = "white"; // Set fill color to white
    context.strokeStyle = "black"; // Set stroke color to black
    context.lineWidth = 2; // Set the outline width
    context.fillText("Score: " + score, 10, 30); // Fill text with white
    context.strokeText("Score: " + score, 10, 30); // Stroke (outline) text with black

    if (gameOver) {
        showGameOver();
    }
}

function showGameOver() {
    context.font = "32px 'Press Start 2P', sans-serif"; // Use the desired font
    context.fillStyle = "white"; // Set fill color to white
    context.strokeStyle = "black"; // Set stroke color to black
    context.lineWidth = 2; // Set the outline width
    context.fillText("Game Over!", boardWidth / 2 - 75, boardHeight / 2); // Fill text with white
    context.strokeText("Game Over!", boardWidth / 2 - 75, boardHeight / 2); // Stroke (outline) text with black

    context.font = "20px 'Press Start 2P', sans-serif"; // Use the desired font
    context.fillText("Press 'Space' to Restart", boardWidth / 2 - 120, boardHeight / 2 + 30); // Fill text with white
    context.strokeText("Press 'Space' to Restart", boardWidth / 2 - 120, boardHeight / 2 + 30); // Stroke (outline) text with black
}


function moveDoodler(e) {
    if (e.code == "ArrowRight" || e.code == "KeyD") { // move right
        velocityX = 4;
        doodler.img = doodlerRightImg;
    }
    else if (e.code == "ArrowLeft" || e.code == "KeyA") { // move left
        velocityX = -4;
        doodler.img = doodlerLeftImg;
    }
    else if (e.code == "Space" && gameOver) {
        // reset
        doodler = {
            img: doodlerRightImg,
            x: doodlerX,
            y: doodlerY,
            width: doodlerWidth,
            height: doodlerHeight
        }

        velocityX = 0;
        velocityY = initialVelocityY;
        score = 0;
        maxScore = 0;
        gameOver = false;
        timeElapsed = 0; // reset the time counter
        placePlatforms();
    }
}

function placePlatforms() {
    platformArray = [];

    // Starting platforms
    let platform = {
        img: platformImg,
        x: boardWidth / 2,
        y: boardHeight - 50,
        width: platformWidth,
        height: platformHeight
    }

    platformArray.push(platform);

    for (let i = 0; i < 6; i++) {
        let randomX = Math.floor(Math.random() * boardWidth * 3 / 4); //(0-1) * boardWidth*3/4
        let platform = {
            img: platformImg,
            x: randomX,
            y: boardHeight - 75 * i - 150,
            width: platformWidth,
            height: platformHeight
        }

        platformArray.push(platform);
    }
}

function newPlatform() {
    let randomX = Math.floor(Math.random() * boardWidth * 3 / 4); //(0-1) * boardWidth*3/4
    let platform = {
        img: platformImg,
        x: randomX,
        y: -platformHeight,
        width: platformWidth,
        height: platformHeight
    }

    platformArray.push(platform);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   // a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   // a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  // a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    // a's bottom left corner passes b's top left corner
}

function updateScore() {
    let points = Math.floor(50 * Math.random()); // (0-1) *50 --> (0-50)
    if (velocityY < 0) { // negative going up
        maxScore += points;
        if (score < maxScore) {
            score = maxScore;
        }
    }
    else if (velocityY >= 0) {
        maxScore -= points;
    }
}

function showGameOver() {
    context.fillText("Game Over!", boardWidth / 2 - 75, boardHeight / 2);
    context.fillText("Press 'Space' to Restart", boardWidth / 2 - 120, boardHeight / 2 + 30);
}
