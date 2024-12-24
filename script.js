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

// Check if username exists and display it in the 'user-name' paragraph
if (username) {
    document.getElementById('user-name').textContent = username;
} else {
    document.getElementById('user-name').textContent = 'Guest'; // Default value if no username is stored
}

let GRID_ROWS, GRID_COLS, tries, level = 1, currentScore = 0;
let totalCells;

let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
let highLevel = localStorage.getItem('highLevel') ? parseInt(localStorage.getItem('highLevel')) : 1;
let totalScore = localStorage.getItem('totalScore') ? parseInt(localStorage.getItem('totalScore')) : 0;

let isLevelingUp = false; // Prevents multiple level-up triggers
let rollCooldown = false; // Prevents rolling dice during cooldown

function randomizeGridAndTries() {
    do {
        totalCells = Math.floor(Math.random() * (50 - 30 + 1)) + 30;
    } while (totalCells < 30 || totalCells > 50);

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

function updateStats() {
    levelEl.textContent = level;
    triesEl.textContent = tries;
    highScoreEl.textContent = highScore;
    highLevelEl.textContent = highLevel;
    targetScoreEl.textContent = totalCells; // This ensures target score is updated correctly

    // Update total score display (show total score in the current score section)
    document.getElementById('total-score').textContent = totalScore + currentScore;  // Update this line to show totalScore
}


function rollDice() {
    if (tries <= 0 || isLevelingUp || rollCooldown) {
        statTriesEl.classList.add('flash-red');
        setTimeout(() => {
            statTriesEl.classList.remove('flash-red');
        }, 1500);
        return;
    }

    const diceValue = Math.floor(Math.random() * 6) + 1;
    const levelTarget = totalCells;
    const remainingCells = totalCells - currentScore;
    tries--;

    if (diceValue <= remainingCells) {
        currentScore += diceValue;
    }

    const diceColors = ['red', 'blue', 'green', 'magenta', 'purple', 'orange'];
    diceImageEl.style.boxShadow = `0 0 20px ${diceColors[diceValue - 1]}`;
    diceImageEl.src = `images/${diceValue}.png`;
    diceImageEl.style.display = 'block';

    const gridItems = document.querySelectorAll('.grid-item');
    let currentCellIndex = (currentScore % totalCells) - 1;

    if (currentCellIndex < 0) {
        currentCellIndex = totalCells - 1;
    }

    for (let i = Math.max(0, currentScore - diceValue); i < currentScore; i++) {
        const cellIndex = i % totalCells;
        const cell = gridItems[cellIndex];
        if (!cell.style.backgroundColor) {
            cell.style.backgroundColor = diceColors[diceValue - 1];
        }
        cell.textContent = cellIndex + 1;
        cell.style.color = 'white';
    }

    const currentCell = gridItems[currentCellIndex];
    if (beadImage.parentElement) {
        beadImage.parentElement.removeChild(beadImage);
    }

    beadImage.style.display = 'block';
    currentCell.appendChild(beadImage);

    if (currentScore >= levelTarget) {
        levelUp();
    }

    // Update high score if necessary
    if (currentScore + totalScore > highScore) {
        highScore = currentScore + totalScore;
        localStorage.setItem('highScore', highScore);
    }

    // Update high level if necessary
    if (level > highLevel) {
        highLevel = level;
        localStorage.setItem('highLevel', highLevel);
    }

    // **Debugging output**
    console.log('Dice Value:', diceValue);
    console.log('Current Score:', currentScore);
    console.log('Total Score:', totalScore);
    
    // **Update current score in the DOM**
    document.getElementById('total-score').textContent = currentScore + totalScore;  // This should update the score correctly

    // Ensure that the DOM shows updated high score and level
    updateStats();
}

function levelUp() {
    if (isLevelingUp) return;

    isLevelingUp = true;
    level++;
    tries = Math.floor(Math.random() * (15 - 12 + 1)) + 12;

    showModal(`Congratulations! You've reached level ${level}.`);

    // Add the current score to the total score and store it
    totalScore += currentScore; // Add currentScore to totalScore
    localStorage.setItem('totalScore', totalScore); // Save updated totalScore
    currentScore = 0; // Reset current score for the new level

    // **Debugging output**
    console.log('Level Up: Current Score:', currentScore);
    console.log('Total Score (after level up):', totalScore);

    // **Update total score in the DOM**
    document.getElementById('total-score').textContent = totalScore + currentScore;  // Update total score display

    updateStats();

    // Wait 2 seconds before proceeding to the next level
    setTimeout(() => {
        randomizeGridAndTries();  // Randomize grid and tries for the new level
        createGrid();  // Create grid for the new level
        updateStats();  // Update stats to show the correct target score and current values
        isLevelingUp = false;  // Allow next level-up
    }, 2000);
}

function showModal(message) {
    modalMessage.textContent = message;
    levelUpModal.style.display = 'block';
}

closeModalBtn.addEventListener('click', () => {
    levelUpModal.style.display = 'none';
});

document.getElementById('roll-dice').addEventListener('click', rollDice);
document.getElementById('reset-game').addEventListener('click', resetGame);

window.onload = function () {
    resetGame();
};
