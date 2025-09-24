// Game Configuration
const GAME_CONFIG = {
    gridSize: 10,
    roverStart: { x: 0, y: 0, direction: 'right' },
    collectPoint: { x: 4, y: 3, icon: '⚙️', action: 'recogerMuestra' },
    analysisPoint: { x: 7, y: 8, icon: '🔬', action: 'analizarMuestra' },
    obstacles: [
        { x: 2, y: 1 }, { x: 3, y: 2 }, { x: 5, y: 4 },
        { x: 1, y: 5 }, { x: 6, y: 6 }, { x: 8, y: 3 }
    ]
};

const COMMANDS = [
    { id: 'avanzar', label: 'avanzar( )', hasParameter: true, paramType: 'number', paramName: 'pasos' },
    { id: 'girar', label: 'girar( )', hasParameter: true, paramType: 'select', paramName: 'direccion', options: ['izquierda', 'derecha'] },
    { id: 'recogerMuestra', label: 'recogerMuestra()', hasParameter: false },
    { id: 'analizarMuestra', label: 'analizarMuestra()', hasParameter: false }
];

const TUTORIAL_STEPS = [
    { step: 1, title: '¡Bienvenido, Ingeniero/a!', message: 'A.U.R.O.R.A. necesita tus órdenes, ¡y esta vez deben ser precisas! Tu misión: ordena los comandos y ajusta sus valores para completar la tarea.' },
    { step: 2, title: 'Objetivos de la Misión', message: 'Guía a A.U.R.O.R.A. primero al Punto de Recolección (⚙️), y luego al Punto de Análisis (🔬).' },
    { step: 3, title: '¡NUEVO! Parámetros', message: 'Ahora puedes decirle a A.U.R.O.R.A. *cuánto* moverse. Arrastra el bloque y luego haz clic en el paréntesis para escribir el número de pasos.' },
    { step: 4, title: 'Secuenciador', message: 'Construye tu plan aquí. ¡Recuerda, tanto el orden como los números deben ser perfectos!' },
    { step: 5, title: 'Diseño Responsivo', message: 'En dispositivos más pequeños, tu panel de comandos estará en la parte inferior para un mejor control.' },
    { step: 6, title: '¡Listo!', message: '¡ENTENDIDO, A CALIBRAR!' }
];

// Game State
let gameState = {
    rover: { x: 0, y: 0, direction: 'right' },
    sequence: [],
    isExecuting: false,
    currentStep: 0,
    tutorialStep: 0,
    samplesCollected: false,
    samplesAnalyzed: false
};

// Timer State
let timerInterval = null;
let timerStartTime = 0;
let finalTimeMs = 0;

// Audio Context for sound effects
let audioContext;
let sounds = {};

// DOM Elements
let elements = {};
let currentEditingItem = null;
let currentParameterSelection = null;
let draggedElement = null;

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeAudio();
    initializeGame();
    setupEventListeners();
    startLoadingSequence();
});

function initializeElements() {
    elements = {
        loadingScreen: document.getElementById('loadingScreen'),
        gameContainer: document.getElementById('gameContainer'),
        tutorialModal: document.getElementById('tutorialModal'),
        tutorialTitle: document.getElementById('tutorialTitle'),
        tutorialMessage: document.getElementById('tutorialMessage'),
        tutorialStep: document.getElementById('tutorialStep'),
        tutorialNext: document.getElementById('tutorialNext'),
        tutorialSkip: document.getElementById('tutorialSkip'),
        marsGrid: document.getElementById('marsGrid'),
        commandBlocks: document.getElementById('commandBlocks'),
        sequenceContainer: document.getElementById('sequenceContainer'),
        clearSequence: document.getElementById('clearSequence'),
        executeSequence: document.getElementById('executeSequence'),
        parameterModal: document.getElementById('parameterModal'),
        parameterLabel: document.getElementById('parameterLabel'),
        parameterInput: document.getElementById('parameterInput'),
        parameterButtons: document.getElementById('parameterButtons'),
        saveParameter: document.getElementById('saveParameter'),
        cancelParameter: document.getElementById('cancelParameter'),
        errorModal: document.getElementById('errorModal'),
        errorMessage: document.getElementById('errorMessage'),
        retryMission: document.getElementById('retryMission'),
        victoryScreen: document.getElementById('victoryScreen'),
        victoryContent: document.getElementById('victoryContent'),
        downloadReport: document.getElementById('downloadReport'),
        restartGame: document.getElementById('restartGame'),
        missionStatus: document.getElementById('missionStatus'),
        systemStatus: document.getElementById('systemStatus'),
        chronometer: document.getElementById('chronometer'),
        finalMissionTime: document.getElementById('finalMissionTime')
    };
}

function initializeAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        generateSounds();
    } catch (e) {
        console.warn('Web Audio API not supported');
        audioContext = null;
    }
}

function generateSounds() {
    if (!audioContext) return;
    sounds.click = createClickSound();
    sounds.drag = createDragSound();
    sounds.drop = createDropSound();
    sounds.move = createMoveSound();
    sounds.success = createSuccessSound();
    sounds.error = createErrorSound();
    sounds.ambient = createAmbientSound();
}

function createClickSound() {
    return function() {
        if (!audioContext) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    };
}

function createDragSound() {
    return function() {
        if (!audioContext) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    };
}

function createDropSound() {
    return function() {
        if (!audioContext) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
    };
}

function createMoveSound() {
    return function() {
        if (!audioContext) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    };
}

function createSuccessSound() {
    return function() {
        if (!audioContext) return;
        const notes = [262, 330, 392, 523];
        notes.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            }, index * 200);
        });
    };
}

function createErrorSound() {
    return function() {
        if (!audioContext) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    };
}

function createAmbientSound() {
    return function() {
        if (!audioContext) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(40, audioContext.currentTime);
        oscillator.type = 'sine';
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.02, audioContext.currentTime);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 10);
    };
}

function playSound(soundName) {
    if (sounds[soundName]) {
        sounds[soundName]();
    }
}

function initializeGame() {
    generateMarsGrid();
    setupDragAndDrop();
    resetGameState();
    resetTimer();
}

function generateMarsGrid() {
    const grid = elements.marsGrid;
    grid.innerHTML = '';
    
    for (let y = 0; y < GAME_CONFIG.gridSize; y++) {
        for (let x = 0; x < GAME_CONFIG.gridSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            if (x === GAME_CONFIG.roverStart.x && y === GAME_CONFIG.roverStart.y) {
                cell.classList.add('rover');
                cell.innerHTML = '🤖';
            } else if (x === GAME_CONFIG.collectPoint.x && y === GAME_CONFIG.collectPoint.y) {
                cell.classList.add('collect-point');
                cell.innerHTML = GAME_CONFIG.collectPoint.icon;
            } else if (x === GAME_CONFIG.analysisPoint.x && y === GAME_CONFIG.analysisPoint.y) {
                cell.classList.add('analysis-point');
                cell.innerHTML = GAME_CONFIG.analysisPoint.icon;
            } else if (GAME_CONFIG.obstacles.some(obs => obs.x === x && obs.y === y)) {
                cell.classList.add('obstacle');
                cell.innerHTML = '🪨';
            }
            grid.appendChild(cell);
        }
    }
}

function setupEventListeners() {
    elements.tutorialNext.addEventListener('click', nextTutorialStep);
    elements.tutorialSkip.addEventListener('click', skipTutorial);
    elements.clearSequence.addEventListener('click', clearSequence);
    elements.executeSequence.addEventListener('click', executeSequence);
    elements.saveParameter.addEventListener('click', saveParameter);
    elements.cancelParameter.addEventListener('click', closeParameterModal);
    elements.retryMission.addEventListener('click', handleMissionRetry);
    elements.downloadReport.addEventListener('click', downloadMissionReport);
    elements.restartGame.addEventListener('click', restartGame);
    
    elements.tutorialModal.addEventListener('click', (e) => { if (e.target === e.currentTarget) skipTutorial(); });
    elements.parameterModal.addEventListener('click', (e) => { if (e.target === e.currentTarget) closeParameterModal(); });
    elements.errorModal.addEventListener('click', (e) => { if (e.target === e.currentTarget) handleMissionRetry(); });
    
    elements.parameterButtons.querySelectorAll('.param-btn').forEach(btn => {
        btn.addEventListener('click', handleParamButtonClick);
    });

    document.addEventListener('keydown', handleKeyDown);
}

