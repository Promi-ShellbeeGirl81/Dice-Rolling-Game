const grid = document.getElementById('grid');
const levelEl = document.getElementById('level');
const currentScoreEl = document.getElementById('current-score');
const triesEl = document.getElementById('tries');
const highScoreEl = document.getElementById('high-score');
const highLevelEl = document.getElementById('high-level');
const beadImage = document.getElementById('bead-image');
const diceImageEl = document.getElementById('dice-image');
const targetScoreEl = document.getElementById('target-score');
const statTriesEl = document.getElementById('stat-tries');
const levelUpModal = document.getElementById('levelUpModal');
const closeModalBtn = document.getElementById('close-modal');
const modalMessage = document.getElementById('modal-message');

let GRID_ROWS, GRID_COLS, tries, level = 1, currentScore = 0;

let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
let highLevel = localStorage.getItem('highLevel') ? parseInt(localStorage.getItem('highLevel')) : 1;

function randomizeGridAndTries() {
    do {
        GRID_ROWS = Math.floor(Math.random() * (7 - 5 + 1)) + 5;
        GRID_COLS = Math.floor(Math.random() * (8 - 6 + 1)) + 6;
    } while (GRID_ROWS * GRID_COLS < 30 || GRID_ROWS * GRID_COLS > 60);

    tries = Math.floor(Math.random() * (15 - 12 + 1)) + 12;
}


function updateStats() {
    levelEl.textContent = level;
    currentScoreEl.textContent = currentScore;
    triesEl.textContent = tries;
    highScoreEl.textContent = highScore;
    highLevelEl.textContent = highLevel;
    targetScoreEl.textContent = GRID_ROWS * GRID_COLS;
}

function createGrid() {
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${GRID_COLS}, 70px)`;
    for (let i = 0; i < GRID_ROWS * GRID_COLS; i++) {
        const box = document.createElement('div');
        box.classList.add('grid-item');
        grid.appendChild(box);
    }
}

function resetGame() {
    randomizeGridAndTries();
    level = 1;
    currentScore = 0;
    createGrid();
    updateStats();
}


function showModal(message) {
    modalMessage.textContent = message;  
    levelUpModal.style.display = 'block';  
}

closeModalBtn.addEventListener('click', () => {
    levelUpModal.style.display = 'none';  
});

let isLevelingUp = false;
function rollDice() {
    if (tries <= 0 || isLevelingUp) { 
        statTriesEl.classList.add('flash-red');
        setTimeout(() => {
            statTriesEl.classList.remove('flash-red');
        }, 1500);
        return;
    }

    const diceValue = Math.floor(Math.random() * 6) + 1;

    const levelTarget = level * GRID_ROWS * GRID_COLS;
    const remainingCells = GRID_ROWS * GRID_COLS - currentScore;  

    if (diceValue > remainingCells) {
        showModal(`You can't move past the last cell! Only ${remainingCells} steps left.`);
    }
    tries--; 

    if (diceValue <= remainingCells) {
        currentScore += diceValue;
    }

    const diceShadowColors = {
        1: '0 0 20px red',
        2: '0 0 20px blue',
        3: '0 0 20px green',
        4: '0 0 20px magenta',
        5: '0 0 20px purple',
        6: '0 0 20px orange'
    };

    diceImageEl.style.boxShadow = diceShadowColors[diceValue];
    diceImageEl.src = `images/${diceValue}.png`;
    diceImageEl.style.display = 'block';

    const gridItems = document.querySelectorAll('.grid-item');
    let currentCellIndex = (currentScore % (GRID_ROWS * GRID_COLS)) - 1;

    if (currentCellIndex < 0) {
        currentCellIndex = GRID_ROWS * GRID_COLS - 1;
    }

    const diceColors = {
        1: 'red',
        2: 'blue',
        3: 'green',
        4: 'magenta',
        5: 'purple',
        6: 'orange'
    };

    for (let i = Math.max(0, currentScore - diceValue); i < currentScore; i++) {
        const cellIndex = i % (GRID_ROWS * GRID_COLS);
        const cell = gridItems[cellIndex];
        cell.style.backgroundColor = diceColors[diceValue];
        cell.textContent = cellIndex + 1;
        cell.style.color = 'white';
    }

    let currentCell = gridItems[currentCellIndex];

    if (beadImage.parentElement) {
        beadImage.parentElement.removeChild(beadImage);
    }

    beadImage.style.display = 'block';
    currentCell.appendChild(beadImage);

    updateStats();

    if (currentScore == levelTarget) {
        isLevelingUp = true;

        level++;
        tries = Math.floor(Math.random() * (15 - 12 + 1)) + 12; 
        resetGameforNextLevel(); 

        const newGridItems = document.querySelectorAll('.grid-item'); 
        const firstCell = newGridItems[0];  

        if (beadImage.parentElement) {
            beadImage.parentElement.removeChild(beadImage);
        }

        beadImage.style.display = 'block';
        firstCell.appendChild(beadImage);

        currentScore = 0;

        showModal(`Congratulations! You've reached level ${level}.`);

        setTimeout(() => {
            isLevelingUp = false; 
        }, 2000); 
    }

    if (currentScore > highScore) {
        highScore = currentScore;
        localStorage.setItem('highScore', highScore);
    }

    if (level > highLevel) {
        highLevel = level;
        localStorage.setItem('highLevel', highLevel);
    }

    updateStats();
}

function resetGameforNextLevel() {
    randomizeGridAndTries();
    createGrid();
    updateStats();
}


document.getElementById('roll-dice').addEventListener('click', rollDice);
document.getElementById('reset-game').addEventListener('click', resetGame);

randomizeGridAndTries();
createGrid();
updateStats();
