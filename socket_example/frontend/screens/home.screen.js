import PropTypes from "prop-types";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen({ navigation, route }) {
  const userMode = route?.params?.userMode;
  const displayName = route?.params?.displayName;
  const modeLabel = userMode === "connected" ? "Connecté" : "Invité";

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
          <View style={[styles.badge, styles.badgeSpecial]}>
            <Text style={styles.badgeText}>⚡ Bonus x2 ce soir</Text>
          </View>
        </View>

        {displayName && (
          <Text style={styles.welcomeText}>Prêt à jouer, {displayName} ?</Text>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("OnlineGameScreen")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF00FF', '#8A2BE2']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>JOUER EN LIGNE</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("VsBotGameScreen")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4B0082', '#800080']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>DÉFI BOT</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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

  button: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
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
