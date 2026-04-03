// index.js

const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const app = express();
const http = require('node:http').Server(app);
const corsAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || process.env.FRONTEND_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const io = require('socket.io')(http, {
  cors: {
    origin: corsAllowedOrigins.includes('*') ? '*' : corsAllowedOrigins,
    methods: ['GET', 'POST'],
  },
});

const uniqid = require('uniqid');
const GameService = require('./services/game.service');
const { query, testDatabaseConnection } = require('./db/postgres');
const authRouter = require('./routes/auth.routes');
const gamesRouter = require('./routes/games.routes');

app.use(express.json());
app.use(cors({
  origin: corsAllowedOrigins.includes('*') ? '*' : corsAllowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
}));
app.use('/api/auth', authRouter);
app.use('/api/games', gamesRouter);

// ---------------------------------------------------
// -------- CONSTANTS AND GLOBAL VARIABLES -----------
// ---------------------------------------------------

let games = [];
let queue = [];

// ------------------------------------
// -------- EMITTER METHODS -----------
// ------------------------------------

const updateClientsViewTimers = (game) => {
  game.player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', game.gameState));
  game.player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', game.gameState));
};

const updateClientsViewDecks = (game) => {
  setTimeout(() => {
    game.player1Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:1', game.gameState));
    game.player2Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:2', game.gameState));
  }, 200);
};

const updateClientsViewChoices = (game) => {
  setTimeout(() => {
    game.player1Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:1', game.gameState));
    game.player2Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:2', game.gameState));
  }, 200);
};

const updateClientsViewGrid = (game) => {
  setTimeout(() => {
    game.player1Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:1', game.gameState));
    game.player2Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:2', game.gameState));
  }, 200)
}

const updateClientsViewScores = (game) => {
  setTimeout(() => {
    game.player1Socket.emit('game.score.view-state', GameService.send.forPlayer.scoreViewState('player:1', game.gameState));
    game.player2Socket.emit('game.score.view-state', GameService.send.forPlayer.scoreViewState('player:2', game.gameState));
  }, 200);
};

const getPlayerKeyBySocketId = (game, socketId) => {
  if (game.player1Socket.id === socketId) {
    return 'player:1';
  }

  if (game.player2Socket.id === socketId) {
    return 'player:2';
  }

  return null;
};

const sendCurrentGameStateToPlayer = (game, socket) => {
  const playerKey = getPlayerKeyBySocketId(game, socket.id);

  if (!playerKey) {
    return;
  }

  socket.emit('game.start', GameService.send.forPlayer.viewGameState(playerKey, game));

  socket.emit('game.timer', GameService.send.forPlayer.gameTimer(playerKey, game.gameState));
  socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState(playerKey, game.gameState));
  socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState(playerKey, game.gameState));
  socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState(playerKey, game.gameState));
  socket.emit('game.score.view-state', GameService.send.forPlayer.scoreViewState(playerKey, game.gameState));
};

const removeSocketFromQueue = (socketId) => {
  queue = queue.filter((queuedSocket) => queuedSocket.id !== socketId);
};

const passTurn = (game) => {
  game.gameState.currentTurn = game.gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
  game.gameState.timer = GameService.timer.getTurnDuration();
  game.gameState.deck = GameService.init.deck();
  game.gameState.choices = GameService.init.choices();
  game.gameState.grid = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);

  updateClientsViewTimers(game);
  updateClientsViewDecks(game);
  updateClientsViewChoices(game);
  updateClientsViewGrid(game);
};

const tryAutoPassTurnAtTimerZero = (game) => {
  if (game.gameState.timer !== 0) {
    return false;
  }

  const hasPlayableCombination = GameService.grid.isAnyCombinationAvailableOnGridForPlayer(game.gameState);

  // Tant qu'une combinaison est jouable, le joueur doit selectionner puis poser en grille.
  if (hasPlayableCombination) {
    return false;
  }

  passTurn(game);
  return true;
};

const findFirstFreeCellForChoice = (grid, choiceId) => {
  for (let rowIndex = 0; rowIndex < grid.length; rowIndex += 1) {
    for (let cellIndex = 0; cellIndex < grid[rowIndex].length; cellIndex += 1) {
      const cell = grid[rowIndex][cellIndex];
      if (cell.id === choiceId && cell.owner === null) {
        return { rowIndex, cellIndex };
      }
    }
  }

  return null;
};

