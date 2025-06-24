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

let a = 225
let b = 590

let dx = 1
let dy = 1

// Ball Vars
let ballRad = 4

// Game Stats
let lives = 5
let points = 0
let hits = 0

let goal = rows * cols

// Item Vars
let itemTime = 5

let ran = 0

let bigBallLock = true
let fastPaddleLock = true
let longPeddalLock = true
let damageLock = true

let bigBallUnlock = false
let fastPaddleUnlock = false
let longPeddalUnlock = false
let damageUnlock = false

let bigBall = false
let fastPaddle = false
let longPeddal = false
let damage = false

// Steuerungsfunktionen
function keyDownHandler(e) {
    if (e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "ArrowLeft") {
        leftPressed = true;
    } else if (e.key === "Escape") {
        gamePause();
    } else if (e.key === "1" && bigBallLock === false) {
        itemBigBall()
        if (soundEffects === true) {
            itemSound()
        }
    } else if (e.key === "2" && fastPaddleLock === false) {
        itemFastPaddle()
        if (soundEffects === true) {
            itemSound()
        }
    } else if (e.key === "3" && longPeddalLock === false) {
        itemlongPeddal()
        if (soundEffects === true) {
            itemSound()
        }
    }else if (e.key === "4" && damageLock === false) {
        itemDamage()
        if (soundEffects === true) {
            itemSound()
        }
    }
}

function keyUpHandler(e) {
    if (e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "ArrowLeft") {
        leftPressed = false;
    } else if (e.key === "Escape") {
        gamePause();
    } else if (e.key === "1" && bigBallLock === false) {
        itemBigBall()
        if (soundEffects === true) {
            itemSound()
        }
    } else if (e.key === "2" && fastPaddleLock === false) {
        itemFastPaddle()
        if (soundEffects === true) {
            itemSound()
        }
    } else if (e.key === "3" && longPeddalLock === false) {
        itemlongPeddal()
        if (soundEffects === true) {
            itemSound()
        }
    }else if (e.key === "4" && damageLock === false) {
        itemDamage()
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

function drawPaddle(a, b, color) {
    ctx.beginPath()
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight)
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = '#260C02';
    ctx.stroke();
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
    hit.play()
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
    lives--
    document.getElementById("LivesJS").innerHTML = `${lives}`
    screenFlash()

    if (lives === 0) {
        fastPaddle = false
        bigBall = false
        kill()
    }
}

function gameRestart() {
    lives = 5
    points = 0
    hits = 0
    bigBall = false
    fastPaddle = false
    longPeddal = false
    damage = false
    pause = false

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

function HomeScreen() {
    lives = 5
    points = 0
    hits = 0
    bigBall = false
    fastPaddle = false
    longPeddal = false
    damage = false
    pause = true

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
    document.getElementById("settings").style.display = "none"


}

function gameStart() {
    setBrick()
    draw()
    speed = 5
    pause = false
    document.getElementById("start").style.display = "none"
    document.getElementById("GAME").style.display = "block"
    document.getElementById("GP").style.display = "flex"
    document.getElementById("stats").style.display = "flex"
    document.getElementById("Items").style.display = "flex"
}

function settings() {
    document.getElementById("MainGameContainer").style.display = "none"
    document.getElementById("start").style.display = "none"
    document.getElementById("Settings").style.display = "flex"
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

function unlockLongPeddal() {
    document.getElementById("LP-IMG").style.filter = "grayscale(0%)"
    longPeddalLock = false
    if (soundEffects === true && longPeddalUnlock === false) {
        soundItemUnlock()
        longPeddalUnlock = true
    }
}

function unlockDamage() {
    document.getElementById("D-IMG").style.filter = "grayscale(0%)"
    damageLock = false
    if (soundEffects === true && damageUnlock === false) {
        soundItemUnlock()
        damageUnlock = true
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

            bigBall = false;
            bigBallLock = true;
            ballRad = ballRad / 2;
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

            longPeddal = false;
            longPeddalLock = true;
            paddleWidth = paddleWidth / 2;
            longPeddalUnlock = false;
            img.style.filter = "grayscale(100%) brightness(50%)";
        }
    }, 1000);
}

function startCountdownDamage() {
    const img = document.getElementById("D-IMG");
    img.classList.add("pulse");

    let remaining = itemTime;
    const interval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(interval);
            img.classList.remove("pulse");

            damage = false;
            damageLock = true;
            damageUnlock = false;
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
        unlockLongPeddal()
    }
    if (ran === 4) {
        unlockDamage()
    }
}


function itemBigBall() {
    startCountdownBigBall()

    if (bigBall === true) {
        ballRad = ballRad * 2
    }
}

function itemFastPaddle() {
    startCountdownFastPaddle()

    if (fastPaddle === true) {
        paddleSpeed = paddleSpeed * 2
    }
}

function itemlongPeddal() {
    startCountdownLongPaddle()

    if (longPeddal === true) {
        paddleWidth = paddleWidth * 2
    }
}

function itemDamage() {
    startCountdownDamage()

    if (damage === true) {

    }
}



//Game
function draw() {
    if (pause) return;

    itemLock()

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (y + ballRad >= 600) {
        hitAndKill()

        if (soundEffects === true) {
            soundHit()
        }
    }

    drawBricks();
    drawCircle(x, y, '#F24405')
    drawPaddle(a, b, '#260C02')


    if (hits === goal) {
        winner()
    }

    if (bigBallLock === false) {
        bigBall = true
        unlockBigBall()
    }
    if (fastPaddleLock === false) {
        fastPaddle = true
        unlockFastPaddle()
    }
    if (longPeddalLock === false) {
        longPeddal = true
        unlockLongPeddal()
    }
    if (damageLock === false) {
        damage = true
        unlockDamage()
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


    if (rightPressed && paddleX < canvas.width - paddleWidth && fastPaddle === false) {
        paddleX += paddleSpeed;
    } else if (leftPressed && paddleX > 0 && fastPaddle === false) {
        paddleX -= paddleSpeed;
    } else if (rightPressed && paddleX < canvas.width - paddleWidth && fastPaddle === true) {
        paddleX += paddleSpeed;
    } else if (leftPressed && paddleX > 0 && fastPaddle === true) {
        paddleX -= paddleSpeed;
    }


    document.getElementById("PointsJS").innerHTML = `${points}`

    x += dx
    y -= dy


}

//Game Durchlauf
setBrick()
let drawInterval
drawInterval = setInterval(draw, 5)