import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View, Text, Pressable } from "react-native";

export default function StartScreen({ navigation }) {
    const handleGuestMode = () => {
        navigation.navigate('HomeScreen', {
            userMode: 'guest',
        });
    };

    const handleAuthenticationMode = () => {
        navigation.navigate('LoginScreen');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenue</Text>
            <Text style={styles.subtitle}>Choisis comment tu veux acceder au jeu.</Text>

            <Pressable style={styles.primaryButton} onPress={handleGuestMode}>
                <Text style={styles.primaryButtonText}>Invite</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={handleAuthenticationMode}>
                <Text style={styles.secondaryButtonText}>Connexion / inscription</Text>
            </Pressable>
        </View>
    );
}

StartScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
    }).isRequired,
};

const BUTTON_WIDTH = 260;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f7fafc",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 30,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#334155",
        textAlign: "center",
        marginBottom: 24,
    },
    primaryButton: {
        width: BUTTON_WIDTH,
        backgroundColor: "#0ea5e9",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        marginBottom: 12,
    },
    primaryButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    secondaryButton: {
        width: BUTTON_WIDTH,
        backgroundColor: "#e2e8f0",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
    },
    secondaryButtonText: {
        color: "#0f172a",
        fontSize: 16,
        fontWeight: "600",
    },
});