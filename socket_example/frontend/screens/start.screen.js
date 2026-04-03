// app/screens/start.screen.js

import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View, Text, Pressable, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function StartScreen({ navigation }) {
  const handleGuestMode = () => {
    navigation.navigate("HomeScreen", { userMode: "guest" });
  };

  const handleAuthenticationMode = () => {
    navigation.navigate("LoginScreen", { initialMode: 'login' });
  };

  const handleRegisterMode = () => {
    navigation.navigate("LoginScreen", { initialMode: 'register' });
  };

  return (
    <>
      <StatusBar barStyle="light-content" />

      {/* ── Fond global ── */}
      <LinearGradient
        colors={["#0F0A1E", "#1A1035", "#0D0820"]}
        style={styles.container}
      >
        {/* ── Orbes glow ambiant ── */}
        <View style={[styles.orb, styles.orbTopLeft]} />
        <View style={[styles.orb, styles.orbTopRight]} />
        <View style={[styles.orb, styles.orbBottomCenter]} />

        {/* ── Carte principale ── */}
        <View style={styles.card}>

          {/* Barre arc-en-ciel */}
          <LinearGradient
            colors={["#A855F7", "#EC4899", "#FBBF24"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardTopBar}
          />

          {/* ── Logo ── */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoYam}>YAM</Text>
            <Text style={styles.logoMaster}>MASTER</Text>
            <View style={styles.logoDice}>
              <Ionicons name="dice" size={32} color="#FBBF24" />
            </View>
          </View>

          {/* Ligne déco sous le logo */}
          <LinearGradient
            colors={["transparent", "#A855F7", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoUnderline}
          />

          <Text style={styles.subtitle}>
            Chance · Combos · Défis en direct
          </Text>

          {/* ── Badges ── */}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🃏 Mode rapide</Text>
            </View>
            <View style={[styles.badge, styles.badgeGold]}>
              <Text style={styles.badgeText}>⭐ Classement live</Text>
            </View>
          </View>

          {/* ── Séparateur ── */}
          <View style={styles.separator} />

          {/* ── Boutons ── */}
          <View style={styles.buttonContainer}>

            {/* Jouer en invité — CTA principal */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleGuestMode}
              android_ripple={{ color: "rgba(168, 85, 247, 0.3)" }}
            >
              <LinearGradient
                colors={["#A855F7", "#7C3AED"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <View style={styles.buttonInner}>
                  <Ionicons name="play-circle" size={22} color="#fff" style={styles.btnIcon} />
                  <View>
                    <Text style={styles.buttonText}>JOUER EN INVITÉ</Text>
                    <Text style={styles.buttonSubtext}>Sans compte · Sans engagement</Text>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>

            {/* Se connecter — CTA secondaire */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonOutline,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleAuthenticationMode}
              android_ripple={{ color: "rgba(168, 85, 247, 0.2)" }}
            >
              <LinearGradient
                colors={["#1E1654", "#16103A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <View style={styles.buttonInner}>
                  <Ionicons name="person-circle" size={22} color="#A855F7" style={styles.btnIcon} />
                  <View>
                    <Text style={[styles.buttonText, styles.buttonTextOutline]}>
                      SE CONNECTER
                    </Text>
                    <Text style={styles.buttonSubtext}>
                      Stats · Historique · Classement
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
          </View>

          {/* ── Lien créer un compte ── */}
          <Pressable onPress={handleRegisterMode}>
            <Text style={styles.createAccountLink}>
              Pas encore de compte ?{" "}
              <Text style={styles.createAccountLinkBold}>S'inscrire</Text>
            </Text>
          </Pressable>

          {/* ── Footer ── */}
          <View style={styles.footerRow}>
            <View style={styles.footerDot} />
            <Text style={styles.footerText}>Rejoins la communauté Yam Master</Text>
            <View style={styles.footerDot} />
          </View>

        </View>
      </LinearGradient>
    </>
  );
}

StartScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

// ─── Design Tokens ────────────────────────────────────────────────────────────
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
    paddingHorizontal: 20,
  },

  // 🔮 Orbes décoratives
  orb: {
    position: "absolute",
    borderRadius: 999,
  },
  orbTopLeft: {
    width: 200,
    height: 200,
    top: -60,
    left: -70,
    backgroundColor: "#7C3AED",
    opacity: 0.3,
  },
  orbTopRight: {
    width: 130,
    height: 130,
    top: 60,
    right: -40,
    backgroundColor: "#EC4899",
    opacity: 0.25,
  },
  orbBottomCenter: {
    width: 240,
    height: 240,
    bottom: -80,
    alignSelf: "center",
    backgroundColor: "#2563EB",
    opacity: 0.2,
  },

  // 🃏 Carte
  card: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 28,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    paddingBottom: 28,
    paddingHorizontal: 22,
    alignItems: "center",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 18,
    overflow: "hidden",
  },

  // Barre arc-en-ciel
  cardTopBar: {
    height: 4,
    width: "100%",
    marginBottom: 28,
  },

  // 🎲 Logo
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  logoYam: {
    fontSize: 42,
    fontWeight: "900",
    color: C.textPrimary,
    letterSpacing: 3,
    marginRight: 2,
  },
  logoMaster: {
    fontSize: 42,
    fontWeight: "900",
    color: C.primary,
    letterSpacing: 3,
    marginRight: 6,
  },
  logoDice: {
    marginLeft: 4,
    transform: [{ rotate: "15deg" }],
  },
  logoUnderline: {
    height: 2,
    width: "70%",
    borderRadius: 2,
    marginBottom: 16,
  },

  // Textes
  subtitle: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 20,
  },

  // 🏷️ Badges
  badgeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  badge: {
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
  badgeText: {
    color: C.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },

  // Séparateur
  separator: {
    height: 1,
    width: "100%",
    backgroundColor: C.border,
    marginBottom: 22,
  },

  // 🎮 Boutons
  buttonContainer: {
    width: "100%",
    gap: 14,
    marginBottom: 16,
  },
  button: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOpacity: 0.3,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 64,              // touch target ≥ 44px ✓
    justifyContent: "center",
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnIcon: {
    marginRight: 14,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  buttonTextOutline: {
    color: C.primary,
  },
  buttonSubtext: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontWeight: "500",
  },

  // Lien inscription
  createAccountLink: {
    color: C.textFaint,
    fontSize: 13,
    marginBottom: 18,
  },
  createAccountLinkBold: {
    color: C.textMuted,
    fontWeight: "800",
    textDecorationLine: "underline",
  },

  // Footer
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.primary,
    opacity: 0.6,
  },
  footerText: {
    color: C.textFaint,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
});
