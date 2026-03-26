// app/components/board/board.component.js

import React, { useContext, useEffect, useState } from "react";
import PropTypes from 'prop-types';
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
      <Text style={styles.infoTitle}>🃏 Adversaire</Text>
    </View>
  );
};


const OpponentScore = ({ score, remainingPawns }) => {
  return (
    <View style={styles.opponentScoreContainer}>
      <Text style={styles.scoreText}>⭐ Score: {score}</Text>
      <Text style={styles.pawnsText}>🎯 Pions: {remainingPawns}</Text>
    </View>
  );
};



const PlayerInfos = () => {
  return (
    <View style={styles.playerInfosContainer}>
      <Text style={styles.infoTitle}>🎲 Toi</Text>
    </View>
  );
};


const PlayerScore = ({ score, remainingPawns }) => {

  return (
    <View style={styles.playerScoreContainer}>
      <Text style={styles.scoreText}>⭐ Score: {score}</Text>
      <Text style={styles.pawnsText}>🎯 Pions: {remainingPawns}</Text>
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

OpponentScore.propTypes = {
  score: PropTypes.number.isRequired,
  remainingPawns: PropTypes.number.isRequired,
};

PlayerScore.propTypes = {
  score: PropTypes.number.isRequired,
  remainingPawns: PropTypes.number.isRequired,
};

Board.propTypes = {
  gameViewState: PropTypes.object,
};

Board.defaultProps = {
  gameViewState: null,
};

const styles = StyleSheet.create({
  // 🎨 Plateau global
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D4AF37',
    backgroundColor: '#1A3D22',
  },
  // 🎨 Lignes du plateau
  row: {
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  // 🎨 Cartes infos adversaire
  opponentInfosContainer: {
    flex: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    backgroundColor: '#1A3D22',
  },
  opponentTimerScoreContainer: {
    flex: 3,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A3D22',
  },

  // 🎨 Cartes score adversaire
  opponentScoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(122, 17, 17, 0.25)',
  },
  deckOpponentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },

  deckPlayerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  // 🎨 Cartes infos joueur
  playerInfosContainer: {
    flex: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    backgroundColor: '#1A3D22',
  },
  playerTimerScoreContainer: {
    flex: 3,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A3D22',
  },
  playerScoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(122, 17, 17, 0.25)',
  },

  // 🎨 Typographie du HUD
  infoTitle: {
    color: '#FFF7E6',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  scoreText: {
    color: '#FFE082',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  pawnsText: {
    color: '#FFF7E6',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default Board;
