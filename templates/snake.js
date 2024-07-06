let start = { x: 0, y: 0 };
let eatSound = new Audio('assets/music/eat.mp3');
let overSound = new Audio('assets/music/over.mp3');
let turnSound = new Audio('assets/music/turn.mp3');
let snakeArr = [{ x: 13, y: 15 }]
let speed = 10;
let score = 0;
let hiscoreval = 0;
let lastPaintTime = 0;
let food = { x: 12, y: 13 };

fetch('/snake-game/get-data')
    .then(response => response.json())
    .then(data => {
        const un = data.username;
        const hs = data.hiscore;
        localStorage.setItem('username', JSON.stringify(un));
        hiscoreval = hs;
        hiscoreBox.innerHTML = "Hi Score: " + hiscoreval;
    })
    .catch(e => {
        console.log(e);
    })

async function updateScore(score) {
    let un = localStorage.getItem('username');
    let obj = JSON.parse(un);
    const response = await fetch('/snake-game/' + obj + '/' + score, {
        method: 'PATCH'
    });
    const doc = await response.json();
}

const log = document.getElementById('logout');
log.addEventListener('click', function () {
    localStorage.removeItem('username');
    window.location.href = '/snake-game/logout';

})

function main(timestamp) {
    window.requestAnimationFrame(main);
    if ((timestamp - lastPaintTime) / 1000 < 1 / speed) {
        return;
    }
    lastPaintTime = timestamp;
    gameEngine();
}

function isCollide(snake) {
    // Snake collides with itself
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }
    // Snake collides with the wall
    if (snake[0].x + start.x > 18 || snake[0].x + start.x < 1 || snake[0].y + start.y > 18 || snake[0].y + start.y < 1) {
        return true;
    }

    return false;
}

function gameEngine() {
    //If snake collides
    if (isCollide(snakeArr)) {
        overSound.play();
        start = { x: 0, y: 0 };
        alert("Game Over. Press Enter to play again!");
        snakeArr = [{ x: 13, y: 15 }];
        score = 0;
        scoreBox.innerHTML = "Score: " + score;
    }

    //If snake eats the food
    if (snakeArr[0].y === food.y && snakeArr[0].x === food.x) {
        eatSound.play();
        score += 1;
        if (score > hiscoreval) {
            hiscoreval = score;

            updateScore(score);
            // localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
            hiscoreBox.innerHTML = "Hi Score: " + hiscoreval;
        }
        scoreBox.innerHTML = "Score: " + score;
        snakeArr.unshift({ x: snakeArr[0].x + start.x, y: snakeArr[0].y + start.y });
        let a = 1;
        let b = 18;
        food = { x: Math.round(a + (b - a) * Math.random()), y: Math.round(a + (b - a) * Math.random()) }
    }

    // Moving the snake
    for (let i = snakeArr.length - 2; i >= 0; i--) {
        snakeArr[i + 1] = { ...snakeArr[i] };//to avoid referncing of objects// new object is created
    }

    snakeArr[0].x += start.x;
    snakeArr[0].y += start.y;

    //Displaying snake and food
    board.innerHTML = "";
    snakeArr.forEach((e, index) => {
        snakeElement = document.createElement('div');
        snakeElement.style.gridRowStart = e.y;
        snakeElement.style.gridColumnStart = e.x;
        if (index === 0) {
            snakeElement.classList.add('head');
        }
        else {
            snakeElement.classList.add('snake');
        }
        board.appendChild(snakeElement);
    });
    foodElement = document.createElement('div');
    foodElement.style.gridRowStart = food.y;
    foodElement.style.gridColumnStart = food.x;
    foodElement.classList.add('food')
    board.appendChild(foodElement);

}

// User Inputs
window.requestAnimationFrame(main);
window.addEventListener('keydown', (e) => {
    turnSound.play();
    switch (e.key) {
        case "ArrowUp":
            console.log("ArrowUp");
            start.x = 0;
            start.y = -1;
            break;

        case "ArrowDown":
            console.log("ArrowDown");
            start.x = 0;
            start.y = 1;
            break;

        case "ArrowLeft":
            console.log("ArrowLeft");
            start.x = -1;
            start.y = 0;
            break;

        case "ArrowRight":
            console.log("ArrowRight");
            start.x = 1;
            start.y = 0;
            break;
        default:
            break;
    }

});