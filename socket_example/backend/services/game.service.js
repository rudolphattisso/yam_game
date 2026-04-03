// websocket-server/services/game.service.js

// Durée d'un tour en secondes
const TURN_DURATION = 30;
const END_TURN_DURATION = 10;
const INITIAL_PAWNS_COUNT = 12;

const DECK_INIT = {
    dices: [
        { id: 1, value: '', locked: true },
        { id: 2, value: '', locked: true },
        { id: 3, value: '', locked: true },
        { id: 4, value: '', locked: true },
        { id: 5, value: '', locked: true },
    ],
    rollsCounter: 1,
    rollsMaximum: 3
};

const GAME_INIT = {
    gameState: {
        currentTurn: 'player:1',
        timer: null,
        player1Score: 0,
        player2Score: 0,
        grid: [],
        choices: {},
        deck: {}
    }
}

const CHOICES_INIT = {
    isDefi: false,
    isSec: false,
    idSelectedChoice: null,
    availableChoices: [],
};

const ALL_COMBINATIONS = [
    { value: 'Brelan1', id: 'brelan1' },
    { value: 'Brelan2', id: 'brelan2' },
    { value: 'Brelan3', id: 'brelan3' },
    { value: 'Brelan4', id: 'brelan4' },
    { value: 'Brelan5', id: 'brelan5' },
    { value: 'Brelan6', id: 'brelan6' },
    { value: 'Full', id: 'full' },
    { value: 'Carré', id: 'carre' },
    { value: 'Yam', id: 'yam' },
    { value: 'Suite', id: 'suite' },
    { value: '≤8', id: 'moinshuit' },
    { value: 'Sec', id: 'sec' },
    { value: 'Défi', id: 'defi' }
];

const GRID_INIT = [
    [
        { viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false },
        { viewContent: '3', id: 'brelan3', owner: null, canBeChecked: false },
        { viewContent: 'Défi', id: 'defi', owner: null, canBeChecked: false },
        { viewContent: '4', id: 'brelan4', owner: null, canBeChecked: false },
        { viewContent: '6', id: 'brelan6', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '2', id: 'brelan2', owner: null, canBeChecked: false },
        { viewContent: 'Carré', id: 'carre', owner: null, canBeChecked: false },
        { viewContent: 'Sec', id: 'sec', owner: null, canBeChecked: false },
        { viewContent: 'Full', id: 'full', owner: null, canBeChecked: false },
        { viewContent: '5', id: 'brelan5', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '≤8', id: 'moinshuit', owner: null, canBeChecked: false },
        { viewContent: 'Full', id: 'full', owner: null, canBeChecked: false },
        { viewContent: 'Yam', id: 'yam', owner: null, canBeChecked: false },
        { viewContent: 'Défi', id: 'defi', owner: null, canBeChecked: false },
        { viewContent: 'Suite', id: 'suite', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '6', id: 'brelan6', owner: null, canBeChecked: false },
        { viewContent: 'Sec', id: 'sec', owner: null, canBeChecked: false },
        { viewContent: 'Suite', id: 'suite', owner: null, canBeChecked: false },
        { viewContent: '≤8', id: 'moinshuit', owner: null, canBeChecked: false },
        { viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '3', id: 'brelan3', owner: null, canBeChecked: false },
        { viewContent: '2', id: 'brelan2', owner: null, canBeChecked: false },
        { viewContent: 'Carré', id: 'carre', owner: null, canBeChecked: false },
        { viewContent: '5', id: 'brelan5', owner: null, canBeChecked: false },
        { viewContent: '4', id: 'brelan4', owner: null, canBeChecked: false },
    ]
];

const cloneGrid = (grid) => {
    return grid.map(row => row.map(cell => ({ ...cell })));
};

