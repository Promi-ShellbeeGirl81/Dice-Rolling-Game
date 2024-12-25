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
const username = localStorage.getItem('username');

if (username) {
    document.getElementById('user-name').textContent = username;
} else {
    document.getElementById('user-name').textContent = 'Guest';
}

let GRID_ROWS, GRID_COLS, tries, level = 1, currentScore = 0;
let totalCells;

let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
let highLevel = localStorage.getItem('highLevel') ? parseInt(localStorage.getItem('highLevel')) : 1;
let totalScore = localStorage.getItem('totalScore') ? parseInt(localStorage.getItem('totalScore')) : 0;

let isLevelingUp = false;
let rollCooldown = false;

function randomizeGridAndTries() {
    totalCells = Math.floor(Math.random() * (50 - 30 + 1)) + 30;

    GRID_ROWS = Math.floor(Math.sqrt(totalCells));
    GRID_COLS = Math.ceil(totalCells / GRID_ROWS);

    tries = Math.floor(Math.random() * (15 - 12 + 1)) + 12;
}

function createGrid() {
    grid.innerHTML = '';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(${GRID_COLS}, 70px)`;

    for (let i = 0; i < totalCells; i++) {
        const box = document.createElement('div');
        box.classList.add('grid-item');
        grid.appendChild(box);
    }

    const totalGridSize = GRID_ROWS * GRID_COLS;
    const emptyCells = totalGridSize - totalCells;

    for (let i = 0; i < emptyCells; i++) {
        const emptyBox = document.createElement('div');
        emptyBox.classList.add('grid-item', 'empty-cell');
        grid.appendChild(emptyBox);
    }
}

function resetGame() {
    currentScore = 0;
    totalScore = 0;
    level = 1;

    localStorage.setItem('totalScore', totalScore);
    localStorage.setItem('highScore', highScore);
    localStorage.setItem('highLevel', highLevel);

    randomizeGridAndTries();
    createGrid();
    updateStats();

    console.log('Game Reset: Current Score:', currentScore);
    console.log('Total Score:', totalScore);
    console.log('High Score:', highScore);
    console.log('High Level:', highLevel);
}

let colorIndex = 0;

function rollDice() {
    if (isLevelingUp || rollCooldown) return;

    const diceValue = Math.floor(Math.random() * 6) + 1;
    const levelTarget = totalCells;
    const remainingCells = totalCells - currentScore;

    tries--;

    if (tries === 0) {
        statTriesEl.classList.add('flash-red');
        setTimeout(() => {
            statTriesEl.classList.remove('flash-red');
        }, 900);
        updateStats();
        showModal(`You lost. Better luck next time.`);

        setTimeout(() => {
            levelUpModal.style.display = 'none';
        }, 2000);

        resetGame();

        return;
    }

    if (diceValue <= remainingCells) {
        currentScore += diceValue;
    }

    const diceColors = ['red', 'blue', 'green', 'magenta', 'purple', 'orange'];
    const newColor = diceColors[colorIndex];
    colorIndex = (colorIndex + 1) % diceColors.length;

    const gridItems = document.querySelectorAll('.grid-item');
    let currentCellIndex = (currentScore % totalCells) - 1;

    if (currentCellIndex < 0) {
        currentCellIndex = totalCells - 1;
    }

    for (let i = Math.max(0, currentScore - diceValue); i < currentScore; i++) {
        const cellIndex = i % totalCells;
        const cell = gridItems[cellIndex];
        if (!cell.style.backgroundColor) {
            cell.style.backgroundColor = newColor;
        }
        cell.textContent = cellIndex + 1;
        cell.style.color = 'white';
    }

    diceImageEl.style.boxShadow = `0 0 20px ${newColor}`;
    diceImageEl.src = `./images/${diceValue}.png`;
    const currentCell = gridItems[currentCellIndex];
    if (beadImage.parentElement) {
        beadImage.parentElement.removeChild(beadImage);
    }

    beadImage.style.display = 'block';
    currentCell.appendChild(beadImage);

    if (currentScore >= levelTarget) {
        levelUp();
    }

    if (currentScore + totalScore > highScore) {
        highScore = currentScore + totalScore;
        localStorage.setItem('highScore', highScore);
    }

    if (level > highLevel) {
        highLevel = level;
        localStorage.setItem('highLevel', highLevel);
    }

    document.getElementById('total-score').textContent = currentScore + totalScore;

    updateStats();
}


function showModal(message, onConfirm) {
    modalMessage.textContent = message;
    levelUpModal.style.display = 'block';

    closeModalBtn.onclick = () => {
        levelUpModal.style.display = 'none';
        if (onConfirm) onConfirm();
    };
}

function updateStats() {
    levelEl.textContent = level;
    triesEl.textContent = tries;
    highScoreEl.textContent = highScore;
    highLevelEl.textContent = highLevel;
    targetScoreEl.textContent = totalCells;

    document.getElementById('total-score').textContent = totalScore + currentScore;
}


function levelUp() {
    if (isLevelingUp) return;

    isLevelingUp = true;
    level++;
    tries = Math.floor(Math.random() * (15 - 12 + 1)) + 12;

    showModal(`Congratulations! You've reached level ${level}.`);

    setTimeout(() => {
        levelUpModal.style.display = 'none';
    }, 1800);

    totalScore += currentScore;
    localStorage.setItem('totalScore', totalScore);
    currentScore = 0;

    console.log('Level Up: Current Score:', currentScore);
    console.log('Total Score (after level up):', totalScore);

    document.getElementById('total-score').textContent = totalScore + currentScore;

    updateStats();

    setTimeout(() => {
        randomizeGridAndTries();
        createGrid();
        updateStats();
        isLevelingUp = false;
    }, 1800);
}

closeModalBtn.addEventListener('click', () => {
    levelUpModal.style.display = 'none';
});

document.getElementById('roll-dice').addEventListener('click', rollDice);
document.getElementById('reset-game').addEventListener('click', resetGame);

window.onload = function () {
    resetGame();
};
