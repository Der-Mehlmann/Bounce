// Canvas Erstellung
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext('2d')

//Sounds: https://sfxr.me/
let soundEffects = true
const explosion = new Audio('explosion.wav');
const hit = new Audio('hit.wav');
const itemUnlock = new Audio('itemUnlock.wav');
const item = new Audio('item.wav');


// Eingabe listener
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("mousemove", mouseMoveHandler);



// Steuerung
let rightPressed = false;
let leftPressed = false;

// Paddle Vars
let paddleWidth = 75
let paddleHeight = 10
let paddleX = (canvas.width - paddleWidth) / 2;
let paddleSpeed = 5;

// Pause abfragen
let pause = true

// Bricks Vars
const bricks = [];

const brickWidth = 80;
const brickHeight = 30;
const brickPadding = 20;
const brickOffsetTop = 20;
const brickOffsetLeft = 20;

let rows = 3
let cols = 7

// Physics
let x = 250
let y = 450

let dx = 1
let dy = 1

// Ball Vars
let ballRad = 4

// Game Stats
let lives = 5
let points = 0
let hits = 0

let originalBallRad = 4;
let originalPaddleSpeed = 5;
let originalPaddleWidth = 75;
let originalLives = 5

let goal = rows * cols

// Item Vars
let itemTime = 5

let ran = 0

let bigBallLock = true
let fastPaddleLock = true
let longPaddleLock = true
let ballSpeedLock = true

let bigBallUnlock = false
let fastPaddleUnlock = false
let longPaddleUnlock = false
let ballSpeedUnlock = false

let bigBall = false
let fastPaddle = false
let longPaddle = false
let ballSpeed = false

let bigBallTimer = null;
let fastPaddleTimer = null;
let longPaddleTimer = null;
let ballSpeedTimer = null;


function HomeScreen() {


    document.getElementById("GAME").style.display = "none"
    document.getElementById("Stop-Win").style.display = "none"
    document.getElementById("Stop-Kill").style.display = "none"
    document.getElementById("GP").style.display = "none"
    document.getElementById("RG").style.display = "none"
    document.getElementById("start").style.display = "flex"
    document.getElementById("GR").style.display = "none"
    document.getElementById("stats").style.display = "none"
    document.getElementById("Items").style.display = "none"
    document.getElementById("HM").style.display = "none"
    document.getElementById("Settings").style.display = "none"
    document.getElementById("Settings-F").style.display = "none"

    // MainGameContainer wieder anzeigen, falls es ausgeblendet war
    document.getElementById("MainGameContainer").style.display = "flex"

}

document.getElementById("Settings-F").addEventListener("submit", function (e) {
    e.preventDefault();
    // Save logic here
    soundEffects = document.getElementById("soundEffects").checked;
    paddleWidth = parseInt(document.getElementById("paddleWidth").value)
    paddleSpeed = parseInt(document.getElementById("paddleSpeed").value)
    rows = parseInt(document.getElementById("rows").value)
    cols = parseInt(document.getElementById("cols").value)
    ballRad = parseInt(document.getElementById("ballRad").value)
    originalLives = parseInt(document.getElementById("livesS").value)
    lives = parseInt(document.getElementById("livesS").value)
    itemTime = parseInt(document.getElementById("itemTime").value)
    originalPaddleWidth = parseInt(document.getElementById("paddleWidth").value)
    originalBallRad = parseInt(document.getElementById("ballRad").value)
    originalPaddleSpeed = parseInt(document.getElementById("paddleSpeed").value)

    goal = rows * cols;

    HomeScreen()
});

//Game Durchlauf
setBrick()
let drawInterval

// Steuerungsfunktionen
function keyDownHandler(e) {
    if (e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "ArrowLeft") {
        leftPressed = true;
    } else if (e.key === "Escape") {
        gamePause();
    } else if (e.key === "1" && bigBallLock === false) {
        bigBall = true;
        itemBigBall()
        if (soundEffects === true) {
            itemSound()
        }
    } else if (e.key === "2" && fastPaddleLock === false) {
        fastPaddle = true
        itemFastPaddle()
        if (soundEffects === true) {
            itemSound()
        }
    } else if (e.key === "3" && longPaddleLock === false) {
        longPaddle = true
        itemlongPaddle()
        if (soundEffects === true) {
            itemSound()
        }
    } else if (e.key === "4" && ballSpeedLock === false) {
        ballSpeed = true
        itemBallSpeed()
        if (soundEffects === true) {
            itemSound()
        }
    }
}

