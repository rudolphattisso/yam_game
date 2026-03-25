// app/components/board/board.component.js

import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet } from 'react-native';
import OpponentTimer from './opponent-timer.component';
import PlayerTimer from './player-timer.component';
import OpponentDeck from './decks/opponent-deck.component';
import PlayerDeck from './decks/player-deck.component';
import Grid from './grid/grid.component';
import Choices from './choices/choices.component';
import { SocketContext } from '../../contexts/socket.context';

const OpponentInfos = () => {
  return (
    <View style={styles.opponentInfosContainer}>
      <Text>Opponent infos</Text>
    </View>
  );
};


const OpponentScore = ({ score, remainingPawns }) => {
  return (
    <View style={styles.opponentScoreContainer}>
      <Text>Score: {score}</Text>
      <Text>Pions: {remainingPawns}</Text>
    </View>
  );
};



const PlayerInfos = () => {
  return (
    <View style={styles.playerInfosContainer}>
      <Text>Player Infos</Text>
    </View>
  );
};


const PlayerScore = ({ score, remainingPawns }) => {

  return (
    <View style={styles.playerScoreContainer}>
      <Text>Score: {score}</Text>
      <Text>Pions: {remainingPawns}</Text>
    </View>
  );
};



const Board = ({ gameViewState}) => {
  const socket = useContext(SocketContext);
  const [scores, setScores] = useState({
    playerScore: 0,
    opponentScore: 0,
    playerRemainingPawns: 12,
    opponentRemainingPawns: 12,
  });

  useEffect(() => {
    const onScoreViewState = (data) => {
      setScores({
        playerScore: data?.playerScore ?? 0,
        opponentScore: data?.opponentScore ?? 0,
        playerRemainingPawns: data?.playerRemainingPawns ?? 12,
        opponentRemainingPawns: data?.opponentRemainingPawns ?? 12,
      });
    };

    socket.on('game.score.view-state', onScoreViewState);

    return () => {
      socket.off('game.score.view-state', onScoreViewState);
    };
  }, [socket]);

  return (
    <View style={styles.container}>
      <View style={[styles.row, { height: '5%' }]}>
        <OpponentInfos />
        <View style={styles.opponentTimerScoreContainer}>
          <OpponentTimer />
          <OpponentScore score={scores.opponentScore} remainingPawns={scores.opponentRemainingPawns} />
        </View>
      </View>
      <View style={[styles.row, { height: '25%' }]}>
        <OpponentDeck />
      </View>
      <View style={[styles.row, { height: '40%' }]}>
        <Grid />
        <Choices />
      </View>
      <View style={[styles.row, { height: '25%' }]}>
        <PlayerDeck />
      </View>
      <View style={[styles.row, { height: '5%' }]}>
        <PlayerInfos />
        <View style={styles.playerTimerScoreContainer}>
          <PlayerTimer />
          <PlayerScore score={scores.playerScore} remainingPawns={scores.playerRemainingPawns} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: 1,
    borderColor: 'black',
  },
  opponentInfosContainer: {
    flex: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: 'black',
    backgroundColor: "lightgrey"
  },
  opponentTimerScoreContainer: {
    flex: 3,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "lightgrey"
  },

  opponentScoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deckOpponentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "black"
  },

  deckPlayerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'black',
  },
  playerInfosContainer: {
    flex: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: 'black',
    backgroundColor: "lightgrey"
  },
  playerTimerScoreContainer: {
    flex: 3,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "lightgrey"
  },
  playerScoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "lightgrey"
  },
});

export default Board;
