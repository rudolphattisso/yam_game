// app/screens/online-game.screen.js

import React, { useContext } from "react";
import PropTypes from "prop-types";
import { Alert, Platform, StyleSheet, View, Button, Text } from "react-native";
import { SocketContext } from '../contexts/socket.context';
import OnlineGameController from '../controllers/online-game.controller';

export default function OnlineGameScreen({ navigation }) {

    const socket = useContext(SocketContext);

    const leaveGame = () => {
        socket.emit('game.leave');
        navigation.navigate('HomeScreen');
    };

    const handleOpponentLeft = () => {
        if (Platform.OS === 'web') {
            globalThis.alert('Votre adversaire s\'est déconnecté ou a perdu la session.');
            navigation.navigate('HomeScreen');
        } else {
            Alert.alert(
                'Partie interrompue',
                'Votre adversaire s\'est déconnecté ou a perdu la session.',
                [{ text: 'OK', onPress: () => navigation.navigate('HomeScreen') }]
            );
        }
    };

    const handleGameEnd = (data) => {
        let winnerLabel = 'Partie terminée';
        if (data?.winner === 'draw') {
            winnerLabel = 'Match nul';
        } else if (data?.winner === 'player:1' || data?.winner === 'player:2') {
            const isCurrentPlayerWinner = data.playerScore > data.opponentScore;
            winnerLabel = isCurrentPlayerWinner ? 'Gagné' : 'Perdu';
        }

        const message = `${winnerLabel}\nTon score: ${data?.playerScore ?? 0}\nScore adverse: ${data?.opponentScore ?? 0}`;

        if (Platform.OS === 'web') {
            globalThis.alert(message);
            navigation.navigate('HomeScreen');
            return;
        }

        Alert.alert('Fin de partie', message, [
            { text: 'OK', onPress: () => navigation.navigate('HomeScreen') },
        ]);
    };

    const confirmLeaveGame = () => {
        if (Platform.OS === 'web' && typeof globalThis.confirm === 'function') {
            const shouldLeave = globalThis.confirm('Veux-tu vraiment quitter la partie en cours ?');
            if (shouldLeave) {
                leaveGame();
            }
            return;
        }

        Alert.alert(
            'Quitter la partie',
            'Veux-tu vraiment quitter la partie en cours ?',
            [
                {
                    text: 'Annuler',
                    style: 'cancel',
                },
                {
                    text: 'Quitter',
                    style: 'destructive',
                    onPress: leaveGame,
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {!socket && (
                <>
                    <Text style={styles.paragraph}>
                        No connection with server...
                    </Text>
                    <Text style={styles.footnote}>
                        Restart the app and wait for the server to be back again.
                    </Text>
                </>
            )}

            {socket && (
                <>
                    <Button
                        title="Revenir au menu"
                        onPress={confirmLeaveGame}
                    />
                    <OnlineGameController onOpponentLeft={handleOpponentLeft} onGameEnd={handleGameEnd} />
                </>
            )}
        </View>
    );
}

OnlineGameScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
    }).isRequired,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    }
});
