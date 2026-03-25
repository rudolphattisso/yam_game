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
                    <OnlineGameController />
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