const listFreeCellsForChoice = (grid, choiceId) => {
  const cells = [];

  for (let rowIndex = 0; rowIndex < grid.length; rowIndex += 1) {
    for (let cellIndex = 0; cellIndex < grid[rowIndex].length; cellIndex += 1) {
      const cell = grid[rowIndex][cellIndex];
      if (cell.id === choiceId && cell.owner === null) {
        cells.push({ rowIndex, cellIndex, cellId: choiceId });
      }
    }
  }

  return cells;
};

const pickBestBotMove = (gameState) => {
  const candidateCells = gameState.choices.availableChoices.flatMap((choice) =>
    listFreeCellsForChoice(gameState.grid, choice.id),
  );

  if (candidateCells.length === 0) {
    return null;
  }

  let bestMove = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  candidateCells.forEach((candidate) => {
    const simulatedGrid = GameService.grid.selectCell(
      candidate.cellId,
      candidate.rowIndex,
      candidate.cellIndex,
      'player:2',
      gameState.grid,
    );

    const botScore = GameService.score.computeScoreForPlayer(simulatedGrid, 'player:2');
    const playerScore = GameService.score.computeScoreForPlayer(simulatedGrid, 'player:1');

    const hasImmediateWin = GameService.score.hasFiveAligned(simulatedGrid, 'player:2');

    // Simple heuristic: prioritize immediate win, then maximize own score while minimizing opponent score.
    const moveScore = (hasImmediateWin ? 10_000 : 0) + (botScore * 10) - (playerScore * 4);

    if (moveScore > bestScore) {
      bestScore = moveScore;
      bestMove = candidate;
    }
  });

  return bestMove;
};

const resolveGameAfterMove = (gameIndex) => {
  const game = games[gameIndex];

  if (!game) {
    return;
  }

  game.gameState.player1Score = GameService.score.computeScoreForPlayer(game.gameState.grid, 'player:1');
  game.gameState.player2Score = GameService.score.computeScoreForPlayer(game.gameState.grid, 'player:2');

  updateClientsViewGrid(game);
  updateClientsViewScores(game);

  if (GameService.score.hasFiveAligned(game.gameState.grid, 'player:1')) {
    endGameWithResult(gameIndex, 'player:1', 'five-aligned');
    return;
  }

  if (GameService.score.hasFiveAligned(game.gameState.grid, 'player:2')) {
    endGameWithResult(gameIndex, 'player:2', 'five-aligned');
    return;
  }

  const player1RemainingPawns = GameService.score.getRemainingPawns(game.gameState.grid, 'player:1');
  const player2RemainingPawns = GameService.score.getRemainingPawns(game.gameState.grid, 'player:2');

  if (player1RemainingPawns === 0 || player2RemainingPawns === 0) {
    const player1Score = game.gameState.player1Score;
    const player2Score = game.gameState.player2Score;

    let winner = 'draw';
    if (player1Score > player2Score) {
      winner = 'player:1';
    } else if (player2Score > player1Score) {
      winner = 'player:2';
    }

    endGameWithResult(gameIndex, winner, 'no-pawns-left');
    return;
  }

  passTurn(game);
};

const runBotTurn = (gameIndex) => {
  const game = games[gameIndex];

  if (!game || !game.isVsBot || game.gameState.currentTurn !== 'player:2') {
    return;
  }

  const gameState = game.gameState;

  if (gameState.deck.rollsCounter === 2 && !gameState.choices.isDefi) {
    const hasNonBrelanOnFirstRoll = gameState.choices.availableChoices
      .some((choice) => !choice.id.includes('brelan') && choice.id !== 'sec' && choice.id !== 'defi');

    if (!hasNonBrelanOnFirstRoll) {
      gameState.choices.isDefi = true;
      updateClientsViewDecks(game);
      updateClientsViewChoices(game);
    }
  }

  if (gameState.deck.rollsCounter <= gameState.deck.rollsMaximum) {
    gameState.deck.dices = GameService.dices.roll(gameState.deck.dices);
    gameState.deck.rollsCounter += 1;

    if (gameState.deck.rollsCounter > gameState.deck.rollsMaximum) {
      gameState.deck.dices = GameService.dices.lockEveryDice(gameState.deck.dices);
      gameState.timer = 0;
    }

    const isDefi = gameState.choices.isDefi;
    const isSec = gameState.deck.rollsCounter === 2;
    gameState.choices.availableChoices = GameService.choices.findCombinations(gameState.deck.dices, isDefi, isSec);

    updateClientsViewDecks(game);
    updateClientsViewChoices(game);
    updateClientsViewTimers(game);
  }

  const bestMove = pickBestBotMove(gameState);

  if (bestMove) {
    gameState.choices.idSelectedChoice = bestMove.cellId;
    gameState.grid = GameService.grid.resetcanBeCheckedCells(gameState.grid);
    gameState.grid = GameService.grid.selectCell(
      bestMove.cellId,
      bestMove.rowIndex,
      bestMove.cellIndex,
      'player:2',
      gameState.grid,
    );

    resolveGameAfterMove(gameIndex);
    return;
  }

  if (gameState.timer === 0 || gameState.deck.rollsCounter > gameState.deck.rollsMaximum) {
    passTurn(game);
  }
};