function downloadMissionReport() {
    playSound('click');
    const actions = elements.victoryContent.querySelector('.victory-actions');
    actions.style.visibility = 'hidden';

    html2canvas(elements.victoryContent, {
        backgroundColor: null,
        useCORS: true
    }).then(canvas => {
        actions.style.visibility = 'visible';
        const link = document.createElement('a');
        link.download = 'informe-mision-aurora.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(err => {
        console.error('Error al generar el informe:', err);
        actions.style.visibility = 'visible';
    });
}

function handleMissionRetry() {
    closeErrorModal();
    resetOnFailure();
}

function resetOnFailure() {
    gameState.rover = { ...GAME_CONFIG.roverStart };
    gameState.samplesCollected = false;
    gameState.samplesAnalyzed = false;
    generateMarsGrid();
    const sequenceItems = elements.sequenceContainer.querySelectorAll('.sequence-item');
    sequenceItems.forEach(item => {
        item.classList.remove('current', 'completed', 'error');
    });
    elements.missionStatus.textContent = 'SISTEMA LISTO - REINTENTAR SECUENCIA';
}

function handleParamButtonClick(e) {
    const value = e.target.dataset.value;
    currentParameterSelection = value;
    elements.parameterButtons.querySelectorAll('.param-btn').forEach(button => {
        button.classList.remove('active');
    });
    e.target.classList.add('active');
    playSound('click');
}

function handleKeyDown(e) {
    if (e.key === 'Escape') {
        if (!elements.tutorialModal.classList.contains('hidden')) skipTutorial();
        else if (!elements.parameterModal.classList.contains('hidden')) closeParameterModal();
        else if (!elements.errorModal.classList.contains('hidden')) handleMissionRetry();
    }
    if (e.key === 'Enter' && !elements.parameterModal.classList.contains('hidden')) saveParameter();
}

function setupDragAndDrop() {
    const commandBlocks = elements.commandBlocks.querySelectorAll('.command-block');
    commandBlocks.forEach(block => {
        block.addEventListener('dragstart', handleDragStart);
        block.addEventListener('dragend', handleDragEnd);
    });
    elements.sequenceContainer.addEventListener('dragover', handleDragOver);
    elements.sequenceContainer.addEventListener('drop', handleDrop);
    elements.sequenceContainer.addEventListener('dragenter', handleDragEnter);
    elements.sequenceContainer.addEventListener('dragleave', handleDragLeave);
}

