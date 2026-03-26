// app/components/board/decks/opponent-deck.component.js

import React, { useState, useContext, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";
import Dice from "./dices.component";

const OpponentDeck = () => {

  const socket = useContext(SocketContext);
  
  const [displayOpponentDeck, setDisplayOpponentDeck] = useState(false);
  const [opponentDices, setOpponentDices] = useState(new Array(5).fill({ value: "", locked: false }));

  useEffect(() => {
    const onDeckViewState = (data) => {
      setDisplayOpponentDeck(data['displayOpponentDeck']);
      if (data['displayOpponentDeck']) {
        setOpponentDices(data['dices']);
      }
    };

    socket.on("game.deck.view-state", onDeckViewState);

    return () => {
      socket.off("game.deck.view-state", onDeckViewState);
    };
  }, [socket]);

  return (
    <View style={styles.deckOpponentContainer}>
      {displayOpponentDeck && (
        <View style={styles.diceContainer}>
          {opponentDices.map((diceData, index) => (
            <Dice
              key={diceData.id ?? index}
              locked={diceData.locked}
              value={diceData.value}
              opponent={true}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // 🎨 Zone deck adverse
  deckOpponentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    backgroundColor: "#1A3D22",
  },
  // 🎨 Rangée de dés adverses
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
    backgroundColor: "rgba(122, 17, 17, 0.25)",
  },
});

export default OpponentDeck;