const createBotSocket = () => ({
  id: `bot:${uniqid()}`,
  connected: true,
  emit: () => {},
  on: () => {},
  off: () => {},
});

const endGameBySocketId = (socketId) => {
  const gameIndex = GameService.utils.findGameIndexBySocketId(games, socketId);

  if (gameIndex === -1) {
    return;
  }

  const game = games[gameIndex];

  if (game.intervalId) {
    clearInterval(game.intervalId);
  }

  const opponentSocket = game.player1Socket.id === socketId ? game.player2Socket : game.player1Socket;
  if (opponentSocket?.connected) {
    opponentSocket.emit('game.opponent.left', {
      inQueue: false,
      inGame: false,
      message: 'Opponent disconnected',
    });
  }

  games.splice(gameIndex, 1);
};

const persistFinishedGame = async (game, winnerKey, reason) => {
  try {
    const mode = game.isVsBot ? 'bot' : 'online';
    const winnerSlot = winnerKey === 'player:1' ? 1 : winnerKey === 'player:2' ? 2 : null;

    const gameInsert = await query(
      `
      INSERT INTO games (mode, status, started_at, ended_at, winner_slot, win_reason, metadata)
      VALUES ($1, 'finished', $2, NOW(), $3, $4, $5::jsonb)
      RETURNING id
      `,
      [
        mode,
        game.startedAt || new Date(),
        winnerSlot,
        reason,
        JSON.stringify({
          idGame: game.idGame,
          finalGrid: game.gameState.grid,
        }),
      ],
    );

    const persistedGameId = gameInsert.rows[0].id;

    await query(
      `
      INSERT INTO game_players (game_id, guest_label, socket_id, player_slot, score, is_winner)
      VALUES
        ($1, $2, $3, 1, $4, $5),
        ($1, $6, $7, 2, $8, $9)
      `,
      [
        persistedGameId,
        game.isVsBot ? 'human' : 'player1',
        game.player1Socket.id,
        game.gameState.player1Score,
        winnerKey === 'player:1',
        game.isVsBot ? 'bot' : 'player2',
        game.player2Socket.id,
        game.gameState.player2Score,
        winnerKey === 'player:2',
      ],
    );
  } catch (error) {
    console.warn(`[db] failed to persist finished game: ${error.message}`);
  }
};

const endGameWithResult = (gameIndex, winnerKey, reason) => {
  const game = games[gameIndex];

  if (!game) {
    return;
  }

  if (game.intervalId) {
    clearInterval(game.intervalId);
  }

  game.player1Socket.emit('game.end', {
    winner: winnerKey,
    reason,
    isWinner: winnerKey === 'player:1',
    playerScore: game.gameState.player1Score,
    opponentScore: game.gameState.player2Score,
  });

  game.player2Socket.emit('game.end', {
    winner: winnerKey,
    reason,
    isWinner: winnerKey === 'player:2',
    playerScore: game.gameState.player2Score,
    opponentScore: game.gameState.player1Score,
  });

  persistFinishedGame(game, winnerKey, reason);

  games.splice(gameIndex, 1);
};

// ---------------------------------
// -------- GAME METHODS -----------
// ---------------------------------

const newPlayerInQueue = (socket) => {

  const existingGameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
  if (existingGameIndex !== -1) {
    sendCurrentGameStateToPlayer(games[existingGameIndex], socket);
    return;
  }

  const isAlreadyInQueue = queue.some((queuedSocket) => queuedSocket.id === socket.id);
  if (isAlreadyInQueue) {
    socket.emit('queue.added', GameService.send.forPlayer.viewQueueState());
    return;
  }

  queue.push(socket);

  // Queue management
  if (queue.length >= 2) {
    const player1Socket = queue.shift();
    const player2Socket = queue.shift();
    createGame(player1Socket, player2Socket);
  }
  else {
    socket.emit('queue.added', GameService.send.forPlayer.viewQueueState());
  }
};

const newPlayerVsBot = (socket) => {
  const existingGameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
  if (existingGameIndex !== -1) {
    sendCurrentGameStateToPlayer(games[existingGameIndex], socket);
    return;
  }

  removeSocketFromQueue(socket.id);

  const botSocket = createBotSocket();
  createGame(socket, botSocket, { isVsBot: true });
};

