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
let lastKeyPress = '';
let isPaused = false;
let pauseScreen = document.getElementById('pauseScreen');
let gameOverScreen = document.getElementById('gameOverScreen');
let restartBtn = document.getElementById('restartBtn');
let finalScore = document.getElementById('finalScore');
let stats = document.getElementById('stats');

fetch('/snake-game/get-data')
    .then(response => response.json())
    .then(data => {
        const un = data.username;
        const hs = data.hiscore;
        hiscoreval = hs;
        hiscoreBox.innerHTML = "Hi Score: " + hiscoreval;
    })
    .catch(e => {
        console.error(e);
        alert('Error fetching user data. Please try again.');
    })

async function updateScore(score) {
    const username = document.cookie;
    if (username) {
        const response = await fetch(`/snake-game/${score}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const doc = await response.json();
        //console.log(doc);
    } else {
        console.error("User is not authenticated.");
    }
}


const log = document.getElementById('logout');
log.addEventListener('click', function () {
    window.location.href = '/snake-game/logout';

})

// Show pause screen
function showPauseScreen() {
    pauseScreen.classList.remove('hidden');
}

// Hide pause screen
function hidePauseScreen() {
    pauseScreen.classList.add('hidden');
}

// Resume the game after pause
document.getElementById('resumeBtn').addEventListener('click', () => {
    togglePause();
});

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        showPauseScreen();
    } else {
        hidePauseScreen();
        window.requestAnimationFrame(main);
    }
}

function main(timestamp) {
    if (isPaused) return; // Stop updating the game if paused
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

restartBtn.addEventListener('click', () => {
    window.location.reload();
});

function gameEngine() {
    //If snake collides
    if (isCollide(snakeArr)) {
        overSound.play();
        finalScore.innerHTML = "Final Score: " + score;
        gameOverScreen.classList.remove('hidden');

        lastKeyPress = '';
        start = { x: 0, y: 0 };
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

// Fetch and display the leaderboard
async function displayLeaderboard() {
    try {
        // Get the top 10 users from the server
        const response = await fetch('/snake-game/leaderboard');
        const leaderboard = await response.json();

        // Get the leaderboard list element
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = ''; // Clear previous entries

        // Add the leaderboard users to the list
        leaderboard.forEach((user, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `${index + 1}. ${user.username} - ${user.hiscore}`;
            leaderboardList.appendChild(listItem);
        });

        // Show the leaderboard section
        stats.classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
    }
}

let showLeaderboard =document.getElementById('showLeadBtn');
showLeaderboard.addEventListener('click',()=>{
    gameOverScreen.classList.add('hidden');
    displayLeaderboard();
})

// Close leaderboard functionality
const closeButton = document.getElementById('closeLeaderboard');
closeButton.addEventListener('click', () => {
    stats.classList.add('hidden');
});

// User Inputs
window.requestAnimationFrame(main);
window.addEventListener('keydown', (e) => {
    if (gameOverScreen.classList.contains('hidden') === false) return;
    turnSound.play();
    if (e.key === "ArrowUp" && lastKeyPress !== "ArrowDown") {
        start.x = 0;
        start.y = -1;
        lastKeyPress = "ArrowUp";
    } else if (e.key === "ArrowDown" && lastKeyPress !== "ArrowUp") {
        start.x = 0;
        start.y = 1;
        lastKeyPress = "ArrowDown";
    } else if (e.key === "ArrowLeft" && lastKeyPress !== "ArrowRight") {
        start.x = -1;
        start.y = 0;
        lastKeyPress = "ArrowLeft";
    } else if (e.key === "ArrowRight" && lastKeyPress !== "ArrowLeft") {
        start.x = 1;
        start.y = 0;
        lastKeyPress = "ArrowRight";
    }
    else if(e.key==='p'||e.key==='P') togglePause();
});