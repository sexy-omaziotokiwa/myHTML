import Ball from './ball.js'
import Paddle from './paddle.js'

const ball = new Ball(document.getElementById("ball"));
const playerPaddle = new Paddle(document.getElementById("player-paddle"));
const compPaddle = new Paddle(document.getElementById("computer-paddle"));
const playerScoreElem = document.getElementById("player-score")
const computerScoreElem = document.getElementById("computer-score")

// update loop
let lastTime;
function update(time) {
    if (lastTime != null) {
        const delta = time - lastTime;
        // update ball
        ball.update(delta, [playerPaddle.rect(), compPaddle.rect()]);
        // update computer's move
        compPaddle.update(delta, ball.y)
        const hue = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hue"))
        document.documentElement.style.setProperty("--hue", hue + ( delta*0.01 ))

        if (isLose())
            handleLose()
    }
    lastTime = time;
    window.requestAnimationFrame(update);
}

function isLose() {
    const rect = ball.rect()
    return rect.right >= window.innerWidth || rect.left <= 0
}

function handleLose() {
    const rect = ball.rect()
    if (rect.right >= window.innerWidth) {
        console.log(playerScoreElem.textContent)
        playerScoreElem.textContent = parseInt(playerScoreElem.textContent) + 1
    }
    else {
        computerScoreElem.textContent = parseInt(computerScoreElem.textContent) + 1

    }
    ball.reset()
    compPaddle.reset()
}

// update user mouse
document.addEventListener("mousemove" , e => {
    playerPaddle.position = (e.y / window.innerHeight) * 100
})

window.requestAnimationFrame(update);