// app/components/board/decks/player-deck.redesigned.js
// LAYOUT: Controls zone — stacked vertically with proper spacing

import React, { useState, useContext, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";
import Dice from "./dices.component";
import { BOARD_COLORS } from "../board-colors";

const PlayerDeck = () => {
  const socket = useContext(SocketContext);
  const [displayPlayerDeck, setDisplayPlayerDeck] = useState(false);
  const [dices, setDices] = useState(new Array(5).fill(false));
  const [displayRollButton, setDisplayRollButton] = useState(false);
  const [canDeclareDefi, setCanDeclareDefi] = useState(false);
  const [isDefiActive, setIsDefiActive] = useState(false);
  const [rollsCounter, setRollsCounter] = useState(0);
  const [rollsMaximum, setRollsMaximum] = useState(3);

  useEffect(() => {
    const onDeckViewState = (data) => {
      setDisplayPlayerDeck(data['displayPlayerDeck']);
      if (data['displayPlayerDeck']) {
        setDisplayRollButton(data['displayRollButton']);
        setCanDeclareDefi(Boolean(data['canDeclareDefi']));
        setIsDefiActive(Boolean(data['isDefiActive']));
        setRollsCounter(data['rollsCounter']);
        setRollsMaximum(data['rollsMaximum']);
        setDices(data['dices']);
      }
    };

    socket.on("game.deck.view-state", onDeckViewState);

    return () => {
      socket.off("game.deck.view-state", onDeckViewState);
    };
  }, [socket]);

  const toggleDiceLock = (index) => {
    const newDices = [...dices];
    if (newDices[index].value !== '' && displayRollButton) {
      socket.emit("game.dices.lock", newDices[index].id);
    }
  };

  const rollDices = () => {
    if (rollsCounter <= rollsMaximum) {
      socket.emit("game.dices.roll");
    }
  };

  const activateDefi = () => {
    if (canDeclareDefi && !isDefiActive) {
      socket.emit("game.defi.activate");
    }
  };

  if (!displayPlayerDeck) return null;

  return (
    <View style={styles.controlsContainer}>
      {/* LAYOUT: Section 1 — Roll counter + full-width Roll button (green) */}
      {displayRollButton && (
        <View style={styles.rollSection}>
          <View style={styles.rollCounterBadge}>
            <Text style={styles.rollCounterText}>
              🎲 Lancer {rollsCounter} / {rollsMaximum}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.rollButtonFullWidth}
            onPress={rollDices}
            activeOpacity={0.7}
          >
            <Text style={styles.rollButtonText}>🎲 ROLL</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LAYOUT: Section 2 — Full-width Defi button (orange/maroon) */}
      {displayRollButton && (
        <TouchableOpacity
          style={[
            styles.defiButtonFullWidth,
            !canDeclareDefi && !isDefiActive && styles.defiButtonDisabled,
            isDefiActive && styles.defiButtonActive,
          ]}
          onPress={activateDefi}
          disabled={!canDeclareDefi || isDefiActive}
          activeOpacity={0.7}
        >
          <Text style={styles.defiButtonText}>
            {isDefiActive ? "🔥 DEFI ACTIF 🔥" : "🎯 ACTIVER DEFI"}
          </Text>
        </TouchableOpacity>
      )}

      {/* LAYOUT: Section 3 — Dice row (5 dice, min 52x52px each, no truncation) */}
      {displayRollButton && (
        <View style={styles.dicesRow}>
          {dices.map((diceData, index) => (
            <View key={diceData.id} style={styles.diceWrapper}>
              <Dice
                index={index}
                locked={diceData.locked}
                value={diceData.value}
                onPress={toggleDiceLock}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // ─────────────────────────────────────────────────────────
  // LAYOUT: Main controls container — vertical stack, no flex shrink
  // ─────────────────────────────────────────────────────────
  controlsContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: 10,
    paddingHorizontal: 0,
    paddingVertical: 6,
    alignItems: 'stretch',
    justifyContent: 'center',
  },

  // ─────────────────────────────────────────────────────────
  // LAYOUT: Roll section — counter badge + button on same area
  // ─────────────────────────────────────────────────────────
  rollSection: {
    width: '100%',
    gap: 6,
    alignItems: 'center',
  },

  rollCounterBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#2E7D32',
    borderWidth: 1,
    borderColor: '#4ADE80',
    alignSelf: 'center',
  },

  rollCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F1F8E9',
  },

  // ─────────────────────────────────────────────────────────
  // LAYOUT: Roll button — full width, green, prominent
  // ─────────────────────────────────────────────────────────
  rollButtonFullWidth: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
    borderWidth: 2,
    borderColor: '#4ADE80',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  rollButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F1F8E9',
    letterSpacing: 1,
  },

  // ─────────────────────────────────────────────────────────
  // LAYOUT: Defi button — full width, orange/maroon, distinct
  // ─────────────────────────────────────────────────────────
  defiButtonFullWidth: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#B8860B',
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },

  defiButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#666666',
    borderColor: '#999999',
  },

  defiButtonActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#4ADE80',
  },

  defiButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF7E6',
    letterSpacing: 0.5,
  },

  // ─────────────────────────────────────────────────────────
  // LAYOUT: Dices row — 5 dice, min 52x52px each, equidistant
  // ─────────────────────────────────────────────────────────
  dicesRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    minHeight: 88,
  },

  diceWrapper: {
    flex: 1,
    maxWidth: 68,
    minWidth: 54,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlayerDeck;
