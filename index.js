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
//document.addEventListener("keyup", keyUpHandler);
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
    if (document.getElementById("soundEffects").checked) {
        soundEffects = true
    } else {
        soundEffects = false
    }
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

function mouseMoveHandler(e) {
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

// Draw Funktionen
function drawBricks() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const b = bricks[r][c];
            if (b.status === 1) {
                ctx.beginPath();
                ctx.rect(b.x, b.y, brickWidth, brickHeight);
                ctx.fillStyle = "#F25C05";
                ctx.fill();
                ctx.strokeStyle = "#260C02";
                ctx.stroke();
            }
        }
    }
}

function drawCircle(x, y, color) {
    ctx.beginPath();
    ctx.arc(x, y, ballRad, 0, Math.PI * 2, false);
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = '#260C02';
    ctx.stroke();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#260C02";
    ctx.fill();
    ctx.closePath();
}


// Init Funktionen
function setBrick() {
    for (let r = 0; r < rows; r++) {
        bricks[r] = [];
        for (let c = 0; c < cols; c++) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            bricks[r][c] = {
                x: brickX,
                y: brickY,
                status: 1
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
                // Kollisionsbereich des Balls
                const ballLeft = x - ballRad;
                const ballRight = x + ballRad;
                const ballTop = y - ballRad;
                const ballBottom = y + ballRad;

                // Kollisionsbereich des Bricks
                const brickLeft = b.x;
                const brickRight = b.x + brickWidth;
                const brickTop = b.y;
                const brickBottom = b.y + brickHeight;

                // Check for overlap (AABB collision detection)
                const isCollision = (
                    ballRight > brickLeft &&
                    ballLeft < brickRight &&
                    ballBottom > brickTop &&
                    ballTop < brickBottom
                );

                if (isCollision) {
                    // Bestimme die Tiefe der Überlappung
                    const overlapLeft = ballRight - brickLeft;
                    const overlapRight = brickRight - ballLeft;
                    const overlapTop = ballBottom - brickTop;
                    const overlapBottom = brickBottom - ballTop;

                    const minOverlapX = Math.min(overlapLeft, overlapRight);
                    const minOverlapY = Math.min(overlapTop, overlapBottom);

                    // Reaktion: Richtung ändern je nach Kollisionstiefe
                    if (minOverlapX < minOverlapY) {
                        dx = -dx;
                    } else {
                        dy = -dy;
                    }

                    if (soundEffects === true) {
                        soundExplode()
                    }
                    b.status = 0; // Brick entfernen
                    hits++;
                    points++;

                    // Zufälliges Item bestimmen
                    ran = Math.floor(Math.random() * 5) + 1;
                    itemLock()
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

function gameRestart() {

    lives = originalLives
    points = 0
    hits = 0
    bigBall = false
    fastPaddle = false
    longPaddle = false
    ballSpeed = false
    pause = false

    x = canvas.width / 2
    y = canvas.height - 30
    dx = 1
    dy = -1
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
    draw()
    pause = false
    document.getElementById("LivesJS").innerHTML = `${lives}`
    document.getElementById("start").style.display = "none"
    document.getElementById("GAME").style.display = "block"
    document.getElementById("GP").style.display = "flex"
    document.getElementById("stats").style.display = "flex"
    document.getElementById("Items").style.display = "flex"
    document.getElementById("MainGameContainer").style.display = "flex"
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
    // Klasse hinzufügen → startet das Pulsieren
    img.classList.add("pulse");

    let remaining = itemTime;
    const interval = setInterval(() => {
        remaining--;

        // hier könntest du noch per innerText o.Ä. die Sekunde anzeigen …
        if (remaining <= 0) {
            clearInterval(interval);
            // Countdown zu Ende → Puls‑Effekt entfernen
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
    img.classList.add("pulse");   // Puls‑Animation einschalten

    let remaining = itemTime;
    const interval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(interval);
            img.classList.remove("pulse");  // Puls‑Animation ausschalten

            paddleSpeed = originalPaddleSpeed
            fastPaddle = false;
            fastPaddleLock = true;
            paddleSpeed = paddleSpeed / 2;
            fastPaddleUnlock = false;
            img.style.filter = "grayscale(100%) brightness(50%)";
        }
    }, 1000);
}

function startCountdownLongPaddle() {
    const img = document.getElementById("LP-IMG");
    img.classList.add("pulse");

    let remaining = itemTime;
    const interval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(interval);
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
    const interval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(interval);
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


function itemLock() {
    if (ran === 1) {
        unlockBigBall()
    }
    if (ran === 2) {
        unlockFastPaddle()
    }
    if (ran === 3) {
        unlockLongPaddle()
    }
    if (ran === 4) {
        unlockBallSpeed()
    }
}


function itemBigBall() {
    startCountdownBigBall()

    if (bigBall === true && ballRad != ballRad * 2) {
        ballRad = ballRad * 2
        bigBallLock = true
    }
}

function itemFastPaddle() {
    startCountdownFastPaddle()

    if (fastPaddle === true && paddleSpeed != paddleSpeed * 2) {
        paddleSpeed = paddleSpeed * 2
        fastPaddleLock = true
    }
}

function itemlongPaddle() {
    startCountdownLongPaddle()

    if (longPaddle === true && paddleSpeed != paddleSpeed * 2) {
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

    let xxx = 0
    xxx++

    console.log(xxx)
}

drawInterval = setInterval(draw, 5)
