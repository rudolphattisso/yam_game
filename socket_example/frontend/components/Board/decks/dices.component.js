// app/components/board/decks/dice.component.js

import React from "react";
import PropTypes from "prop-types";
import { Text, TouchableOpacity, StyleSheet, useWindowDimensions, View } from "react-native";

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
      <View style={[styles.diceGloss, locked && styles.diceGlossLocked]} />
      <View style={[styles.diceEdgeShadow, locked && styles.diceEdgeShadowLocked]} />
      <Text style={[
        styles.diceText,
        locked && styles.diceTextLocked,
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
    backgroundColor: "#FFFDF7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 7,
    overflow: "hidden",
  },
  diceCompact: {
    width: 46,
    height: 46,
    borderRadius: 10,
  },
  diceVeryCompact: {
    width: 40,
    height: 40,
    borderRadius: 9,
  },
  // Visuels 3D du dé
  diceGloss: {
    position: "absolute",
    top: 2,
    left: 2,
    right: 2,
    height: "36%",
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.78)",
  },
  diceGlossLocked: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  diceEdgeShadow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "30%",
    backgroundColor: "rgba(31,41,55,0.12)",
  },
  diceEdgeShadowLocked: {
    backgroundColor: "rgba(0,0,0,0.24)",
  },
  // LAYOUT: Dé verrouillé
  lockedDice: {
    backgroundColor: "#7A1111",
    borderColor: "#F6D77A",
    shadowOpacity: 0.35,
  },
  // LAYOUT: Valeur du dé
  diceText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#3D1F14",
    textShadowColor: "rgba(255,255,255,0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    zIndex: 2,
  },
  diceTextLocked: {
    color: "#FFF4CE",
    textShadowColor: "rgba(0,0,0,0.3)",
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
