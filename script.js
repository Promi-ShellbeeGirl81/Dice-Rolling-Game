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
let totalCells; 

let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
let highLevel = localStorage.getItem('highLevel') ? parseInt(localStorage.getItem('highLevel')) : 1;

function randomizeGridAndTries() {
    do {
        totalCells = Math.floor(Math.random() * (50 - 30 + 1)) + 30;
    } while (totalCells < 30 || totalCells > 50);

    GRID_ROWS = Math.floor(Math.sqrt(totalCells));
    GRID_COLS = Math.ceil(totalCells / GRID_ROWS); 

    tries = Math.floor(Math.random() * (15 - 12 + 1)) + 12; 

    return totalCells; 
}

function updateStats() {
    levelEl.textContent = level;
    currentScoreEl.textContent = currentScore;
    triesEl.textContent = tries;
    highScoreEl.textContent = highScore;
    highLevelEl.textContent = highLevel;
    targetScoreEl.textContent = totalCells; 
}

function createGrid() {
    grid.innerHTML = ''; 
    grid.style.display = 'grid'; 
    grid.style.gridTemplateColumns = `repeat(${GRID_COLS}, 70px)`; 

    for (let i = 0; i < totalCells; i++) {
        const box = document.createElement('div');
        box.classList.add('grid-item');
        grid.appendChild(box);
        box.textContent = i + 1;
    }

    const totalGridSize = GRID_ROWS * GRID_COLS; // Calculate the total grid size
    const emptyCells = totalGridSize - totalCells; // Determine if there are empty cells
    for (let i = 0; i < emptyCells; i++) {
        const emptyBox = document.createElement('div');
        emptyBox.classList.add('grid-item', 'empty-cell'); // Mark as empty
        grid.appendChild(emptyBox);
    }
}

function resetGame() {
    currentScore = 0;
    totalCells = randomizeGridAndTries(); // Recalculate totalCells
    createGrid(); // Generate the grid based on GRID_ROWS and GRID_COLS
    updateStats(); // Pass totalCells to updateStats
}

// Call resetGame after page load to ensure grid is initialized
window.onload = function () {
    resetGame();
};

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

    const levelTarget = totalCells; 

    const remainingCells = totalCells - currentScore; 
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
    let currentCellIndex = (currentScore % totalCells) - 1;

    if (currentCellIndex < 0) {
        currentCellIndex = totalCells - 1;
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
        const cellIndex = i % totalCells;
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

    updateStats(); // Update the target score and other stats after the dice roll

    // Check if the player has reached the target score
    if (currentScore == levelTarget) {
        isLevelingUp = true;
    
        level++;
        tries = Math.floor(Math.random() * (15 - 12 + 1)) + 12; 
        resetGameforNextLevel();  // Reset for next level without resetting score
    
        const newGridItems = document.querySelectorAll('.grid-item');
        const firstCell = newGridItems[0];  
    
        if (beadImage.parentElement) {
            beadImage.parentElement.removeChild(beadImage);  // Remove bead image from old position
        }
    
        beadImage.style.display = 'block';
        firstCell.appendChild(beadImage);  // Move bead to the first cell
    
        // Reset current score to 0
        currentScore = 0;

        // Now start fresh for the new level
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

    updateStats(); // Update the stats again after the level change
}

function resetGameforNextLevel() {
    randomizeGridAndTries();
    createGrid();
    updateStats();

    const newGridItems = document.querySelectorAll('.grid-item');
    const firstCell = newGridItems[0]; // Start at the first cell

    if (beadImage.parentElement) {
        beadImage.parentElement.removeChild(beadImage); // Remove from old position
    }

    beadImage.style.display = 'block';
    firstCell.appendChild(beadImage); // Move to the first cell

    // Reset current score to 0 here
    currentScore = 0; // Ensure score starts at 0 after level up
}

document.getElementById('roll-dice').addEventListener('click', rollDice);
document.getElementById('reset-game').addEventListener('click', resetGame);

randomizeGridAndTries();
createGrid();
updateStats();