function keyUpHandler(e) {
    if (e.key === "ArrowRight") {
        rightPressed = false;  // ← RICHTIG: FALSE beim Loslassen
    } else if (e.key === "ArrowLeft") {
        leftPressed = false;   // ← RICHTIG: FALSE beim Loslassen
    }
}

function mouseMoveHandler(e) {
    const rect = canvas.getBoundingClientRect()
    const relativeX = e.clientX - rect.left
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

const brickTexture = new Image()
brickTexture.src = "brick-texture.png"

// Draw Funktionen
function drawBricks() {
    const rowColors = ["#803200", "#B54400", "#D94E10", "#F25C05", "#CC7000", "#F28C05", "#F2A341", "#FFD9B3"]

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const b = bricks[r][c]
            if (b.status === 1) {
                ctx.beginPath()
                ctx.rect(b.x, b.y, brickWidth, brickHeight)
                ctx.fillStyle = rowColors[r % rowColors.length]
                ctx.strokeStyle = "#260C02"
                ctx.stroke()
                if (b.brickLives === 3) {
                    ctx.fillStyle = "#000000"
                }
                if (b.brickLives === 2) {
                    ctx.fillStyle = "#555555"
                }
                ctx.fill()
                if (b.brickLives > 1) {
                    ctx.drawImage(
                        brickTexture,
                        b.x, b.y,
                        brickWidth, brickHeight
                    );
                }
            }
        }
    }
}

function drawCircle(x, y, color) {
    ctx.beginPath();
    ctx.arc(x, y, ballRad, 0, Math.PI * 2, false)
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = '#260C02'
    ctx.stroke()
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#260C02";
    ctx.fill();
    ctx.closePath();
}

function safeBallPosition() {
    const lowBrickY = brickOffsetTop + (rows * (brickHeight + brickPadding))

    const safeY = lowBrickY + 25

    const paddleY = canvas.height - paddleHeight
    const distancePaddle = 100

    return Math.min(safeY, paddleY - distancePaddle)
}

// Init Funktionen
function setBrick() {
    for (let r = 0; r < rows; r++) {
        bricks[r] = [];
        for (let c = 0; c < cols; c++) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;

            let brickLives;
            const random = Math.random();

            if (random < 0.70) {
                brickLives = 1;
            } else if (random < 0.95) {
                brickLives = 2;
            } else {
                brickLives = 3;
            }

            bricks[r][c] = {
                x: brickX,
                y: brickY,
                status: 1,
                brickLives: brickLives,
            };
        }
    }
}

// Physik Funktionen
function collisionDetection() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const b = bricks[r][c];
            if (b.status === 1) {
                // Kollisionsprüfung
                if (x + ballRad > b.x && x - ballRad < b.x + brickWidth &&
                    y + ballRad > b.y && y - ballRad < b.y + brickHeight) {

                    // Bestimme Kollisionsrichtung
                    const overlapLeft = (x + ballRad) - b.x;
                    const overlapRight = (b.x + brickWidth) - (x - ballRad);
                    const overlapTop = (y + ballRad) - b.y;
                    const overlapBottom = (b.y + brickHeight) - (y - ballRad);

                    const minOverlapX = Math.min(overlapLeft, overlapRight);
                    const minOverlapY = Math.min(overlapTop, overlapBottom);

                    if (minOverlapX < minOverlapY) {
                        // Horizontale Kollision - Ball seitlich rausschieben
                        if (overlapLeft < overlapRight) {
                            x = b.x - ballRad - 1; // Links rausschieben
                        } else {
                            x = b.x + brickWidth + ballRad + 1; // Rechts rausschieben
                        }
                        dx = -dx; // Dann Richtung ändern
                    } else {
                        // Vertikale Kollision - Ball hoch/runter schieben
                        if (overlapTop < overlapBottom) {
                            y = b.y - ballRad - 1; // Nach oben schieben
                        } else {
                            y = b.y + brickHeight + ballRad + 1; // Nach unten schieben
                        }
                        dy = -dy; // Dann Richtung ändern
                    }

                    // Sound abspielen
                    if (soundEffects === true) {
                        soundExplode();
                    }

                    b.brickLives -= 1;

                    if (b.brickLives <= 0) {
                        b.status = 0;
                        hits++;
                        points += 10;

                        // Zufälliges Item (20% Chance)
                        if (Math.random() < 0.2) {
                            const ran = Math.floor(Math.random() * 4) + 1;
                            itemLock(ran);
                        }
                    }
                }
            }
        }
    }
}

