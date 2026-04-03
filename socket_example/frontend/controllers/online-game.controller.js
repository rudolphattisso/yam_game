// app/controllers/online-game.controller.js

import React, { useEffect, useState, useContext, useRef } from "react";
import PropTypes from "prop-types";
import { StyleSheet, Text, View, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SocketContext } from "../contexts/socket.context";
import Board from "../components/board/board.component";

// ─── Tokens (charte verte/or existante) ──────────────────────────────────────
const C = {
  bg:          "#1A3D22",
  cardBorder:  "#D4AF37",
  primary:     "#7A1111",
  gold:        "#D4AF37",
  goldLight:   "#FFE082",
  text:        "#FFF7E6",
  textMuted:   "rgba(255,247,230,0.55)",
  green:       "#4ADE80",
};

// ─── WaitingView ──────────────────────────────────────────────────────────────
function WaitingView() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makeDot = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1, duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0, duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

    const glowAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1, duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0, duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const d1 = makeDot(dot1, 0);
    const d2 = makeDot(dot2, 200);
    const d3 = makeDot(dot3, 400);
    d1.start(); d2.start(); d3.start(); glowAnim.start();

    return () => { d1.stop(); d2.stop(); d3.stop(); glowAnim.stop(); };
  }, [dot1, dot2, dot3, glow]);

  const dotStyle = (anim) => ({
    transform: [{ scale: anim.interpolate({ inputRange: [0,1], outputRange: [1, 1.7] }) }],
    opacity:   anim.interpolate({ inputRange: [0,1], outputRange: [0.35, 1] }),
  });

  const glowOpacity = glow.interpolate({ inputRange: [0,1], outputRange: [0.4, 1] });

  return (
    <View style={styles.waitingWrapper}>

      {/* Icône pulsante */}
      <Animated.View style={[styles.iconRing, { opacity: glowOpacity }]}>
        <LinearGradient
          colors={[C.primary, "#B71C1C"]}
          style={styles.iconGradient}
        >
          <Text style={styles.iconEmoji}>🎲</Text>
        </LinearGradient>
      </Animated.View>

      {/* Titre */}
      <Text style={styles.waitingTitle}>Recherche d'adversaire</Text>

      {/* Dots */}
      <View style={styles.dotsRow}>
        <Animated.View style={[styles.dot, dotStyle(dot1)]} />
        <Animated.View style={[styles.dot, dotStyle(dot2)]} />
        <Animated.View style={[styles.dot, dotStyle(dot3)]} />
      </View>

      {/* Sous-label */}
      <Text style={styles.waitingSubtitle}>En file d'attente...</Text>

      {/* Badges */}
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <View style={styles.liveDot} />
          <Text style={styles.badgeText}>En ligne</Text>
        </View>
        <View style={[styles.badge, styles.badgeGold]}>
          <Ionicons name="trophy-outline" size={11} color={C.gold} />
          <Text style={[styles.badgeText, { color: C.gold }]}>Classé</Text>
        </View>
      </View>

    </View>
  );
}

