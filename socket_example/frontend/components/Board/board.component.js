// app/components/board/board.component.js
// LAYOUT: Complete redesign - No overlaps, clear zones, ergonomic spacing

import React, { useContext, useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import OpponentTimer from './opponent-timer.component';
import PlayerTimer from './player-timer.component';
import OpponentDeck from './decks/opponent-deck.component';
import PlayerDeck from './decks/player-deck.component';
import Grid from './grid/grid.component';
import Choices from './choices/choices.component';
import { SocketContext } from '../../contexts/socket.context';
import { BOARD_COLORS } from './board-colors';

// ─────────────────────────────────────────────────────────────
// LAYOUT: Opponent header — fixed bandeau with name | score + pawns
// ─────────────────────────────────────────────────────────────
const OpponentHeader = ({ name, remainingPawns, timerComponent }) => {
  return (
    <View style={styles.opponentHeader}>
      <View style={styles.opponentNameSection}>
        <Text style={styles.opponentLabel}>🃏 {name}</Text>
      </View>
      <View style={styles.opponentStatsSection}>
        <View style={styles.timerContainer}>
          {timerComponent}
        </View>
        <View style={styles.statsVertical}>
          <Text style={styles.pawnsText}>🎯 {remainingPawns}</Text>
        </View>
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// LAYOUT: Player footer — fixed bandeau with name | timer + score + pawns
// ─────────────────────────────────────────────────────────────
const PlayerFooter = ({ name, remainingPawns, timerComponent }) => {
  return (
    <View style={styles.playerFooter}>
      <View style={styles.playerNameSection}>
        <Text style={styles.playerLabel}>🎲 {name}</Text>
      </View>
      <View style={styles.playerStatsSection}>
        <View style={styles.timerContainer}>
          {timerComponent}
        </View>
        <View style={styles.statsVertical}>
          <Text style={styles.pawnsText}>🎯 {remainingPawns}</Text>
        </View>
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// LAYOUT: Main Board component
// ─────────────────────────────────────────────────────────────
const Board = ({ gameViewState, playerName, opponentName }) => {
  const socket = useContext(SocketContext);
  const { width, height } = useWindowDimensions();
  const [scores, setScores] = useState({
    playerScore: 0,
    opponentScore: 0,
    playerRemainingPawns: 12,
    opponentRemainingPawns: 12,
  });
  const [boardSections, setBoardSections] = useState({
    displayOpponentDeck: false,
    displayPlayerDeck: false,
    displayChoices: false,
  });
  const isCompactLayout = width < 900 || height < 760;
  const isSmallMobileLayout = width < 520 || height < 720;

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
    <View style={styles.boardContainer}>
      {/* LAYOUT: Opponent header bandeau — fixed height, no overflow */}
      <OpponentHeader
        name={opponentName || 'Adversaire'}
        remainingPawns={scores.opponentRemainingPawns}
        timerComponent={<OpponentTimer />}
      />

      {/* LAYOUT: Opponent deck zone */}
      <View style={[
        styles.opponentDeckZone,
        isSmallMobileLayout && styles.opponentDeckZoneCompact,
        !boardSections.displayOpponentDeck && styles.collapsedSection,
      ]}>
        <OpponentDeck
          onVisibilityChange={(visible) => {
            setBoardSections((previous) => ({ ...previous, displayOpponentDeck: visible }));
          }}
        />
      </View>

      {/* LAYOUT: Central game area with responsive grid + choices */}
      <View style={[
        styles.gameArea,
        isCompactLayout && styles.gameAreaCompact,
        isSmallMobileLayout && styles.gameAreaSmall,
        !boardSections.displayOpponentDeck && styles.gameAreaWithoutOpponentDeck,
        !boardSections.displayPlayerDeck && styles.gameAreaWithoutPlayerDeck,
      ]}>
        <View style={[
          styles.gridPanel,
          isCompactLayout && styles.gridPanelCompact,
          !boardSections.displayChoices && styles.gridPanelExpanded,
        ]}>
          <Grid />
        </View>

        <View style={[
          styles.choicesPanel,
          isCompactLayout && styles.choicesPanelCompact,
          isSmallMobileLayout && styles.choicesPanelSmall,
          !boardSections.displayChoices && styles.collapsedChoicesPanel,
        ]}>
          <Choices
            onVisibilityChange={(visible) => {
              setBoardSections((previous) => ({ ...previous, displayChoices: visible }));
            }}
          />
        </View>
      </View>

      {/* LAYOUT: Player controls zone — fixed, stacked vertically */}
      <View style={[
        styles.controlsZone,
        isCompactLayout && styles.controlsZoneCompact,
        isSmallMobileLayout && styles.controlsZoneSmall,
        !boardSections.displayPlayerDeck && styles.collapsedSection,
      ]}>
        <PlayerDeck
          onVisibilityChange={(visible) => {
            setBoardSections((previous) => ({ ...previous, displayPlayerDeck: visible }));
          }}
        />
      </View>

      {/* LAYOUT: Player footer bandeau — fixed height, no overflow */}
      <PlayerFooter
        name={playerName || 'Toi'}
        remainingPawns={scores.playerRemainingPawns}
        timerComponent={<PlayerTimer />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // ─────────────────────────────────────────────────────────
  // LAYOUT: Main container — flexbox column, no overflow
  // ─────────────────────────────────────────────────────────
  boardContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: 0,
    flexDirection: 'column',
    backgroundColor: '#1A3D22',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D4AF37',
    overflow: 'hidden',
  },

  // ─────────────────────────────────────────────────────────
  // LAYOUT: Opponent header — fixed bandeau, 7% height
  // ─────────────────────────────────────────────────────────
  opponentHeader: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(122, 17, 17, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  opponentNameSection: {
    flex: 1,
    justifyContent: 'center',
  },

  opponentLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFF7E6',
    letterSpacing: 0.2,
  },

  opponentStatsSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 10,
  },

  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
  },

  statsVertical: {
    alignItems: 'flex-end',
    gap: 2,
  },

  pawnsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF7E6',
  },

  // ─────────────────────────────────────────────────────────
  // LAYOUT: Opponent deck zone
  // ─────────────────────────────────────────────────────────
  opponentDeckZone: {
    width: '100%',
    minHeight: 92,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: BOARD_COLORS.player2Soft,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.4)',
  },

  opponentDeckZoneCompact: {
    minHeight: 72,
    paddingVertical: 6,
  },

  collapsedSection: {
    minHeight: 0,
    height: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
    overflow: 'hidden',
  },

  // ─────────────────────────────────────────────────────────
  // LAYOUT: Central game area — grid dominant, choices sidebar
  // ─────────────────────────────────────────────────────────
  gameArea: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: '#1A3D22',
  },

  gameAreaCompact: {
    flexDirection: 'column',
  },

  gameAreaSmall: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
  },

  gameAreaWithoutOpponentDeck: {
    paddingTop: 4,
  },

  gameAreaWithoutPlayerDeck: {
    paddingBottom: 4,
  },

  gridPanel: {
    flex: 3.4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    minHeight: 0,
  },

  gridPanelCompact: {
    width: '100%',
    flex: 1,
  },

  gridPanelExpanded: {
    flex: 1,
  },

  choicesPanel: {
    flex: 1.35,
    minWidth: 112,
    maxWidth: 172,
    alignSelf: 'stretch',
  },

  choicesPanelCompact: {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    flex: 0,
    minHeight: 128,
    maxHeight: 164,
  },

  choicesPanelSmall: {
    minHeight: 110,
    maxHeight: 138,
  },

  collapsedChoicesPanel: {
    flex: 0,
    width: 0,
    minWidth: 0,
    maxWidth: 0,
    minHeight: 0,
    maxHeight: 0,
    overflow: 'hidden',
  },

  // ─────────────────────────────────────────────────────────
  // LAYOUT: Controls zone — player deck, fixed bottom-middle
  // ─────────────────────────────────────────────────────────
  controlsZone: {
    minHeight: 172,
    width: '100%',
    backgroundColor: BOARD_COLORS.player1Soft,
    borderTopWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.4)',
    borderTopColor: 'rgba(212, 175, 55, 0.4)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  controlsZoneCompact: {
    minHeight: 146,
  },

  controlsZoneSmall: {
    minHeight: 126,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },

  // ─────────────────────────────────────────────────────────
  // LAYOUT: Player footer — fixed bandeau, 7% height
  // ─────────────────────────────────────────────────────────
  playerFooter: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(122, 17, 17, 0.15)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  playerNameSection: {
    flex: 1,
    justifyContent: 'center',
  },

  playerLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFF7E6',
    letterSpacing: 0.2,
  },

  playerStatsSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 10,
  },
});

Board.propTypes = {
  gameViewState: PropTypes.object,
  playerName: PropTypes.string,
  opponentName: PropTypes.string,
};

Board.defaultProps = {
  gameViewState: null,
  playerName: 'Toi',
  opponentName: 'Adversaire',
};

OpponentHeader.propTypes = {
  name: PropTypes.string.isRequired,
  remainingPawns: PropTypes.number.isRequired,
  timerComponent: PropTypes.element.isRequired,
};

PlayerFooter.propTypes = {
  name: PropTypes.string.isRequired,
  remainingPawns: PropTypes.number.isRequired,
  timerComponent: PropTypes.element.isRequired,
};

export default Board;
