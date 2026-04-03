// app/components/board/decks/dice.component.js

import React from "react";
import PropTypes from "prop-types";
import { Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";

const Dice = ({ index, locked, value, onPress, opponent }) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 520;
  const isVerySmallScreen = width < 420;

  const handlePress = () => {
    if (!opponent) {
      onPress(index);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.dice,
        isSmallScreen && styles.diceCompact,
        isVerySmallScreen && styles.diceVeryCompact,
        locked && styles.lockedDice,
      ]}
      onPress={handlePress}
      disabled={opponent}
    >
      <Text style={[
        styles.diceText,
        isSmallScreen && styles.diceTextCompact,
        isVerySmallScreen && styles.diceTextVeryCompact,
      ]}>{value}</Text>
    </TouchableOpacity>
  );
};

Dice.propTypes = {
  index: PropTypes.number,
  locked: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onPress: PropTypes.func,
  opponent: PropTypes.bool,
};

Dice.defaultProps = {
  index: 0,
  locked: false,
  value: "",
  onPress: null,
  opponent: false,
};

const styles = StyleSheet.create({
  // LAYOUT: Dé standard
  dice: {
    width: 54,
    height: 54,
    backgroundColor: "#FFF7E6",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  diceCompact: {
    width: 46,
    height: 46,
    borderRadius: 8,
  },
  diceVeryCompact: {
    width: 40,
    height: 40,
    borderRadius: 7,
  },
  // LAYOUT: Dé verrouillé
  lockedDice: {
    backgroundColor: "#7A1111",
    borderColor: "#D4AF37",
  },
  // LAYOUT: Valeur du dé
  diceText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#3D1F14",
  },
  diceTextCompact: {
    fontSize: 18,
  },
  diceTextVeryCompact: {
    fontSize: 16,
  },
  opponentText: {
    fontSize: 12,
    color: "red",
  },
});

export default Dice;