//Visual Effects
function screenFlash() {
    const flash = document.getElementById("screen-flash");
    flash.style.opacity = "0.5";  // Sichtbar machen
    setTimeout(() => {
        flash.style.opacity = "0";  // Schnell wieder ausblenden
    }, 100);
}


//Sound Funktionen
function soundExplode() {
    explosion.play()
}

function soundHit() {
    if (y + ballRad >= 600) {
        hitAndKill()

        if (soundEffects === true) {
            hit.play()
        }
    }
}

function soundItemUnlock() {
    itemUnlock.play()
}

function itemSound() {
    item.play()
}




// Game Funktionen
function kill() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    pause = true

    document.getElementById("GAME").style.display = "none"
    document.getElementById("Stop-Kill").style.display = "flex"
    document.getElementById("GP").style.display = "none"
    document.getElementById("stats").style.display = "none"
    document.getElementById("Items").style.display = "none"
    document.getElementById("Stop-Kill-JS").innerHTML = `You achieved ${points} Points`
}

function winner() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    pause = true

    document.getElementById("GAME").style.display = "none"
    document.getElementById("Stop-Win").style.display = "flex"
    document.getElementById("GP").style.display = "none"
    document.getElementById("stats").style.display = "none"
    document.getElementById("Items").style.display = "none"
    document.getElementById("Stop-Win-JS").innerHTML = `You achieved ${points} Points`
}

function hitAndKill() {
    lives = lives - 1
    document.getElementById("LivesJS").innerHTML = `${lives}`
    screenFlash()

    if (lives <= 0) {
        fastPaddle = false
        bigBall = false
        longPaddle = false
        ballSpeed = false
        kill()
    }
}

function clearAllItemTimers() {
    if (bigBallTimer) {
        clearInterval(bigBallTimer);
        bigBallTimer = null;
    }
    if (fastPaddleTimer) {
        clearInterval(fastPaddleTimer);
        fastPaddleTimer = null;
    }
    if (longPaddleTimer) {
        clearInterval(longPaddleTimer);
        longPaddleTimer = null;
    }
    if (ballSpeedTimer) {
        clearInterval(ballSpeedTimer);
        ballSpeedTimer = null;
    }

    // Alle Puls-Animationen entfernen
    document.getElementById("BB-IMG").classList.remove("pulse");
    document.getElementById("FP-IMG").classList.remove("pulse");
    document.getElementById("LP-IMG").classList.remove("pulse");
    document.getElementById("D-IMG").classList.remove("pulse");

    // Alle Item-Icons aufgesperrt setzen
    document.getElementById("BB-IMG").style.filter = "grayscale(100%) brightness(50%)";
    document.getElementById("FP-IMG").style.filter = "grayscale(100%) brightness(50%)";
    document.getElementById("LP-IMG").style.filter = "grayscale(100%) brightness(50%)";
    document.getElementById("D-IMG").style.filter = "grayscale(100%) brightness(50%)";
}

