// app/screens/online-game.screen.js

import React, { useContext, useRef } from "react";
import PropTypes from "prop-types";
import { Alert, Platform, StyleSheet, View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SocketContext } from "../contexts/socket.context";
import OnlineGameController from "../controllers/online-game.controller";

export default function OnlineGameScreen({ navigation, route }) {
  const socket = useContext(SocketContext);
  const playerName = route?.params?.playerName || route?.params?.displayName || 'Joueur';
  const isAuthenticated = route?.params?.isAuthenticated === true;
  const clientSessionId = useRef(route?.params?.clientSessionId || `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`).current;
  const homeRouteParams = {
    userMode: route?.params?.userMode || (isAuthenticated ? 'connected' : 'guest'),
    displayName: route?.params?.displayName || (isAuthenticated ? playerName : undefined),
    refreshToken: route?.params?.refreshToken,
    isAuthenticated,
    clientSessionId,
  };

  const navigateHome = () => {
    navigation.navigate("HomeScreen", homeRouteParams);
  };

  const leaveGame = () => {
    socket.emit("game.leave");
    navigateHome();
  };

  const handleOpponentLeft = () => {
    if (Platform.OS === "web") {
      globalThis.alert("Votre adversaire s'est déconnecté ou a perdu la session.");
      navigateHome();
    } else {
      Alert.alert(
        "Partie interrompue",
        "Votre adversaire s'est déconnecté ou a perdu la session.",
        [{ text: "OK", onPress: navigateHome }]
      );
    }
  };

  const handleGameEnd = (data) => {
    let winnerLabel = "Partie terminée";
    if (data?.winner === "draw") {
      winnerLabel = "Match nul 🤝";
    } else {
      winnerLabel = data?.isWinner ? "Victoire ! 🏆" : "Défaite 😤";
    }

    const reasonLabel =
      data?.reason === "five-aligned"
        ? "5 pions alignés !"
        : data?.reason === "no-pawns-left"
        ? "Plus de pions disponibles"
        : "";

    const message = [
      winnerLabel,
      reasonLabel,
      `Ton score : ${data?.playerScore ?? 0}`,
      `Score adverse : ${data?.opponentScore ?? 0}`,
    ]
      .filter(Boolean)
      .join("\n");

    if (Platform.OS === "web") {
      globalThis.alert(message);
      navigateHome();
      return;
    }

    Alert.alert("Fin de partie", message, [
      { text: "OK", onPress: navigateHome },
    ]);
  };

  const confirmLeaveGame = () => {
    if (Platform.OS === "web" && typeof globalThis.confirm === "function") {
      const shouldLeave = globalThis.confirm("Veux-tu vraiment quitter la partie en cours ?");
      if (shouldLeave) leaveGame();
      return;
    }

    Alert.alert(
      "Quitter la partie",
      "Veux-tu vraiment quitter la partie en cours ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Quitter", style: "destructive", onPress: leaveGame },
      ]
    );
  };

  return (
    <LinearGradient
      colors={["#0F0A1E", "#1A1035", "#0D0820"]}
      style={styles.container}
    >
      {/* ── Orbes glow ── */}
      <View style={[styles.orb, styles.orbTopLeft]} />
      <View style={[styles.orb, styles.orbTopRight]} />
      <View style={[styles.orb, styles.orbBottomCenter]} />

      {/* ── État : pas de socket ── */}
      {!socket && (
        <View style={styles.statusCard}>
          <LinearGradient
            colors={["#A855F7", "#EC4899", "#FBBF24"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardTopBar}
          />

          <View style={styles.statusIconWrapper}>
            <Ionicons name="wifi-outline" size={40} color="#EC4899" />
          </View>

          <Text style={styles.statusTitle}>Connexion perdue</Text>
          <Text style={styles.paragraph}>
            Impossible de joindre le serveur.
          </Text>
          <Text style={styles.footnote}>
            Relance l'application et attends que le serveur soit de retour.
          </Text>

          <Pressable
            style={styles.btnSecondary}
            onPress={navigateHome}
            android_ripple={{ color: "rgba(168, 85, 247, 0.2)" }}
          >
            <LinearGradient
              colors={["#1E1654", "#16103A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnGradient}
            >
              <Ionicons name="home-outline" size={16} color={C.primary} style={styles.btnIcon} />
              <Text style={[styles.btnText, { color: C.primary }]}>Retour à l'accueil</Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}

      {/* ── État : socket OK ── */}
      {socket && (
        <View style={styles.contentCard}>

          {/* Barre arc-en-ciel */}
          <LinearGradient
            colors={["#A855F7", "#EC4899", "#FBBF24"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardTopBar}
          />

          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="dice" size={26} color={C.gold} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.pageTitle}>Partie en ligne</Text>
                <Text style={styles.pageSubtitle}>Reste concentré, la chance tourne vite</Text>
              </View>
            </View>

            {/* Bouton quitter */}
            <Pressable
              style={({ pressed }) => [
                styles.leaveBtn,
                pressed && { opacity: 0.75 },
              ]}
              onPress={confirmLeaveGame}
              android_ripple={{ color: "rgba(236, 72, 153, 0.3)" }}
            >
              <Ionicons name="exit-outline" size={18} color={C.pink} />
              <Text style={styles.leaveBtnText}>Quitter</Text>
            </Pressable>
          </View>

          {/* ── Badges ── */}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>Match actif</Text>
            </View>
            <View style={[styles.badge, styles.badgeGold]}>
              <Text style={styles.badgeText}>⭐ Classement en jeu</Text>
            </View>
          </View>

          {/* ── Séparateur ── */}
          <LinearGradient
            colors={["transparent", C.border, "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.separator}
          />

          {/* ── Zone contrôleur ── */}
          <View style={styles.controllerWrapper}>
            <OnlineGameController
              onOpponentLeft={handleOpponentLeft}
              onGameEnd={handleGameEnd}
              localPlayerName={playerName}
              localPlayerIsAuthenticated={isAuthenticated}
              localPlayerSessionId={clientSessionId}
            />
          </View>

        </View>
      )}
    </LinearGradient>
  );
}

OnlineGameScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      playerName: PropTypes.string,
      displayName: PropTypes.string,
      userMode: PropTypes.string,
      refreshToken: PropTypes.string,
      isAuthenticated: PropTypes.bool,
      clientSessionId: PropTypes.string,
    }),
  }),
};

OnlineGameScreen.defaultProps = {
  route: undefined,
};

// ─── Design Tokens (identiques à start.screen) ────────────────────────────────
const C = {
  bg:           "#0F0A1E",
  surface:      "#16103A",
  surfaceLight: "#1E1654",
  border:       "#3B2F6B",
  primary:      "#A855F7",
  primaryDark:  "#7C3AED",
  pink:         "#EC4899",
  gold:         "#FBBF24",
  textPrimary:  "#F5F3FF",
  textMuted:    "#A78BFA",
  textFaint:    "#4B3F8A",
};

const styles = StyleSheet.create({

  // 🌌 Fond
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  // 🔮 Orbes
  orb: {
    position: "absolute",
    borderRadius: 999,
  },
  orbTopLeft: {
    width: 200,
    height: 200,
    top: -60,
    left: -70,
    backgroundColor: C.primaryDark,
    opacity: 0.3,
  },
  orbTopRight: {
    width: 130,
    height: 130,
    top: 60,
    right: -40,
    backgroundColor: C.pink,
    opacity: 0.25,
  },
  orbBottomCenter: {
    width: 240,
    height: 240,
    bottom: -80,
    alignSelf: "center",
    backgroundColor: "#2563EB",
    opacity: 0.18,
  },

  // Barre arc-en-ciel
  cardTopBar: {
    height: 4,
    width: "100%",
    marginBottom: 20,
  },

  // ── Carte hors-ligne ──────────────────────────────────────────────────────
  statusCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 28,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    paddingBottom: 28,
    alignItems: "center",
    shadowColor: C.pink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 14,
    overflow: "hidden",
  },
  statusIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.surfaceLight,
    borderWidth: 1,
    borderColor: C.pink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  statusTitle: {
    color: C.textPrimary,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 10,
    textAlign: "center",
    paddingHorizontal: 22,
  },
  paragraph: {
    color: C.textMuted,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    paddingHorizontal: 22,
  },
  footnote: {
    color: C.textFaint,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 22,
  },

  // ── Carte principale ──────────────────────────────────────────────────────
  contentCard: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 28,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    paddingBottom: 22,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 18,
    overflow: "hidden",
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pageTitle: {
    color: C.textPrimary,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  pageSubtitle: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  // Bouton quitter
  leaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.pink,
    backgroundColor: "rgba(236, 72, 153, 0.1)",
    minHeight: 44,               // touch target ✓
  },
  leaveBtnText: {
    color: C.pink,
    fontSize: 13,
    fontWeight: "700",
  },

  // ── Badges ────────────────────────────────────────────────────────────────
  badgeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: 16,
    flexWrap: "wrap",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.surfaceLight,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.primary,
  },
  badgeGold: {
    borderColor: C.gold,
    backgroundColor: "#1C1500",
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4ADE80",  // vert "live"
  },
  badgeText: {
    color: C.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },

  // ── Séparateur ────────────────────────────────────────────────────────────
  separator: {
    height: 1,
    marginHorizontal: 16,
    marginBottom: 16,
  },

  // ── Zone contrôleur ───────────────────────────────────────────────────────
  controllerWrapper: {
    marginHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "rgba(15, 10, 30, 0.6)",
    overflow: "hidden",
    padding: 8,
  },

  // ── Boutons réutilisables ─────────────────────────────────────────────────
  btnSecondary: {
    marginHorizontal: 22,
    width: "80%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.border,
    minHeight: 52,               // touch target ✓
  },
  btnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 52,
  },
  btnIcon: {
    marginRight: 10,
  },
  btnText: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
