// app/screens/vs-bot-game.screen.js

import React, { useContext } from "react";
import PropTypes from "prop-types";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SocketContext } from "../contexts/socket.context";
import OnlineGameController from "../controllers/online-game.controller";

export default function VsBotGameScreen({ navigation }) {
    const socket = useContext(SocketContext);

    const leaveGame = () => {
        socket.emit("game.leave");
        navigation.navigate("HomeScreen");
    };

    const handleGameEnd = (data) => {
        const winnerLabel = data?.winner === "draw"
            ? "Match nul 🤝"
            : data?.isWinner
            ? "Victoire contre le bot ! 🏆"
            : "Défaite contre le bot 😤";

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
            `Score bot : ${data?.opponentScore ?? 0}`,
        ]
            .filter(Boolean)
            .join("\n");

        if (Platform.OS === "web") {
            globalThis.alert(message);
            navigation.navigate("HomeScreen");
            return;
        }

        Alert.alert("Fin de partie", message, [
            { text: "OK", onPress: () => navigation.navigate("HomeScreen") },
        ]);
    };

    return (
        <LinearGradient colors={["#07130B", "#0C2415", "#06180E"]} style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Mode VS Bot</Text>
                <Text style={styles.subtitle}>Affronte un bot sur le moteur officiel Yam Master.</Text>

                <View style={styles.controllerWrapper}>
                    <OnlineGameController
                        joinEvent="queue.bot.join"
                        waitingStatusMessage="Demarrage de la partie contre la machine..."
                        hideWaitingUi
                        displayGameFoundSplash={false}
                        onGameEnd={handleGameEnd}
                    />
                </View>

                <TouchableOpacity style={styles.backButton} onPress={leaveGame} activeOpacity={0.85}>
                    <Text style={styles.backButtonText}>Retour au menu</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

VsBotGameScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
    }).isRequired,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 18,
        justifyContent: "center",
        backgroundColor: "#06180E",
    },
    card: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#2E7D32",
        backgroundColor: "rgba(10, 25, 15, 0.94)",
        padding: 16,
    },
    title: {
        color: "#E8F5E9",
        fontSize: 28,
        fontWeight: "900",
        textAlign: "center",
        marginBottom: 6,
    },
    subtitle: {
        color: "#A5D6A7",
        textAlign: "center",
        marginBottom: 12,
        fontWeight: "600",
    },
    controllerWrapper: {
        minHeight: 460,
    },
    backButton: {
        marginTop: 14,
        alignSelf: "center",
        backgroundColor: "#2E7D32",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
    },
    backButtonText: {
        color: "#F1F8E9",
        fontWeight: "700",
    },
});
