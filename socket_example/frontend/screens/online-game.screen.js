// app/screens/online-game.screen.js

import React, { useContext, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Alert, Animated, Platform, StyleSheet, View, Text, Pressable, Modal, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SocketContext } from "../contexts/socket.context";
import OnlineGameController from "../controllers/online-game.controller";

export default function OnlineGameScreen({ navigation, route }) {
  const socket = useContext(SocketContext);
  const [rulesModalVisible, setRulesModalVisible] = useState(false);
  const [gameEndData, setGameEndData] = useState(null);
  const endCardOpacity = useRef(new Animated.Value(0)).current;
  const endCardScale = useRef(new Animated.Value(0.92)).current;
  const endActionTranslateY = useRef(new Animated.Value(18)).current;
  const endActionOpacity = useRef(new Animated.Value(0)).current;
  const playerName = route?.params?.playerName || route?.params?.displayName || 'Joueur';
  const isAuthenticated = route?.params?.isAuthenticated === true;
  const userId = route?.params?.user?.id;
  const clientSessionId = useRef(route?.params?.clientSessionId || `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`).current;
  const homeRouteParams = {
    userMode: route?.params?.userMode || (isAuthenticated ? 'connected' : 'guest'),
    displayName: route?.params?.displayName || (isAuthenticated ? playerName : undefined),
    user: route?.params?.user,
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

  const quitAfterGameEnd = () => {
    setGameEndData(null);
    leaveGame();
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
    setGameEndData(data ?? {});
  };

  useEffect(() => {
    const previewOutcome = route?.params?.previewGameEndOutcome;
    if (!previewOutcome) {
      return;
    }

    const previewPresets = {
      win: {
        winner: "player:1",
        isWinner: true,
        reason: "five-aligned",
        playerScore: 9,
        opponentScore: 4,
      },
      lose: {
        winner: "player:2",
        isWinner: false,
        reason: "no-pawns-left",
        playerScore: 3,
        opponentScore: 7,
      },
      draw: {
        winner: "draw",
        isWinner: false,
        reason: null,
        playerScore: 6,
        opponentScore: 6,
      },
    };

    setGameEndData(previewPresets[previewOutcome] || previewPresets.win);
  }, [route?.params?.previewGameEndOutcome]);

  useEffect(() => {
    if (gameEndData === null) {
      return;
    }

    endCardOpacity.setValue(0);
    endCardScale.setValue(0.92);
    endActionTranslateY.setValue(18);
    endActionOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(endCardOpacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.spring(endCardScale, {
        toValue: 1,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(110),
        Animated.parallel([
          Animated.timing(endActionTranslateY, {
            toValue: 0,
            duration: 210,
            useNativeDriver: true,
          }),
          Animated.timing(endActionOpacity, {
            toValue: 1,
            duration: 210,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [
    endActionOpacity,
    endActionTranslateY,
    endCardOpacity,
    endCardScale,
    gameEndData,
  ]);

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

            <View style={styles.headerRight}>
              {/* Bouton règles */}
              <Pressable
                style={({ pressed }) => [
                  styles.rulesBtn,
                  pressed && { opacity: 0.75 },
                ]}
                onPress={() => setRulesModalVisible(true)}
                android_ripple={{ color: "rgba(168, 85, 247, 0.3)" }}
              >
                <Ionicons name="book-outline" size={18} color={C.primary} />
              </Pressable>

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
          </View>

          {/* ── Badges ── */}
          {/* <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>Match actif</Text>
            </View>
            <View style={[styles.badge, styles.badgeGold]}>
              <Text style={styles.badgeText}>⭐ Classement en jeu</Text>
            </View>
          </View> */}

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
              localPlayerUserId={isAuthenticated ? userId : null}
              localPlayerSessionId={clientSessionId}
            />
          </View>

        </View>
      )}

      {/* ── Modal Fin de partie ── */}
      {gameEndData !== null && (() => {
        const isDraw   = gameEndData?.winner === "draw";
        const isWinner = !isDraw && gameEndData?.isWinner;
        const isLoser  = !isDraw && !isWinner;

        const icon   = isDraw ? "remove-circle-outline" : isWinner ? "trophy"        : "skull-outline";
        const accent = isDraw ? C.textMuted             : isWinner ? C.gold          : C.pink;
        const gradColors = isDraw
          ? ["#1A1654", "#232060", "#1A1654"]
          : isWinner
          ? ["#1C1500", "#2E2000", "#1C1500"]
          : ["#1A0A1A", "#280D1A", "#1A0A1A"];

        const title   = isDraw ? "Match nul"  : isWinner ? "Victoire !"  : "Défaite";
        const subtitle = isDraw
          ? "Les deux joueurs sont à égalité."
          : isWinner
          ? "Félicitations, tu as dominé cette partie !"
          : "Ne baisse pas les bras, la revanche t'attend.";

        const reason =
          gameEndData?.reason === "five-aligned"   ? "5 pions alignés"          :
          gameEndData?.reason === "no-pawns-left"  ? "Plus de pions disponibles" : null;

        const playerScore   = gameEndData?.playerScore   ?? 0;
        const opponentScore = gameEndData?.opponentScore ?? 0;

        return (
          <Modal visible animationType="fade" transparent statusBarTranslucent>
            <View style={styles.endOverlay}>
              <LinearGradient
                colors={["rgba(15,10,30,0.92)", "rgba(10,6,22,0.97)"]}
                style={StyleSheet.absoluteFill}
              />

              {/* Orbe décoratif */}
              <View style={[styles.endOrb, { backgroundColor: accent, opacity: 0.18 }]} />

              <Animated.View
                style={[
                  styles.endCard,
                  {
                    opacity: endCardOpacity,
                    transform: [{ scale: endCardScale }],
                  },
                ]}
              >
                {/* Barre colorée */}
                <LinearGradient
                  colors={isDraw ? [C.textMuted, C.border] : isWinner ? [C.gold, "#F59E0B"] : [C.pink, C.primaryDark]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.endTopBar}
                />

                {/* Fond de la carte */}
                <LinearGradient colors={gradColors} style={styles.endCardInner}>

                  {/* Icône */}
                  <View style={[styles.endIconRing, { borderColor: accent }]}>
                    <Ionicons name={icon} size={48} color={accent} />
                  </View>

                  {/* Titre */}
                  <Text style={[styles.endTitle, { color: accent }]}>{title}</Text>
                  <Text style={styles.endSubtitle}>{subtitle}</Text>

                  {/* Raison */}
                  {reason && (
                    <View style={[styles.endReasonBadge, { borderColor: accent }]}>
                      <Ionicons name="flag-outline" size={13} color={accent} style={{ marginRight: 5 }} />
                      <Text style={[styles.endReasonText, { color: accent }]}>{reason}</Text>
                    </View>
                  )}

                  {/* Scores */}
                  <View style={styles.endScoreRow}>
                    <View style={styles.endScoreBox}>
                      <Text style={styles.endScoreLabel}>Ton score</Text>
                      <Text style={[styles.endScoreValue, { color: isWinner ? C.gold : C.textPrimary }]}>
                        {playerScore}
                      </Text>
                    </View>
                    <View style={styles.endScoreDivider} />
                    <View style={styles.endScoreBox}>
                      <Text style={styles.endScoreLabel}>Adversaire</Text>
                      <Text style={[styles.endScoreValue, { color: isLoser ? C.pink : C.textPrimary }]}>
                        {opponentScore}
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <Animated.View
                    style={{
                      width: "100%",
                      opacity: endActionOpacity,
                      transform: [{ translateY: endActionTranslateY }],
                    }}
                  >
                    <Pressable
                      style={({ pressed }) => [styles.endBtn, pressed && { opacity: 0.75 }]}
                      onPress={quitAfterGameEnd}
                      android_ripple={{ color: "rgba(168,85,247,0.3)" }}
                    >
                      <LinearGradient
                        colors={[C.primaryDark, C.primary]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.endBtnGradient}
                      >
                        <Ionicons name="exit-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.endBtnText}>Quitter</Text>
                      </LinearGradient>
                    </Pressable>
                  </Animated.View>

                </LinearGradient>
              </Animated.View>
            </View>
          </Modal>
        );
      })()}

      {/* ── Modal Règles ── */}
      <Modal
        visible={rulesModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setRulesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* ── En-tête modal ── */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Règles du Jeu</Text>
              <Pressable
                onPress={() => setRulesModalVisible(false)}
                android_ripple={{ color: "rgba(236, 72, 153, 0.3)" }}
              >
                <Ionicons name="close" size={24} color={C.pink} />
              </Pressable>
            </View>

            {/* ── Contenu scrollable ── */}
            <ScrollView style={styles.rulesScrollView} showsVerticalScrollIndicator={true}>
              {/* Section But du jeu */}
              <View style={styles.ruleSection}>
                <Text style={styles.ruleTitle}>🎯 But du jeu</Text>
                <Text style={styles.ruleText}>
                  Marquer plus de points que son adversaire, ou réaliser un alignement horizontal, vertical ou en diagonale de cinq pions.
                </Text>
              </View>

              {/* Section Déroulement */}
              <View style={styles.ruleSection}>
                <Text style={styles.ruleTitle}>🎲 Déroulement du jeu</Text>
                <Text style={styles.ruleText}>
                  À votre tour, vous pouvez lancer les dés à trois reprises pour réaliser une combinaison. Après chaque lancer, vous pouvez écarter des dés et relancer les autres.
                </Text>
              </View>

              {/* Section Combinaisons */}
              <View style={styles.ruleSection}>
                <Text style={styles.ruleTitle}>🃏 Combinaisons possibles</Text>
                <Text style={styles.ruleBullet}>• <Text style={styles.ruleBulletLabel}>Brelan</Text> : trois dés identiques</Text>
                <Text style={styles.ruleBullet}>• <Text style={styles.ruleBulletLabel}>Full</Text> : un brelan et une paire</Text>
                <Text style={styles.ruleBullet}>• <Text style={styles.ruleBulletLabel}>Carré</Text> : quatre dés identiques</Text>
                <Text style={styles.ruleBullet}>• <Text style={styles.ruleBulletLabel}>Yam</Text> : cinq dés identiques</Text>
                <Text style={styles.ruleBullet}>• <Text style={styles.ruleBulletLabel}>Suite</Text> : 1-2-3-4-5 ou 2-3-4-5-6</Text>
                <Text style={styles.ruleBullet}>• <Text style={styles.ruleBulletLabel}>≤8</Text> : somme des dés ≤ 8</Text>
                <Text style={styles.ruleBullet}>• <Text style={styles.ruleBulletLabel}>Sec</Text> : une combinaison au premier lancer</Text>
                <Text style={styles.ruleBullet}>• <Text style={styles.ruleBulletLabel}>Défi</Text> : relever un défi avant le 2e lancer</Text>
              </View>

              {/* Section Placement des pions */}
              <View style={styles.ruleSection}>
                <Text style={styles.ruleTitle}>♟️ Placement des pions</Text>
                <Text style={styles.ruleText}>
                  Dès qu'une combinaison réussit, vous pouvez placer un pion sur une case libellée correspondant à votre combinaison.
                </Text>
              </View>

              {/* Section Yam Predator */}
              <View style={styles.ruleSection}>
                <Text style={styles.ruleTitle}>⚔️ Yam Predator</Text>
                <Text style={styles.ruleText}>
                  Réaliser un Yam (cinq dés identiques) vous permet de retirer n'importe quel pion adverse au lieu de placer un des vôtres.
                </Text>
              </View>

              {/* Section Points */}
              <View style={styles.ruleSection}>
                <Text style={styles.ruleTitle}>⭐ Décompte des points</Text>
                <Text style={styles.ruleBullet}>• <Text style={styles.ruleBulletLabel}>Alignement de 3 pions</Text> : 1 point</Text>
                <Text style={styles.ruleBullet}>• <Text style={styles.ruleBulletLabel}>Alignement de 4 pions</Text> : 2 points</Text>
                <Text style={styles.ruleBullet}>• <Text style={styles.ruleBulletLabel}>Alignement de 5 pions</Text> : Victoire instantanée</Text>
              </View>

              {/* Section Fin de partie */}
              <View style={styles.ruleSection}>
                <Text style={styles.ruleTitle}>🏁 Fin de partie</Text>
                <Text style={styles.ruleText}>
                  La partie s'achève quand un joueur n'a plus de pions (gagnant : celui avec le plus de points) ou quand un joueur réalise un alignement de cinq pions (victoire instantanée).
                </Text>
              </View>

              <View style={styles.rulesFooter} />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
      user: PropTypes.shape({
        id: PropTypes.string,
      }),
      userMode: PropTypes.string,
      refreshToken: PropTypes.string,
      isAuthenticated: PropTypes.bool,
      clientSessionId: PropTypes.string,
      previewGameEndOutcome: PropTypes.oneOf(["win", "lose", "draw"]),
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
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    flex: 1,
    maxHeight: "100%",
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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

  // Bouton règles
  rulesBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.primary,
    backgroundColor: "rgba(168, 85, 247, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,               // touch target ✓
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
    flex: 1,
    minHeight: 0,
    marginHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "rgba(15, 10, 30, 0.6)",
    overflow: "hidden",
    padding: 8,
    marginBottom: 12,
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

  // ── Modal Règles ──────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalContent: {
    width: "100%",
    maxWidth: 480,
    maxHeight: "85%",
    borderRadius: 28,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: "rgba(168, 85, 247, 0.1)",
  },
  modalTitle: {
    color: C.textPrimary,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  rulesScrollView: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  ruleSection: {
    marginBottom: 20,
  },
  ruleTitle: {
    color: C.gold,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  ruleText: {
    color: C.textMuted,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 21,
  },
  ruleBullet: {
    color: C.textMuted,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 22,
    marginBottom: 4,
    marginLeft: 4,
  },
  ruleBulletLabel: {
    color: C.primary,
    fontWeight: "700",
  },
  rulesFooter: {
    height: 16,
  },

  // ── Modal Fin de partie ───────────────────────────────────────────────────
  endOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  endOrb: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 999,
    top: "25%",
    alignSelf: "center",
  },
  endCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 24,
  },
  endTopBar: {
    height: 5,
    width: "100%",
  },
  endCardInner: {
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 28,
  },
  endIconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  endTitle: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  endSubtitle: {
    color: C.textMuted,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  endReasonBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 14,
    marginBottom: 24,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  endReasonText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  endScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "rgba(255,255,255,0.03)",
    marginBottom: 28,
    overflow: "hidden",
  },
  endScoreBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
  },
  endScoreDivider: {
    width: 1,
    height: "70%",
    backgroundColor: C.border,
  },
  endScoreLabel: {
    color: C.textFaint,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  endScoreValue: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  endBtn: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 52,
  },
  endBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 24,
    minHeight: 52,
  },
  endBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
});