// methodes relatives à la gestion du jeu, des decks et des dés
const GameService = {

    init: {
        gameState: () => {
            const game = { ...GAME_INIT };
            game['gameState']['timer'] = TURN_DURATION;
            game['gameState']['deck'] = { ...DECK_INIT };
            game['gameState']['choices'] = { ...CHOICES_INIT };
            game['gameState']['grid'] = cloneGrid(GRID_INIT);
            return game;
        },

        deck: () => {
            return { ...DECK_INIT };
        },

        choices: () => {
            return { ...CHOICES_INIT };
        },

        grid: () => {
            return cloneGrid(GRID_INIT);
        }
    },

    send: {
        forPlayer: {
            viewGameState: (playerKey, game) => {
                return {
                    inQueue: false,
                    inGame: true,
                    idPlayer:
                        (playerKey === 'player:1')
                            ? game.player1Socket.id
                            : game.player2Socket.id,
                    idOpponent:
                        (playerKey === 'player:1')
                            ? game.player2Socket.id
                            : game.player1Socket.id,
                    playerName:
                        (playerKey === 'player:1')
                            ? game.player1Name
                            : game.player2Name,
                    opponentName:
                        (playerKey === 'player:1')
                            ? game.player2Name
                            : game.player1Name,
                    playerAuthenticated:
                        (playerKey === 'player:1')
                            ? game.player1Authenticated === true
                            : game.player2Authenticated === true,
                    opponentAuthenticated:
                        (playerKey === 'player:1')
                            ? game.player2Authenticated === true
                            : game.player1Authenticated === true
                };
            },

            viewQueueState: () => {
                return {
                    inQueue: true,
                    inGame: false,
                };
            },

            viewLeaveQueueState: () => {
                return {
                    inQueue: false,
                    inGame: false,
                };
            },

            gameTimer: (playerKey, gameState) => {
                const playerTimer = gameState.currentTurn === playerKey ? gameState.timer : 0;
                const opponentTimer = gameState.currentTurn === playerKey ? 0 : gameState.timer;

                return {
                    playerTimer: playerTimer,
                    opponentTimer: opponentTimer,
                };
            },

            deckViewState: (playerKey, gameState) => {
                const deckViewState = {
                    displayPlayerDeck: gameState.currentTurn === playerKey,
                    displayOpponentDeck: gameState.currentTurn !== playerKey,
                    displayRollButton: gameState.deck.rollsCounter <= gameState.deck.rollsMaximum,
                    canDeclareDefi:
                        gameState.currentTurn === playerKey
                        && gameState.deck.rollsCounter === 2
                        && !gameState.choices.isDefi
                        && !gameState.choices.idSelectedChoice,
                    isDefiActive: gameState.choices.isDefi,
                    rollsCounter: gameState.deck.rollsCounter,
                    rollsMaximum: gameState.deck.rollsMaximum,
                    dices: gameState.deck.dices
                };
                return deckViewState;


            },
            choicesViewState: (playerKey, gameState) => {
                const choicesViewState = {
                    displayChoices: true,
                    canMakeChoice: playerKey === gameState.currentTurn,
                    idSelectedChoice: gameState.choices.idSelectedChoice,
                    availableChoices: gameState.choices.availableChoices.map((choice) => ({
                        ...choice,
                        isSelectable: GameService.grid.hasAvailableCellForChoice(gameState.grid, choice.id),
                    }))
                }
                return choicesViewState;
            },

            gridViewState: (playerKey, gameState) => {

                return {
                    displayGrid: true,
                    canSelectCells: (playerKey === gameState.currentTurn) && (gameState.choices.availableChoices.length > 0),
                    grid: gameState.grid
                };

            },

            scoreViewState: (playerKey, gameState) => {
                if (playerKey === 'player:1') {
                    return {
                        playerScore: gameState.player1Score,
                        opponentScore: gameState.player2Score,
                        playerRemainingPawns: GameService.score.getRemainingPawns(gameState.grid, 'player:1'),
                        opponentRemainingPawns: GameService.score.getRemainingPawns(gameState.grid, 'player:2'),
                    };
                }

                return {
                    playerScore: gameState.player2Score,
                    opponentScore: gameState.player1Score,
                    playerRemainingPawns: GameService.score.getRemainingPawns(gameState.grid, 'player:2'),
                    opponentRemainingPawns: GameService.score.getRemainingPawns(gameState.grid, 'player:1'),
                };
            }

        }
    },

    timer: {
        getTurnDuration: () => {
            return TURN_DURATION;
        },

        getEndTurnDuration: () => {
            return END_TURN_DURATION;
        }
    },

    dices: {
        roll: (dicesToRoll) => {
            const rolledDices = dicesToRoll.map(dice => {
                if (dice.value === "") {
                    // Si la valeur du dé est vide, alors on le lance en mettant le flag locked à false
                    const newValue = String(Math.floor(Math.random() * 6) + 1);
                    return {
                        id: dice.id,
                        value: newValue,
                        locked: false
                    };
                } else if (dice.locked) {
                    // Si le dé est verrouillé ou a déjà une valeur mais le flag locked est true, on le laisse tel quel
                    return dice;
                }

                // Si le dé n'est pas verrouillé et possède déjà une valeur, alors on le relance
                const newValue = String(Math.floor(Math.random() * 6) + 1);
                return {
                    ...dice,
                    value: newValue
                };
            });
            return rolledDices;
        },

        lockEveryDice: (dicesToLock) => {
            const lockedDices = dicesToLock.map(dice => ({
                ...dice,
                locked: true
            }));
            return lockedDices;
        }
    },
    choices: {
        findCombinations: (dices, isDefi, isSec) => {
            const availableCombinations = [];
            const allCombinations = ALL_COMBINATIONS;

            const counts = new Array(7).fill(0); // Tableau pour compter le nombre de dés de chaque valeur (de 1 à 6)
            let hasPair = false; // Pour vérifier si une paire est présente
            let threeOfAKindValue = null; // Stocker la valeur du brelan
            let hasThreeOfAKind = false; // Pour vérifier si un brelan est présent
            let hasFourOfAKind = false; // Pour vérifier si un carré est présent
            let hasFiveOfAKind = false; // Pour vérifier si un Yam est présent
            let hasStraight = false; // Pour vérifier si une suite est présente
            let sum = 0; // Somme des valeurs des dés

            // Compter le nombre de dés de chaque valeur et calculer la somme
            for (const dice of dices) {
                const diceValue = Number.parseInt(dice.value, 10);
                counts[diceValue]++;
                sum += diceValue;
            }

            // Vérifier les combinaisons possibles
            for (let i = 1; i <= 6; i++) {
                if (counts[i] === 2) {
                    hasPair = true;
                } else if (counts[i] === 3) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                } else if (counts[i] === 4) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                    hasFourOfAKind = true;
                } else if (counts[i] === 5) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                    hasFourOfAKind = true;
                    hasFiveOfAKind = true;
                }
            }

            const sortedValues = dices.map(dice => Number.parseInt(dice.value, 10)).sort((a, b) => a - b); // Trie les valeurs de dé

            // Vérifie si les valeurs triées forment une suite
            hasStraight = sortedValues.every((value, index) => index === 0 || value === sortedValues[index - 1] + 1);

            // Vérifier si la somme ne dépasse pas 8
            const isLessThanEqual8 = sum <= 8;

            // Retourner les combinaisons possibles via leur ID
            allCombinations.forEach(combination => {
                if (
                    (combination.id.includes('brelan') && hasThreeOfAKind && Number.parseInt(combination.id.slice(-1), 10) === threeOfAKindValue) ||
                    (combination.id === 'full' && hasPair && hasThreeOfAKind) ||
                    (combination.id === 'carre' && hasFourOfAKind) ||
                    (combination.id === 'yam' && hasFiveOfAKind) ||
                    (combination.id === 'suite' && hasStraight) ||
                    (combination.id === 'moinshuit' && isLessThanEqual8)
                ) {
                    availableCombinations.push(combination);
                }
            });

            const hasNonBrelanCombination = availableCombinations.some((combination) => !combination.id.includes('brelan'));

            if (isSec && availableCombinations.length > 0 && hasNonBrelanCombination) {
                availableCombinations.push(allCombinations.find(combination => combination.id === 'sec'));
            }

            if (isDefi && hasNonBrelanCombination) {
                availableCombinations.push(allCombinations.find(combination => combination.id === 'defi'));
            }

            return availableCombinations;
        },

    },

    grid: {

        resetcanBeCheckedCells: (grid) => {
            const updatedGrid = grid.map(row => row.map(cell => {
                return { ...cell, canBeChecked: false };
            }));
            return updatedGrid;
        },

        updateGridAfterSelectingChoice: (idSelectedChoice, grid) => {

            const updatedGrid = grid.map(row => row.map(cell => {
                if (cell.id === idSelectedChoice && cell.owner === null) {
                    return { ...cell, canBeChecked: true };
                } else {
                    return cell;
                }
            }));

            return updatedGrid;
        },

        selectCell: (idCell, rowIndex, cellIndex, currentTurn, grid) => {
            const updatedGrid = grid.map((row, rowIndexParsing) => row.map((cell, cellIndexParsing) => {
                if ((cell.id === idCell) && (rowIndexParsing === rowIndex) && (cellIndexParsing === cellIndex)) {
                    return { ...cell, owner: currentTurn };
                } else {
                    return cell;
                }
            }));

            return updatedGrid;
        },

        isAnyCombinationAvailableOnGridForPlayer: (gameState) => {
            const grid = gameState.grid;
            const availableChoices = gameState.choices.availableChoices;

            // parcours de la grille pour vérifier si une combinaison est disponible pour le joueur dont c'est le tour
            for (let row of grid) {
                for (let cell of row) {
                    // cérifie si la cellule peut être vérifiée et si elle n'a pas déjà de propriétaire
                    if (cell.owner === null) {
                        for (let combination of availableChoices) {
                            if (cell.id === combination.id) {
                                return true;
                            }
                        }
                    }
                }
            }

            return false; // aucune combinaison disponible pour le joueur actuel
        },

        hasAvailableCellForChoice: (grid, choiceId) => {
            for (const row of grid) {
                for (const cell of row) {
                    if (cell.id === choiceId && cell.owner === null) {
                        return true;
                    }
                }
            }

            return false;
        }
    },

    score: {
        getAllLines: (grid) => {
            const lines = [];

            // Rows
            for (const row of grid) {
                lines.push(row);
            }

            // Columns
            for (let colIndex = 0; colIndex < grid[0].length; colIndex++) {
                const column = [];
                for (const row of grid) {
                    column.push(row[colIndex]);
                }
                lines.push(column);
            }

            // Main diagonal
            const mainDiagonal = [];
            for (let i = 0; i < grid.length; i++) {
                mainDiagonal.push(grid[i][i]);
            }
            lines.push(mainDiagonal);

            // Anti-diagonal
            const antiDiagonal = [];
            for (let i = 0; i < grid.length; i++) {
                antiDiagonal.push(grid[i][grid.length - 1 - i]);
            }
            lines.push(antiDiagonal);

            return lines;
        },

        getMaxConsecutiveInLine: (line, playerKey) => {
            let maxCount = 0;
            let currentCount = 0;

            for (const cell of line) {
                if (cell.owner === playerKey) {
                    currentCount += 1;
                    maxCount = Math.max(maxCount, currentCount);
                } else {
                    currentCount = 0;
                }
            }

            return maxCount;
        },

        computeScoreForPlayer: (grid, playerKey) => {
            const lines = GameService.score.getAllLines(grid);
            let score = 0;

            // Per rule set: 3 aligned -> 1 point, 4 aligned -> 2 points.
            lines.forEach((line) => {
                const maxConsecutive = GameService.score.getMaxConsecutiveInLine(line, playerKey);

                if (maxConsecutive >= 4) {
                    score += 2;
                } else if (maxConsecutive >= 3) {
                    score += 1;
                }
            });

            return score;
        },

        hasFiveAligned: (grid, playerKey) => {
            const lines = GameService.score.getAllLines(grid);
            return lines.some((line) => GameService.score.getMaxConsecutiveInLine(line, playerKey) >= 5);
        },

        getRemainingPawns: (grid, playerKey) => {
            let ownedCellsCount = 0;

            grid.forEach((row) => {
                row.forEach((cell) => {
                    if (cell.owner === playerKey) {
                        ownedCellsCount += 1;
                    }
                });
            });

            return Math.max(0, INITIAL_PAWNS_COUNT - ownedCellsCount);
        },
    },

    utils: {
        // Return game index in global games array by id
        findGameIndexById: (games, idGame) => {
            for (let i = 0; i < games.length; i++) {
                if (games[i].idGame === idGame) {
                    return i; // Retourne l'index du jeu si le socket est trouvé
                }
            }
            return -1;
        },

        findGameIndexBySocketId: (games, socketId) => {
            for (let i = 0; i < games.length; i++) {
                if (games[i].player1Socket.id === socketId || games[i].player2Socket.id === socketId) {
                    return i; // Retourne l'index du jeu si le socket est trouvé
                }
            }
            return -1;
        },

        findDiceIndexByDiceId: (dices, idDice) => {
            for (let i = 0; i < dices.length; i++) {
                if (dices[i].id === idDice) {
                    return i; // Retourne l'index du jeu si le socket est trouvé
                }
            }
            return -1;
        }
    }
}

module.exports = GameService;
