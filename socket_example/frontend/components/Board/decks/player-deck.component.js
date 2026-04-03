// app/components/board/decks/player-deck.component.js

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

  return (

    <View style={styles.deckPlayerContainer}>

      {displayPlayerDeck && (

        <>
          {displayRollButton && (
            <View style={styles.rollInfoContainer}>
              <Text style={styles.rollInfoText}>
                Lancer {rollsCounter} / {rollsMaximum}
              </Text>
            </View>
          )}

          {displayRollButton && (
            <TouchableOpacity
              style={[
                styles.defiButton,
                !canDeclareDefi && !isDefiActive && styles.defiButtonDisabled,
                isDefiActive && styles.defiButtonActive,
              ]}
              onPress={activateDefi}
              disabled={!canDeclareDefi || isDefiActive}
            >
              <Text style={styles.defiButtonText}>
                {isDefiActive ? "Defi active" : "Activer Defi"}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.diceContainer}>
            {dices.map((diceData, index) => (
              <Dice
                key={diceData.id}
                index={index}
                locked={diceData.locked}
                value={diceData.value}
                onPress={toggleDiceLock}
              />
            ))}
          </View>

          {displayRollButton && (
            <TouchableOpacity style={styles.rollButton} onPress={rollDices}>
              <Text style={styles.rollButtonText}>Roll</Text>
            </TouchableOpacity>
          )}
        </>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  // 🎨 Zone deck joueur
  deckPlayerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    backgroundColor: BOARD_COLORS.player1Soft,
  },
  // 🎨 Compteur de lancers
  rollInfoContainer: {
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: BOARD_COLORS.player1,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  rollInfoText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF7E6",
  },
  // 🎨 Rangée de dés joueur
  diceContainer: {
    flexDirection: "row",
    width: "70%",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    backgroundColor: BOARD_COLORS.player1Soft,
  },
  // 🎨 Bouton lancer
  rollButton: {
    width: "30%",
    paddingVertical: 12,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BOARD_COLORS.player1,
    borderWidth: 1,
    borderColor: "#D4AF37",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  rollButtonText: {
    fontSize: 14,
    color: "#FFF7E6",
    fontWeight: "900",
  },
  defiButton: {
    marginBottom: 10,
    width: "42%",
    paddingVertical: 10,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7A1111",
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  defiButtonDisabled: {
    opacity: 0.45,
  },
  defiButtonActive: {
    backgroundColor: "#2E7D32",
  },
  defiButtonText: {
    color: "#FFF7E6",
    fontSize: 12,
    fontWeight: "800",
  },
});

export default PlayerDeck;
