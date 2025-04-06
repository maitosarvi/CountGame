document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('game-grid');
    const nextNumberDisplay = document.getElementById('next-number');
    const restartButton = document.getElementById('restart-button');
    const pauseButton = document.getElementById('pause-button');
    const startButton = document.getElementById('start-button');
    const currentTurnDisplay = document.getElementById('current-turn');

    // Player 1 elements
    const player1Info = document.getElementById('player1-info');
    const player1NameDisplay = document.getElementById('player1-name');
    const player1TimerDisplay = document.getElementById('player1-timer');

    // Player 2 elements
    const player2Info = document.getElementById('player2-info');
    const player2NameDisplay = document.getElementById('player2-name');
    const player2TimerDisplay = document.getElementById('player2-timer');

    let currentNumber = 1;
    const numbers = Array.from({ length: 100 }, (_, i) => i + 1);
    let playerNames = { 1: "Player 1", 2: "Player 2" };
    let playerTimes = { 1: 0, 2: 0 };
    let currentPlayer = null;
    let currentPlayerTimerInterval = null;
    let currentPlayerStartTime = null;
    let isGameRunning = false;
    let isPaused = false;
    let firstGame = true;
    let gamePrepared = false;

    // --- Utility Functions ---

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function formatTime(seconds) {
        return seconds.toFixed(2);
    }

    // --- UI Update Functions ---

    function updatePlayerNames() {
        player1NameDisplay.textContent = playerNames[1];
        player2NameDisplay.textContent = playerNames[2];
    }

    function updateTimers() {
        player1TimerDisplay.textContent = formatTime(playerTimes[1]);
        player2TimerDisplay.textContent = formatTime(playerTimes[2]);
    }

    function updateCurrentTurnDisplay() {
        if (currentPlayer) {
            currentTurnDisplay.textContent = playerNames[currentPlayer];
            if (currentPlayer === 1) {
                player1Info.classList.add('active');
                player2Info.classList.remove('active');
            } else {
                player2Info.classList.add('active');
                player1Info.classList.remove('active');
            }
        } else {
            currentTurnDisplay.textContent = '-';
            player1Info.classList.remove('active');
            player2Info.classList.remove('active');
        }
    }

    function stopCurrentPlayerTimer() {
        if (currentPlayerTimerInterval) {
            clearInterval(currentPlayerTimerInterval);
            if (!isPaused && currentPlayerStartTime) {
                 const elapsedTime = (Date.now() - currentPlayerStartTime) / 1000;
                 if (currentPlayer && playerTimes.hasOwnProperty(currentPlayer)) {
                      playerTimes[currentPlayer] += elapsedTime; 
                 }
            }
            currentPlayerTimerInterval = null;
            if(!isPaused) currentPlayerStartTime = null; 
            updateTimers();
        }
    }

    function startCurrentPlayerTimer() {
        if (isPaused || !isGameRunning) return;
        
        stopCurrentPlayerTimer();

        if (!currentPlayerStartTime) {
             currentPlayerStartTime = Date.now();
        }
        
        currentPlayerTimerInterval = setInterval(() => {
            if (currentPlayerStartTime) {
                 const currentElapsedTime = (Date.now() - currentPlayerStartTime) / 1000;
                 const totalTime = playerTimes[currentPlayer] + currentElapsedTime;
                 const displayElement = currentPlayer === 1 ? player1TimerDisplay : player2TimerDisplay;
                 displayElement.textContent = formatTime(totalTime);
            }
        }, 100);
    }

    // --- Game Logic Functions ---

    function switchTurn() {
        if (isPaused || !isGameRunning) return; 
        stopCurrentPlayerTimer();
        currentPlayerStartTime = null;
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateCurrentTurnDisplay();
        startCurrentPlayerTimer();
    }

    function getPlayerNames() {
        const name1 = prompt("Enter name for Player 1:", playerNames[1]);
        const name2 = prompt("Enter name for Player 2:", playerNames[2]);
        if (name1) playerNames[1] = name1;
        if (name2) playerNames[2] = name2;
        updatePlayerNames();
    }

    function initializeGame() {
        if (firstGame) {
            getPlayerNames();
            firstGame = false;
        }

        currentNumber = 1;
        playerTimes = { 1: 0, 2: 0 };
        currentPlayer = null;
        isGameRunning = false;
        isPaused = false;
        gamePrepared = false;
        stopCurrentPlayerTimer();
        currentPlayerStartTime = null;

        nextNumberDisplay.textContent = currentNumber;
        updateTimers();
        updateCurrentTurnDisplay();

        grid.classList.remove('paused');
        grid.innerHTML = '';

        pauseButton.textContent = 'Pause';
        pauseButton.disabled = true;
        startButton.disabled = false;
        restartButton.disabled = true;

        shuffleArray(numbers);
        numbers.forEach(number => {
            const item = document.createElement('div');
            item.classList.add('grid-item');
            item.textContent = number;
            item.dataset.number = number;
            item.style.backgroundColor = '';
            item.addEventListener('click', handleItemClick);
            grid.appendChild(item);
        });
        
        gamePrepared = true;
    }

    function startGame() {
        if (!gamePrepared || isGameRunning) return;
        
        isGameRunning = true;
        isPaused = false;
        currentPlayer = 1;

        updateCurrentTurnDisplay();
        startCurrentPlayerTimer();
        
        startButton.disabled = true;
        pauseButton.disabled = false;
        restartButton.disabled = false;
        grid.classList.remove('paused');
    }

    function handleItemClick(event) {
        if (!isGameRunning || isPaused) {
             return;
        }
        
        const clickedNumber = parseInt(event.target.dataset.number);

        if (clickedNumber === currentNumber) {
            currentNumber++;
            nextNumberDisplay.textContent = currentNumber > 100 ? 'Done!' : currentNumber;

            event.target.style.backgroundColor = 'lightgreen';
            event.target.removeEventListener('click', handleItemClick);

            if (currentNumber > 100) {
                stopCurrentPlayerTimer();
                isGameRunning = false;
                isPaused = false;
                gamePrepared = false;
                
                pauseButton.textContent = 'Pause';
                pauseButton.disabled = true;
                startButton.disabled = true;
                restartButton.disabled = false;
                
                grid.classList.remove('paused');
                currentPlayer = null;
                updateCurrentTurnDisplay();

                const winner = playerTimes[1] < playerTimes[2] ? playerNames[1] : playerNames[2];
                const loser = playerTimes[1] < playerTimes[2] ? playerNames[2] : playerNames[1];
                const time1 = formatTime(playerTimes[1]);
                const time2 = formatTime(playerTimes[2]);

                setTimeout(() => {
                     alert(`Game Over!\n\n${playerNames[1]}: ${time1}s\n${playerNames[2]}: ${time2}s\n\n${winner} wins!`);
                }, 10);

            } else {
                 switchTurn();
            }
        }
        else {
            event.target.style.backgroundColor = 'lightcoral';
            setTimeout(() => {
                if (event.target.style.backgroundColor === 'lightcoral') {
                    event.target.style.backgroundColor = '';
                }
            }, 300);
        }
    }

    function togglePause() {
        if (!isGameRunning) return; 

        isPaused = !isPaused;

        if (isPaused) {
            stopCurrentPlayerTimer();
            pauseButton.textContent = 'Resume';
            grid.classList.add('paused');
            restartButton.disabled = true;
        } else {
            startCurrentPlayerTimer(); 
            pauseButton.textContent = 'Pause';
            grid.classList.remove('paused');
            restartButton.disabled = false;
        }
    }

    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', initializeGame);
    pauseButton.addEventListener('click', togglePause);

    pauseButton.disabled = true;
    initializeGame();
}); 