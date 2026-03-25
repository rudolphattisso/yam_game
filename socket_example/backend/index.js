// index.js

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const uniqid = require('uniqid');
const GameService = require('./services/game.service');

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


const createGame = (player1Socket, player2Socket) => {

  const newGame = GameService.init.gameState();
  newGame['idGame'] = uniqid();
  newGame['player1Socket'] = player1Socket;
  newGame['player2Socket'] = player2Socket;

  games.push(newGame);

  const gameIndex = GameService.utils.findGameIndexById(games, newGame.idGame);

  games[gameIndex].player1Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', games[gameIndex]));
  games[gameIndex].player2Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:2', games[gameIndex]));


  updateClientsViewTimers(games[gameIndex]);
  updateClientsViewDecks(games[gameIndex]);
  updateClientsViewGrid(games[gameIndex]);

  // On execute une fonction toutes les secondes (1000 ms)
  const gameInterval = setInterval(() => {

    const game = games[gameIndex];

    if (!game) {
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
      const isDefi = false;
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
      const isDefi = false;
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

    // TODO: Here calcul score
    // TODO: Then check if a player win

    // end turn
    passTurn(games[gameIndex]);
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

http.listen(3000, function () {
  console.log('listening on *:3000');
});

