// app/components/board/decks/opponent-deck.component.js

import React, { useState, useContext, useEffect } from "react";
import PropTypes from "prop-types";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";
import Dice from "./dices.component";
import { BOARD_COLORS } from "../board-colors";

const OpponentDeck = ({ onVisibilityChange }) => {

  const socket = useContext(SocketContext);
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 520;
  
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

  useEffect(() => {
    if (onVisibilityChange) {
      onVisibilityChange(displayOpponentDeck);
    }
  }, [displayOpponentDeck, onVisibilityChange]);

  if (!displayOpponentDeck) {
    return null;
  }

  return (
    <View style={styles.deckOpponentContainer}>
      <View style={[styles.diceContainer, isSmallScreen && styles.diceContainerCompact]}>
        {opponentDices.map((diceData, index) => (
          <Dice
            key={diceData.id ?? index}
            locked={diceData.locked}
            value={diceData.value}
            opponent={true}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // LAYOUT: Zone deck adverse
  deckOpponentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BOARD_COLORS.player2Soft,
  },
  // LAYOUT: Rangée de dés adverses
  diceContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    backgroundColor: BOARD_COLORS.player2Soft,
  },
  diceContainerCompact: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
});

export default OpponentDeck;

OpponentDeck.propTypes = {
  onVisibilityChange: PropTypes.func,
};

OpponentDeck.defaultProps = {
  onVisibilityChange: null,
};