const createGame = (player1Socket, player2Socket, options = {}) => {

  const newGame = GameService.init.gameState();
  newGame['idGame'] = uniqid();
  newGame['startedAt'] = new Date();
  newGame['player1Socket'] = player1Socket;
  newGame['player2Socket'] = player2Socket;
  newGame['isVsBot'] = options.isVsBot === true;

  games.push(newGame);

  const gameIndex = GameService.utils.findGameIndexById(games, newGame.idGame);

  games[gameIndex].player1Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', games[gameIndex]));
  games[gameIndex].player2Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:2', games[gameIndex]));


  updateClientsViewTimers(games[gameIndex]);
  updateClientsViewDecks(games[gameIndex]);
  updateClientsViewGrid(games[gameIndex]);
  updateClientsViewScores(games[gameIndex]);

  // On execute une fonction toutes les secondes (1000 ms)
  const gameInterval = setInterval(() => {

    const game = games[gameIndex];

    if (!game) {
      return;
    }

    if (game.isVsBot && game.gameState.currentTurn === 'player:2') {
      runBotTurn(gameIndex);
      return;
    }

    if (game.gameState.timer > 0) {
      game.gameState.timer--;
      updateClientsViewTimers(game);
    }

    // Si le timer tombe à zéro
    if (game.gameState.timer === 0) {
      tryAutoPassTurnAtTimerZero(game);
    }

  }, 1000);

  games[gameIndex].intervalId = gameInterval;

  // On prévoit de couper l'horloge
  // pour le moment uniquement quand le socket se déconnecte
  player1Socket.on('disconnect', () => {
    clearInterval(gameInterval);
  });

  player2Socket.on('disconnect', () => {
    clearInterval(gameInterval);
  });

};

// ---------------------------------------
// -------- SOCKETS MANAGEMENT -----------
// ---------------------------------------