function gameRestart() {
    clearAllItemTimers()

    // Spielwerte zurücksetzen (aber Benutzer-Settings beibehalten)
    lives = originalLives  // Benutzer-gewählte Anzahl Leben
    points = 0
    hits = 0

    // Ball und Paddle auf Benutzer-gewählte Grundwerte zurücksetzen
    ballRad = originalBallRad        // Benutzer-gewählte Ball-Größe
    paddleSpeed = originalPaddleSpeed // Benutzer-gewählte Paddle-Geschwindigkeit
    paddleWidth = originalPaddleWidth // Benutzer-gewählte Paddle-Breite

    // Alle temporären Item-Effekte deaktivieren
    bigBall = false
    fastPaddle = false
    longPaddle = false
    ballSpeed = false

    // Item-System zurücksetzen
    bigBallLock = true
    fastPaddleLock = true
    longPaddleLock = true
    ballSpeedLock = true

    bigBallUnlock = false
    fastPaddleUnlock = false
    longPaddleUnlock = false
    ballSpeedUnlock = false

    // Spiel-Status zurücksetzen
    pause = false

    // Ball-Position und Grundgeschwindigkeit zurücksetzen
    x = canvas.width / 2
    y = safeBallPosition()
    dx = 1
    dy = -1

    // Paddle-Position zurücksetzen (basierend auf aktueller Breite)
    paddleX = (canvas.width - paddleWidth) / 2

    console.log("originalLives:", originalLives);
    console.log("lives:", lives);

    setBrick()
    draw()

    document.getElementById("LivesJS").innerHTML = `${lives}`
    document.getElementById("start").style.display = "none"
    document.getElementById("Stop-Win").style.display = "none"
    document.getElementById("Stop-Kill").style.display = "none"
    document.getElementById("RG").style.display = "none"
    document.getElementById("GAME").style.display = "block"
    document.getElementById("GP").style.display = "flex"
    document.getElementById("GR").style.display = "none"
    document.getElementById("stats").style.display = "flex"
    document.getElementById("Items").style.display = "flex"
    document.getElementById("HM").style.display = "none"
    gameLoop()
}



function gameStart() {
    lives = originalLives
    console.log("originalLives:", originalLives);
    console.log("lives:", lives);
    points = 0
    hits = 0
    bigBall = false
    fastPaddle = false
    longPaddle = false
    ballSpeed = false
    pause = false

    setBrick()

    x = canvas.width / 2
    y = safeBallPosition()
    dx = 1
    dy = -1

    draw()
    pause = false
    document.getElementById("LivesJS").innerHTML = `${lives}`
    document.getElementById("start").style.display = "none"
    document.getElementById("GAME").style.display = "block"
    document.getElementById("GP").style.display = "flex"
    document.getElementById("stats").style.display = "flex"
    document.getElementById("Items").style.display = "flex"
    document.getElementById("MainGameContainer").style.display = "flex"
    gameLoop()
}

function settings() {
    document.getElementById("MainGameContainer").style.display = "none"
    document.getElementById("start").style.display = "none"
    document.getElementById("Settings").style.display = "flex"
    document.getElementById("Settings-F").style.display = "flex"
    document.getElementsByTagName("form")[0].style.display = "flex"
}

function gamePause() {
    pause = true

    document.getElementById("GAME").style.display = "none"
    document.getElementById("GP").style.display = "none"
    document.getElementById("GR").style.display = "flex"
    document.getElementById("RG").style.display = "flex"
    document.getElementById("Items").style.display = "none"
    document.getElementById("HM").style.display = "flex"

}

function gameResume() {
    pause = false


    document.getElementById("GAME").style.display = "block"
    document.getElementById("GP").style.display = "flex"
    document.getElementById("GR").style.display = "none"
    document.getElementById("RG").style.display = "none"
    document.getElementById("Items").style.display = "flex"
    document.getElementById("HM").style.display = "none"
    gameLoop()

}

//Item-Funktionen
function unlockBigBall() {
    document.getElementById("BB-IMG").style.filter = "grayscale(0%)"
    bigBallLock = false
    if (soundEffects === true && bigBallUnlock === false) {
        soundItemUnlock()
        bigBallUnlock = true
    }
}

function unlockFastPaddle() {
    document.getElementById("FP-IMG").style.filter = "grayscale(0%)"
    fastPaddleLock = false
    if (soundEffects === true && fastPaddleUnlock === false) {
        soundItemUnlock()
        fastPaddleUnlock = true
    }
}

function unlockLongPaddle() {
    document.getElementById("LP-IMG").style.filter = "grayscale(0%)"
    longPaddleLock = false
    if (soundEffects === true && longPaddleUnlock === false) {
        soundItemUnlock()
        longPaddleUnlock = true
    }
}

function unlockBallSpeed() {
    document.getElementById("D-IMG").style.filter = "grayscale(0%)"
    ballSpeedLock = false
    if (soundEffects === true && ballSpeedUnlock === false) {
        soundItemUnlock()
        ballSpeedUnlock = true
    }
}

