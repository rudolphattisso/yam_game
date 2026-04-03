import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { StyleSheet, View, Text, TouchableOpacity, Pressable } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { buildClientSessionId, clearAuthSession } from '../utils/auth-session.storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL
  || process.env.EXPO_PUBLIC_SOCKET_URL
  || 'http://localhost:3000';

export default function HomeScreen({ navigation, route }) {
  const [isOnlineHovered, setIsOnlineHovered] = useState(false);
  const [isBotHovered, setIsBotHovered] = useState(false);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const clientSessionIdRef = useRef(route?.params?.clientSessionId || buildClientSessionId());
  const userMode = route?.params?.userMode;
  const displayName = route?.params?.displayName;
  const refreshToken = route?.params?.refreshToken;
  const isConnected = route?.params?.isAuthenticated === true || userMode === "connected" || Boolean(refreshToken);
  const modeLabel = isConnected ? "Connecté" : "Invité";

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (_error) {
      // On continue la deconnexion locale meme en cas d'echec reseau.
    }

    await clearAuthSession();

    navigation.reset({
      index: 0,
      routes: [{ name: 'StartScreen' }],
    });
  };

  const handleGoToLogin = () => {
    navigation.navigate('LoginScreen', { initialMode: 'login' });
  };

  return (
    <View style={styles.container}>
      {/* Décorations dynamiques */}
      <View style={styles.decoParticle1} />
      <View style={styles.decoParticle2} />
      <View style={styles.decoParticle3} />

      <LinearGradient
        colors={['rgba(138, 43, 226, 0.2)', 'rgba(75, 0, 130, 0.1)']}
        style={styles.gradientOverlay}
      />

      <View style={styles.card}>
        {/* Titre avec effet néon */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleMain}>YAM</Text>
          <Text style={styles.titleNeon}>MASTER</Text>
        </View>

        <Text style={styles.subtitle}>Stratégie • Hasard • Compétition</Text>

        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🔥 Mode: {modeLabel}</Text>
          </View>

        </View>

        {displayName && (
          <Text style={styles.welcomeText}>Prêt à jouer, {displayName} ?</Text>
        )}

        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              isOnlineHovered && styles.buttonHovered,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate("OnlineGameScreen", {
              playerName: displayName || 'Joueur',
              isAuthenticated: isConnected,
              userMode: isConnected ? 'connected' : 'guest',
              displayName,
              refreshToken,
              clientSessionId: clientSessionIdRef.current,
            })}
            onHoverIn={() => setIsOnlineHovered(true)}
            onHoverOut={() => setIsOnlineHovered(false)}
          >
            <LinearGradient
              colors={isOnlineHovered ? ['#FF4DFF', '#A855F7'] : ['#FF00FF', '#8A2BE2']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>JOUER EN LIGNE</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              isBotHovered && styles.buttonHovered,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate("VsBotGameScreen")}
            onHoverIn={() => setIsBotHovered(true)}
            onHoverOut={() => setIsBotHovered(false)}
          >
            <LinearGradient
              colors={isBotHovered ? ['#6D28D9', '#9333EA'] : ['#4B0082', '#800080']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>DÉFI BOT</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {!isConnected && (
          <Pressable
            onPress={handleGoToLogin}
            style={({ pressed }) => [styles.loginLinkWrapper, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.loginLinkText}>
              Vous avez déjà un compte ? <Text style={styles.loginLinkTextStrong}>Se connecter</Text>
            </Text>
          </Pressable>
        )}

        {isConnected && (
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
            onPress={handleLogout}
            onHoverIn={() => setIsLogoutHovered(true)}
            onHoverOut={() => setIsLogoutHovered(false)}
          >
            <LinearGradient
              colors={isLogoutHovered ? ['#B71C1C', '#7A1111'] : ['#1E1654', '#16103A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoutButtonGradient}
            >
              <Text
                style={[
                  styles.logoutButtonText,
                  isLogoutHovered && styles.logoutButtonTextHovered,
                ]}
              >
                SE DÉCONNECTER
              </Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ... (propTypes restent identiques)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },

  // Décorations dynamiques
  decoParticle1: {
    position: 'absolute',
    top: 80,
    left: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(138, 43, 226, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(138, 43, 226, 0.6)',
  },
  decoParticle2: {
    position: 'absolute',
    top: 120,
    right: 40,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 20, 147, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(255, 20, 147, 0.6)',
  },
  decoParticle3: {
    position: 'absolute',
    bottom: 100,
    left: 50,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(75, 0, 130, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(75, 0, 130, 0.6)',
  },

  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    backgroundColor: 'rgba(20, 20, 40, 0.8)',
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.3)',
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },

  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  titleMain: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 20, 147, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  titleNeon: {
    fontSize: 42,
    fontWeight: '900',
    color: 'transparent',
    letterSpacing: 2,
    textShadowColor: '#8A2BE2',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    backgroundImage: 'linear-gradient(90deg, #FF00FF, #8A2BE2)',
  },

  subtitle: {
    textAlign: 'center',
    color: '#B0B0FF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
    letterSpacing: 1,
  },

  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },

  badge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(138, 43, 226, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.5)',
  },

  badgeSpecial: {
    backgroundColor: 'rgba(255, 20, 147, 0.2)',
    borderColor: 'rgba(255, 20, 147, 0.5)',
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  welcomeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 0.5,
  },

  buttonContainer: {
    gap: 16,
  },

  loginLinkWrapper: {
    marginTop: 18,
    alignItems: 'center',
  },

  loginLinkText: {
    color: '#CBB4FF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  loginLinkTextStrong: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 18,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.45)',
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },

  logoutButtonPressed: {
    opacity: 0.9,
  },

  logoutButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
  },

  logoutButtonText: {
    color: '#CBB4FF',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.8,
  },

  logoutButtonTextHovered: {
    color: '#FFECEC',
  },

  button: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },

  buttonHovered: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowOpacity: 0.85,
    shadowRadius: 22,
    elevation: 12,
  },

  buttonPressed: {
    opacity: 0.92,
  },

  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