function handleDragStart(e) {
    draggedElement = e.target;
    e.target.classList.add('dragging');
    playSound('drag');
    const commandData = { id: e.target.dataset.command, label: e.target.textContent.trim() };
    e.dataTransfer.setData('application/json', JSON.stringify(commandData));
    e.dataTransfer.effectAllowed = 'copy';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedElement = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

function handleDragEnter(e) {
    e.preventDefault();
    if (e.target === elements.sequenceContainer || e.target.closest('.sequence-container')) {
        elements.sequenceContainer.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (!elements.sequenceContainer.contains(e.relatedTarget)) {
        elements.sequenceContainer.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    elements.sequenceContainer.classList.remove('drag-over');
    try {
        const commandData = JSON.parse(e.dataTransfer.getData('application/json'));
        addCommandToSequence(commandData);
        playSound('drop');
    } catch (error) {
        console.error('Error dropping command:', error);
    }
}

function addCommandToSequence(commandData) {
    const commandConfig = COMMANDS.find(cmd => cmd.id === commandData.id);
    if (!commandConfig) return;
    
    const placeholder = elements.sequenceContainer.querySelector('.sequence-placeholder');
    if (placeholder) placeholder.style.display = 'none';
    
    const sequenceItem = document.createElement('div');
    sequenceItem.className = 'sequence-item';
    sequenceItem.draggable = true;
    
    const commandSpan = document.createElement('span');
    commandSpan.className = 'sequence-command';
    commandSpan.textContent = commandConfig.id;
    
    const paramsSpan = document.createElement('span');
    paramsSpan.className = 'sequence-params';
    
    if (commandConfig.hasParameter) {
        paramsSpan.classList.add('editable');
        paramsSpan.textContent = '( ? )';
        paramsSpan.addEventListener('click', () => editParameter(sequenceItem, commandConfig));
    } else {
        paramsSpan.textContent = '()';
    }
    
    const removeBtn = document.createElement('span');
    removeBtn.className = 'sequence-remove';
    removeBtn.innerHTML = '❌';
    removeBtn.addEventListener('click', () => removeSequenceItem(sequenceItem));
    
    sequenceItem.appendChild(commandSpan);
    sequenceItem.appendChild(paramsSpan);
    sequenceItem.appendChild(removeBtn);
    
    sequenceItem.dataset.command = commandConfig.id;
    sequenceItem.dataset.hasParameter = commandConfig.hasParameter;
    if (commandConfig.hasParameter) {
        sequenceItem.dataset.parameterType = commandConfig.paramType;
        if (commandConfig.options) {
            sequenceItem.dataset.parameterOptions = JSON.stringify(commandConfig.options);
        }
    }
    
    elements.sequenceContainer.appendChild(sequenceItem);
    setupSequenceItemDrag(sequenceItem);
}

function setupSequenceItemDrag(item) {
    item.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', '');
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragend', function(e) {
        item.classList.remove('dragging');
    });
    item.addEventListener('dragover', function(e) {
        e.preventDefault();
        if (e.target.closest('.sequence-item') !== item) {
            const afterElement = getDragAfterElement(elements.sequenceContainer, e.clientY);
            const dragging = document.querySelector('.sequence-item.dragging');
            if (dragging && dragging !== item) {
                if (afterElement == null) elements.sequenceContainer.appendChild(dragging);
                else elements.sequenceContainer.insertBefore(dragging, afterElement);
            }
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.sequence-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) return { offset: offset, element: child };
        else return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function editParameter(sequenceItem, commandConfig) {
    if (gameState.isExecuting) return;
    currentEditingItem = sequenceItem;
    elements.parameterLabel.textContent = `${commandConfig.paramName}:`;

    if (commandConfig.paramType === 'number') {
        elements.parameterInput.style.display = 'block';
        elements.parameterButtons.classList.add('hidden');
        elements.parameterInput.value = sequenceItem.dataset.parameterValue || '';
        setTimeout(() => elements.parameterInput.focus(), 100);
    } else if (commandConfig.paramType === 'select') {
        elements.parameterInput.style.display = 'none';
        elements.parameterButtons.classList.remove('hidden');
        
        const currentValue = sequenceItem.dataset.parameterValue;
        currentParameterSelection = currentValue;

        elements.parameterButtons.querySelectorAll('.param-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === currentValue);
        });
    }
    
    elements.parameterModal.classList.remove('hidden');
    playSound('click');
}

function saveParameter() {
    if (!currentEditingItem) return;
    
    const commandConfig = COMMANDS.find(cmd => cmd.id === currentEditingItem.dataset.command);
    let value;
    
    if (commandConfig.paramType === 'number') {
        value = elements.parameterInput.value.trim();
        if (!value || isNaN(value) || parseInt(value) <= 0) {
            alert('Por favor, ingresa un número válido mayor que 0');
            return;
        }
        value = parseInt(value).toString();
    } else if (commandConfig.paramType === 'select') {
        value = currentParameterSelection;
        if (!value) {
            alert('Por favor, selecciona una dirección.');
            return;
        }
    }
    
    currentEditingItem.dataset.parameterValue = value;
    const paramsSpan = currentEditingItem.querySelector('.sequence-params');
    paramsSpan.textContent = `( ${value} )`;
    
    closeParameterModal();
    playSound('click');
}

function closeParameterModal() {
    elements.parameterModal.classList.add('hidden');
    currentEditingItem = null;
    currentParameterSelection = null;
}

function removeSequenceItem(item) {
    item.remove();
    const items = elements.sequenceContainer.querySelectorAll('.sequence-item');
    if (items.length === 0) {
        const placeholder = elements.sequenceContainer.querySelector('.sequence-placeholder');
        if (placeholder) placeholder.style.display = 'block';
    }
    playSound('click');
}

function clearSequence() {
    elements.sequenceContainer.querySelectorAll('.sequence-item').forEach(item => item.remove());
    const placeholder = elements.sequenceContainer.querySelector('.sequence-placeholder');
    if (placeholder) placeholder.style.display = 'block';
    playSound('click');
}

function executeSequence() {
    if (gameState.isExecuting) return;
    
    resetOnFailure();

    const sequenceItems = elements.sequenceContainer.querySelectorAll('.sequence-item');
    if (sequenceItems.length === 0) {
        showError('No hay comandos en la secuencia. Arrastra comandos para crear tu secuencia.');
        return;
    }
    
    for (let item of sequenceItems) {
        if (item.dataset.hasParameter === 'true' && !item.dataset.parameterValue) {
            showError('Algunos comandos necesitan parámetros. Haz clic en los paréntesis para editarlos.');
            return;
        }
    }
    
    gameState.sequence = Array.from(sequenceItems).map(item => ({
        command: item.dataset.command,
        parameter: item.dataset.parameterValue
    }));
    
    gameState.currentStep = 0;
    gameState.isExecuting = true;
    elements.executeSequence.disabled = true;
    elements.missionStatus.textContent = 'EJECUTANDO SECUENCIA...';
    playSound('click');
    executeNextCommand();
}

function executeNextCommand() {
    if (gameState.currentStep >= gameState.sequence.length) {
        completeSequence();
        return;
    }
    
    const currentCommand = gameState.sequence[gameState.currentStep];
    const sequenceItems = elements.sequenceContainer.querySelectorAll('.sequence-item');
    
    sequenceItems.forEach((item, index) => {
        item.classList.remove('current', 'completed', 'error');
        if (index === gameState.currentStep) item.classList.add('current');
        else if (index < gameState.currentStep) item.classList.add('completed');
    });
    
    setTimeout(() => {
        const success = executeCommand(currentCommand);
        if (success) {
            gameState.currentStep++;
            setTimeout(executeNextCommand, 1000);
        } else {
            sequenceItems[gameState.currentStep].classList.remove('current');
            sequenceItems[gameState.currentStep].classList.add('error');
            gameState.isExecuting = false;
            elements.executeSequence.disabled = false;
            elements.missionStatus.textContent = 'ERROR EN SECUENCIA';
            playSound('error');
            showError('¡Calibración incorrecta! Revisa el orden de tus comandos o la precisión de tus parámetros.');
        }
    }, 500);
}

function executeCommand(commandData) {
    const { command, parameter } = commandData;
    switch (command) {
        case 'avanzar': return moveRover(parseInt(parameter));
        case 'girar': return turnRover(parameter);
        case 'recogerMuestra': return collectSample();
        case 'analizarMuestra': return analyzeSample();
        default: return false;
    }
}

function moveRover(steps) {
    const directions = { 'right': { dx: 1, dy: 0 }, 'down': { dx: 0, dy: 1 }, 'left': { dx: -1, dy: 0 }, 'up': { dx: 0, dy: -1 } };
    const dir = directions[gameState.rover.direction];
    let moveCount = 0;
    
    function moveStep() {
        if (moveCount >= steps) return true;
        const newX = gameState.rover.x + dir.dx;
        const newY = gameState.rover.y + dir.dy;
        if (newX < 0 || newX >= GAME_CONFIG.gridSize || newY < 0 || newY >= GAME_CONFIG.gridSize || GAME_CONFIG.obstacles.some(obs => obs.x === newX && obs.y === newY)) {
            showRoverError();
            return false;
        }
        updateRoverPosition(newX, newY);
        playSound('move');
        moveCount++;
        setTimeout(() => moveStep(), 400);
        return true;
    }
    return moveStep();
}

function turnRover(direction) {
    const dirs = ['right', 'down', 'left', 'up'];
    const currentIndex = dirs.indexOf(gameState.rover.direction);
    let newIndex;
    if (direction === 'derecha') newIndex = (currentIndex + 1) % 4;
    else if (direction === 'izquierda') newIndex = (currentIndex - 1 + 4) % 4;
    gameState.rover.direction = dirs[newIndex];
    updateRoverDisplay();
    playSound('click');
    return true;
}

function collectSample() {
    const { x, y } = gameState.rover;
    if (x === GAME_CONFIG.collectPoint.x && y === GAME_CONFIG.collectPoint.y) {
        gameState.samplesCollected = true;
        showActionEffect(x, y);
        playSound('success');
        return true;
    }
    showRoverError();
    return false;
}

function analyzeSample() {
    const { x, y } = gameState.rover;
    if (x === GAME_CONFIG.analysisPoint.x && y === GAME_CONFIG.analysisPoint.y && gameState.samplesCollected) {
        gameState.samplesAnalyzed = true;
        showActionEffect(x, y);
        playSound('success');
        return true;
    }
    showRoverError();
    return false;
}

function updateRoverPosition(x, y) {
    const currentCell = elements.marsGrid.querySelector('.grid-cell.rover');
    if (currentCell) {
        currentCell.classList.remove('rover');
        currentCell.innerHTML = '';
        const cellX = parseInt(currentCell.dataset.x), cellY = parseInt(currentCell.dataset.y);
        if (cellX === GAME_CONFIG.collectPoint.x && cellY === GAME_CONFIG.collectPoint.y) {
            currentCell.classList.add('collect-point');
            currentCell.innerHTML = GAME_CONFIG.collectPoint.icon;
        } else if (cellX === GAME_CONFIG.analysisPoint.x && cellY === GAME_CONFIG.analysisPoint.y) {
            currentCell.classList.add('analysis-point');
            currentCell.innerHTML = GAME_CONFIG.analysisPoint.icon;
        }
    }
    const newCell = elements.marsGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (newCell) {
        newCell.classList.remove('collect-point', 'analysis-point');
        newCell.classList.add('rover');
        newCell.innerHTML = getRoverIcon();
    }
    gameState.rover.x = x;
    gameState.rover.y = y;
}

function getRoverIcon() { return '🤖'; }

function updateRoverDisplay() {
    const roverCell = elements.marsGrid.querySelector('.grid-cell.rover');
    if (roverCell) roverCell.innerHTML = getRoverIcon();
}

function showActionEffect(x, y) {
    const cell = elements.marsGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (cell) {
        cell.classList.add('action-effect');
        setTimeout(() => cell.classList.remove('action-effect'), 1000);
    }
}

function showRoverError() {
    const roverCell = elements.marsGrid.querySelector('.grid-cell.rover');
    if (roverCell) {
        roverCell.innerHTML = '🤖❌';
        setTimeout(() => roverCell.innerHTML = getRoverIcon(), 1000);
    }
}

function completeSequence() {
    gameState.isExecuting = false;
    elements.executeSequence.disabled = false;
    
    const sequenceItems = elements.sequenceContainer.querySelectorAll('.sequence-item');
    sequenceItems.forEach(item => {
        item.classList.remove('current');
        item.classList.add('completed');
    });
    
    if (gameState.samplesCollected && gameState.samplesAnalyzed) {
        elements.missionStatus.textContent = 'MISIÓN COMPLETADA';
        playSound('success');
        stopTimer();
        setTimeout(showVictoryScreen, 1500);
    } else {
        elements.missionStatus.textContent = 'SECUENCIA COMPLETADA';
        showError('Secuencia ejecutada, pero no se completaron todos los objetivos. ¿Recogiste la muestra y la analizaste?');
    }
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorModal.classList.remove('hidden');
}

function closeErrorModal() {
    elements.errorModal.classList.add('hidden');
}

function showVictoryScreen() {
    elements.finalMissionTime.textContent = formatTimeWithMillis(finalTimeMs);
    elements.victoryScreen.classList.remove('hidden');
    playSound('ambient');
}

function restartGame() {
    elements.victoryScreen.classList.add('hidden');
    resetGameState();
    clearSequence();
    elements.missionStatus.textContent = 'SISTEMA LISTO - ESPERANDO ÓRDENES';
    elements.systemStatus.textContent = 'SISTEMA LISTO';
    resetTimer();
    startTimer();
}

function resetGameState() {
    gameState = {
        rover: { ...GAME_CONFIG.roverStart },
        sequence: [], isExecuting: false, currentStep: 0, tutorialStep: 0,
        samplesCollected: false, samplesAnalyzed: false
    };
    generateMarsGrid();
    elements.executeSequence.disabled = false;
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerStartTime = Date.now();
    timerInterval = setInterval(updateTimerDisplay, 49); // Update ~20 times per second
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    finalTimeMs = Date.now() - timerStartTime;
}

function resetTimer() {
    stopTimer();
    timerStartTime = 0;
    finalTimeMs = 0;
    if (elements.chronometer) {
        elements.chronometer.textContent = "00:00:00.00";
    }
}

function formatTimeWithMillis(totalMs) {
    if (totalMs <= 0) return "00:00:00.00";
    const hours = Math.floor(totalMs / 3600000).toString().padStart(2, '0');
    const minutes = Math.floor((totalMs % 3600000) / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((totalMs % 60000) / 1000).toString().padStart(2, '0');
    const centiseconds = Math.floor((totalMs % 1000) / 10).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}.${centiseconds}`;
}

function updateTimerDisplay() {
    if (!timerStartTime) return;
    const elapsedTime = Date.now() - timerStartTime;
    if (elements.chronometer) {
        elements.chronometer.textContent = formatTimeWithMillis(elapsedTime);
    }
}

function startLoadingSequence() {
    setTimeout(() => {
        elements.loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            elements.loadingScreen.classList.add('hidden');
            startTutorial();
        }, 500);
    }, 3000);
}

function startTutorial() {
    gameState.tutorialStep = 0;
    showTutorialStep();
    elements.tutorialModal.classList.remove('hidden');
}

function showTutorialStep() {
    const step = TUTORIAL_STEPS[gameState.tutorialStep];
    elements.tutorialTitle.textContent = step.title;
    elements.tutorialMessage.textContent = step.message;
    elements.tutorialStep.textContent = gameState.tutorialStep + 1;
    elements.tutorialNext.textContent = (gameState.tutorialStep === TUTORIAL_STEPS.length - 1) ? 'COMENZAR' : 'SIGUIENTE';
}

function nextTutorialStep() {
    playSound('click');
    if (gameState.tutorialStep < TUTORIAL_STEPS.length - 1) {
        gameState.tutorialStep++;
        showTutorialStep();
    } else {
        finishTutorial();
    }
}

function skipTutorial() {
    playSound('click');
    finishTutorial();
}

function finishTutorial() {
    elements.tutorialModal.classList.add('hidden');
    elements.gameContainer.classList.remove('hidden');
    elements.gameContainer.classList.add('fade-in');
    elements.missionStatus.textContent = 'SISTEMA LISTO - ESPERANDO ÓRDENES';
    playSound('ambient');
    startTimer();
}

window.addEventListener('resize', () => {
    document.body.classList.toggle('mobile-layout', window.innerWidth < 768);
});

document.body.classList.toggle('mobile-layout', window.innerWidth < 768);

console.log('A.U.R.O.R.A. Misión 2 inicializada correctamente');