function startCountdownBigBall() {
    const img = document.getElementById("BB-IMG");
    img.classList.add("pulse");

    let remaining = itemTime;
    bigBallTimer = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(bigBallTimer);
            bigBallTimer = null;
            img.classList.remove("pulse");
            ballRad = originalBallRad
            bigBall = false;
            bigBallLock = true;
            bigBallUnlock = false
            img.style.filter = "grayscale(100%) brightness(50%)";
        }
    }, 1000);
}


function startCountdownFastPaddle() {
    const img = document.getElementById("FP-IMG");
    img.classList.add("pulse");

    let remaining = itemTime;
    fastPaddleTimer = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(fastPaddleTimer);
            fastPaddleTimer = null;
            img.classList.remove("pulse");
            paddleSpeed = originalPaddleSpeed
            fastPaddle = false;
            fastPaddleLock = true;
            fastPaddleUnlock = false;
            img.style.filter = "grayscale(100%) brightness(50%)";
        }
    }, 1000);
}

function startCountdownLongPaddle() {
    const img = document.getElementById("LP-IMG");
    img.classList.add("pulse");

    let remaining = itemTime;
    longPaddleTimer = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(longPaddleTimer);
            longPaddleTimer = null;
            img.classList.remove("pulse");
            paddleWidth = originalPaddleWidth
            longPaddle = false;
            longPaddleLock = true;
            longPaddleUnlock = false;
            img.style.filter = "grayscale(100%) brightness(50%)";
        }
    }, 1000);
}

function startCountdownBallSpeed() {
    const img = document.getElementById("D-IMG");
    img.classList.add("pulse");

    let remaining = itemTime;
    ballSpeedTimer = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(ballSpeedTimer);
            ballSpeedTimer = null;
            img.classList.remove("pulse");
            ballSpeed = false;
            ballSpeedLock = true
            dx = dx / 2
            dy = dy / 2
            ballSpeedUnlock = false;
            img.style.filter = "grayscale(100%) brightness(50%)";
        }
    }, 1000);
}


function itemLock(ran) {
    if (ran === 1) {
        unlockBigBall();
    }
    if (ran === 2) {
        unlockFastPaddle();
    }
    if (ran === 3) {
        unlockLongPaddle();
    }
    if (ran === 4) {
        unlockBallSpeed();
    }
}


function itemBigBall() {
    startCountdownBigBall()

    if (bigBall === true && ballRad !== ballRad * 2) {
        ballRad = ballRad * 2
        bigBallLock = true
    }
}

function itemFastPaddle() {
    startCountdownFastPaddle()

    if (fastPaddle === true && paddleSpeed !== paddleSpeed * 2) {
        paddleSpeed = paddleSpeed * 2
        fastPaddleLock = true
    }
}

function itemlongPaddle() {
    startCountdownLongPaddle()

    if (longPaddle === true && paddleSpeed !== paddleSpeed * 2) {
        paddleWidth = paddleWidth * 2
        longPaddleLock = true
    }
}

function itemBallSpeed() {
    startCountdownBallSpeed()

    if (ballSpeed === true) {

        dx = dx * 2
        dy = dy * 2
        ballSpeedLock = true
    }
}


//Game
function draw() {
    if (pause) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (y + ballRad >= 600) {
        if (soundEffects === true) {
            soundHit()
        } else {
            hitAndKill()
        }
    }

    drawBricks();
    drawCircle(x, y, '#F24405')
    drawPaddle()


    if (hits === goal) {
        winner()
    }


    collisionDetection()


    if (x + ballRad >= canvas.width || x - ballRad <= 0) {
        dx = -dx
    }

    if (y + ballRad >= canvas.height || y - ballRad <= 0) {
        dy = -dy
    }

    if ((paddleX <= x + ballRad && x + ballRad <= paddleX + paddleWidth)
        && (canvas.height - paddleHeight <= y + ballRad && y + ballRad <= canvas.height)) {
        dy = -dy;
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += paddleSpeed;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= paddleSpeed;
    }


    document.getElementById("PointsJS").innerHTML = `${points}`


    x += dx
    y += dy
}

//drawInterval = setInterval(draw, 5)
function gameLoop() {
    draw();
    if (!pause) {
        requestAnimationFrame(gameLoop);  // ~60 FPS, optimiert
    }
}