// ─── GameFoundView ────────────────────────────────────────────────────────────
function GameFoundView({ idOpponent }) {
  return (
    <View style={styles.gameFoundWrapper}>
      <LinearGradient
        colors={[C.primary, "#B71C1C"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.gameFoundBanner}
      >
        <Ionicons name="flash" size={16} color={C.goldLight} />
        <Text style={styles.gameFoundBannerText}>Adversaire trouve !</Text>
        <Ionicons name="flash" size={16} color={C.goldLight} />
      </LinearGradient>

      <View style={styles.vsRow}>
        <View style={styles.playerChip}>
          <Ionicons name="person" size={14} color={C.text} />
          <Text style={styles.playerChipText}>Vous</Text>
        </View>
        <View style={styles.vsBadge}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        <View style={[styles.playerChip, styles.playerChipOpponent]}>
          <Ionicons name="person" size={14} color={C.goldLight} />
          <Text style={[styles.playerChipText, { color: C.goldLight }]}> 
            {idOpponent?.slice(0, 8)}...
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Controller ───────────────────────────────────────────────────────────────
export default function OnlineGameController({
  onOpponentLeft = null,
  onGameEnd = null,
  joinEvent = "queue.join",
  waitingStatusMessage = "Veuillez patienter, un adversaire va se connecter...",
  hideWaitingUi = false,
  displayGameFoundSplash = false,
}) {
  const socket = useContext(SocketContext);

  const [inQueue,        setInQueue]        = useState(false);
  const [inGame,         setInGame]         = useState(false);
  const [idOpponent,     setIdOpponent]     = useState(null);
  const [statusMessage,  setStatusMessage]  = useState(waitingStatusMessage);

  useEffect(() => {
    const onQueueAdded = (data) => {
      const queueState = hideWaitingUi ? false : (data?.inQueue ?? true);
      setInQueue(queueState);
      setInGame(data["inGame"]);
      setStatusMessage("Veuillez patienter, un adversaire va se connecter...");
    };
    const onGameStart = (data) => {
      setInQueue(data["inQueue"]);
      setInGame(data["inGame"]);
      setIdOpponent(data["idOpponent"]);
      setStatusMessage("Adversaire trouve !");
    };
    const handleOpponentLeft = () => { if (onOpponentLeft) onOpponentLeft(); };
    const handleGameEnd = (data) => {
      setInQueue(false); setInGame(false); setIdOpponent(null);
      setStatusMessage("Partie terminee.");
      if (onGameEnd) onGameEnd(data);
    };

    socket.on("queue.added",         onQueueAdded);
    socket.on("game.start",          onGameStart);
    socket.on("game.opponent.left",  handleOpponentLeft);
    socket.on("game.end",            handleGameEnd);

    socket.emit(joinEvent);
    // Show waiting state immediately in online mode while server confirms queue status.
    setInQueue(!hideWaitingUi && joinEvent === "queue.join");
    setInGame(false);
    setStatusMessage("Veuillez patienter, un adversaire va se connecter...");

    return () => {
      socket.off("queue.added",        onQueueAdded);
      socket.off("game.start",         onGameStart);
      socket.off("game.opponent.left", handleOpponentLeft);
      socket.off("game.end",           handleGameEnd);
    };
  }, [socket, onOpponentLeft, onGameEnd, joinEvent, waitingStatusMessage, hideWaitingUi, displayGameFoundSplash]);

  return (
    <View style={styles.container}>

      {/* ── Etat courant (connexion / attente) ── */}
      {!inGame && (
        <View style={styles.statusChip}>
          <Ionicons name="sync-outline" size={13} color={C.textMuted} style={{ marginRight: 6 }} />
          <Text style={styles.statusChipText}>{statusMessage}</Text>
        </View>
      )}

      {/* ── File d'attente ── */}
      {!hideWaitingUi && inQueue && !inGame && <WaitingView />}

      {/* ── Partie trouvee ── */}
      {inGame && (
        <View style={styles.boardWrapper}>
          {displayGameFoundSplash && <GameFoundView idOpponent={idOpponent} />}
          <Board />
        </View>
      )}

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    paddingTop: 10,
  },

  // ── Status chip ──────────────────────────────────────────────────────────
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(122,17,17,0.25)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.35)",
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  statusChipText: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },

  // ── Waiting ───────────────────────────────────────────────────────────────
  waitingWrapper: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 14,
  },
  boardWrapper: {
    flex: 1,
    width: "100%",
    position: "relative",
  },
  iconRing: {
    borderRadius: 999,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 12,
    marginBottom: 6,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.gold,
  },
  iconEmoji: {
    fontSize: 32,
  },
  waitingTitle: {
    color: C.text,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: C.gold,
  },
  waitingSubtitle: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },

  // ── Badges ────────────────────────────────────────────────────────────────
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: "rgba(122,17,17,0.3)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
  },
  badgeGold: {
    backgroundColor: "rgba(212,175,55,0.08)",
    borderColor: "rgba(212,175,55,0.4)",
  },
  liveDot: {
    width: 7, height: 7,
    borderRadius: 4,
    backgroundColor: C.green,
  },
  badgeText: {
    color: C.text,
    fontSize: 11,
    fontWeight: "700",
  },

  // ── Partie trouvee ─────────────────────────────────────────────────────
  gameFoundWrapper: {
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
    width: "100%",
    paddingHorizontal: 16,
  },
  gameFoundBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.gold,
  },
  gameFoundBannerText: {
    color: C.goldLight,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.4,
  },

  // ── VS row ────────────────────────────────────────────────────────────────
  vsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(122,17,17,0.4)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
  },
  playerChipOpponent: {
    backgroundColor: "rgba(42,95,53,0.4)",
    borderColor: "rgba(255,224,130,0.3)",
  },
  playerChipText: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  vsBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.primary,
    borderWidth: 2,
    borderColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  vsText: {
    color: C.goldLight,
    fontSize: 11,
    fontWeight: "900",
  },
});

OnlineGameController.propTypes = {
  onOpponentLeft: PropTypes.func,
  onGameEnd:      PropTypes.func,
  joinEvent:      PropTypes.string,
  waitingStatusMessage: PropTypes.string,
  hideWaitingUi: PropTypes.bool,
  displayGameFoundSplash: PropTypes.bool,
};
GameFoundView.propTypes = {
  idOpponent: PropTypes.string,
};
GameFoundView.defaultProps = {
  idOpponent: "???",
};