io.on('connection', socket => {

  console.log(`[${socket.id}] socket connected`);

  socket.on('queue.join', () => {
    console.log(`[${socket.id}] new player in queue `);
    newPlayerInQueue(socket);
  });

  socket.on('queue.bot.join', () => {
    console.log(`[${socket.id}] new player vs bot`);
    newPlayerVsBot(socket);
  });

  socket.on('game.leave', () => {
    removeSocketFromQueue(socket.id);
    endGameBySocketId(socket.id);
  });

  socket.on('game.dices.roll', () => {

    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    if (gameIndex === -1) {
      return;
    }

    if (games[gameIndex].gameState.currentTurn !== getPlayerKeyBySocketId(games[gameIndex], socket.id)) {
      return;
    }

    // Si un choix est deja fait, le joueur doit poser la combinaison sur la grille.
    if (games[gameIndex].gameState.choices.idSelectedChoice) {
      return;
    }

    if (games[gameIndex].gameState.deck.rollsCounter < games[gameIndex].gameState.deck.rollsMaximum) {
      // si ce n'est pas le dernier lancé

      // gestion des dés 
      games[gameIndex].gameState.deck.dices = GameService.dices.roll(games[gameIndex].gameState.deck.dices);
      games[gameIndex].gameState.deck.rollsCounter++;

      // combinations management
      const dices = games[gameIndex].gameState.deck.dices;
      const isDefi = games[gameIndex].gameState.choices.isDefi;
      const isSec = games[gameIndex].gameState.deck.rollsCounter === 2;

      const combinations = GameService.choices.findCombinations(dices, isDefi, isSec);
      games[gameIndex].gameState.choices.availableChoices = combinations;

      // gestion des vues
      updateClientsViewDecks(games[gameIndex]);
      updateClientsViewChoices(games[gameIndex]);

    } else {
      // si c'est le dernier lancer

      // gestion des dés 
      games[gameIndex].gameState.deck.dices = GameService.dices.roll(games[gameIndex].gameState.deck.dices);
      games[gameIndex].gameState.deck.rollsCounter++;
      games[gameIndex].gameState.deck.dices = GameService.dices.lockEveryDice(games[gameIndex].gameState.deck.dices);

      // combinations management
      const dices = games[gameIndex].gameState.deck.dices;
      const isDefi = games[gameIndex].gameState.choices.isDefi;
      const isSec = games[gameIndex].gameState.deck.rollsCounter === 2;

      const combinations = GameService.choices.findCombinations(dices, isDefi, isSec);
      games[gameIndex].gameState.choices.availableChoices = combinations;

      // Fin de lancers: le joueur doit choisir/poser une combinaison avant de passer le tour.
      games[gameIndex].gameState.timer = 0;

      const hasAutoPassed = tryAutoPassTurnAtTimerZero(games[gameIndex]);

      if (!hasAutoPassed) {
        updateClientsViewTimers(games[gameIndex]);
        updateClientsViewDecks(games[gameIndex]);
        updateClientsViewChoices(games[gameIndex]);
      }
    }

  });

  socket.on('game.dices.lock', (idDice) => {

    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    if (gameIndex === -1) {
      return;
    }

    if (games[gameIndex].gameState.currentTurn !== getPlayerKeyBySocketId(games[gameIndex], socket.id)) {
      return;
    }

    const indexDice = GameService.utils.findDiceIndexByDiceId(games[gameIndex].gameState.deck.dices, idDice);
    if (indexDice === -1) {
      return;
    }

    if (games[gameIndex].gameState.deck.rollsCounter > games[gameIndex].gameState.deck.rollsMaximum) {
      return;
    }

    // reverse flag 'locked'
    games[gameIndex].gameState.deck.dices[indexDice].locked = !games[gameIndex].gameState.deck.dices[indexDice].locked;

    updateClientsViewDecks(games[gameIndex]);
  });

  socket.on('game.defi.activate', () => {
    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    if (gameIndex === -1) {
      return;
    }

    const game = games[gameIndex];

    if (game.gameState.currentTurn !== getPlayerKeyBySocketId(game, socket.id)) {
      return;
    }

    if (game.gameState.deck.rollsCounter !== 2) {
      return;
    }

    if (game.gameState.choices.idSelectedChoice || game.gameState.choices.isDefi) {
      return;
    }

    game.gameState.choices.isDefi = true;
    updateClientsViewDecks(game);
    updateClientsViewChoices(game);
  });

  socket.on('game.choices.selected', (data) => {

    // gestion des choix
    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    if (gameIndex === -1) {
      return;
    }

    if (games[gameIndex].gameState.currentTurn !== getPlayerKeyBySocketId(games[gameIndex], socket.id)) {
      return;
    }

    const isAvailableChoice = games[gameIndex].gameState.choices.availableChoices
      .some((choice) => choice.id === data.choiceId);

    if (!isAvailableChoice) {
      return;
    }

    const canPlaceChoiceOnGrid = GameService.grid.hasAvailableCellForChoice(
      games[gameIndex].gameState.grid,
      data.choiceId,
    );

    if (!canPlaceChoiceOnGrid) {
      return;
    }

    games[gameIndex].gameState.choices.idSelectedChoice = data.choiceId;

    // Mise à jour de la grille
    games[gameIndex].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gameIndex].gameState.grid);
    games[gameIndex].gameState.grid = GameService.grid.updateGridAfterSelectingChoice(data.choiceId, games[gameIndex].gameState.grid);

    updateClientsViewChoices(games[gameIndex]);
    updateClientsViewGrid(games[gameIndex]);
  });

  socket.on('game.grid.selected', (data) => {

    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    if (gameIndex === -1) {
      return;
    }

    if (games[gameIndex].gameState.currentTurn !== getPlayerKeyBySocketId(games[gameIndex], socket.id)) {
      return;
    }

    if (!games[gameIndex].gameState.choices.idSelectedChoice) {
      return;
    }

    const row = games[gameIndex].gameState.grid[data.rowIndex];
    if (!row) {
      return;
    }

    const selectedCell = row[data.cellIndex];
    if (!selectedCell) {
      return;
    }

    if (selectedCell.id !== data.cellId || !selectedCell.canBeChecked || selectedCell.owner !== null) {
      return;
    }

    games[gameIndex].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gameIndex].gameState.grid);
    games[gameIndex].gameState.grid = GameService.grid.selectCell(data.cellId, data.rowIndex, data.cellIndex, games[gameIndex].gameState.currentTurn, games[gameIndex].gameState.grid);
    resolveGameAfterMove(gameIndex);
  });


  socket.on('disconnect', reason => {
    console.log(`[${socket.id}] socket disconnected - ${reason}`);
    removeSocketFromQueue(socket.id);
    endGameBySocketId(socket.id);
  });

});

// -----------------------------------
// -------- SERVER METHODS -----------
// -----------------------------------

app.get('/', (req, res) => res.sendFile('index.html'));

const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 3000);

const startServer = async () => {
  try {
    await testDatabaseConnection();
  } catch (error) {
    console.error(`[db] PostgreSQL ping failed: ${error.message}`);
  }

  http.listen(PORT, function () {
    console.log(`listening on *:${PORT}`);
  });
};

startServer();

