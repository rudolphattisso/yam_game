// app/controller/online-game.controller.js

import React, { useEffect, useState, useContext } from "react";
import PropTypes from 'prop-types';
import { StyleSheet, Text, View } from "react-native";
import { SocketContext } from '../contexts/socket.context';
import Board from '../components/board/board.component';


export default function OnlineGameController({ onOpponentLeft }) {

    const socket = useContext(SocketContext);

    const [inQueue, setInQueue] = useState(false);
    const [inGame, setInGame] = useState(false);
    const [idOpponent, setIdOpponent] = useState(null);
    const [statusMessage, setStatusMessage] = useState('Waiting for server datas...');

    useEffect(() => {
        const onQueueAdded = (data) => {
            console.log('[listen][queue.added]:', data);
            setInQueue(data['inQueue']);
            setInGame(data['inGame']);
            setStatusMessage('Waiting for another player...');
        };

        const onGameStart = (data) => {
            console.log('[listen][game.start]:', data);
            setInQueue(data['inQueue']);
            setInGame(data['inGame']);
            setIdOpponent(data['idOpponent']);
            setStatusMessage('Game found !');
        };

        const handleOpponentLeft = () => {
            if (onOpponentLeft) onOpponentLeft();
        };

        socket.on('queue.added', onQueueAdded);
        socket.on('game.start', onGameStart);
        socket.on('game.opponent.left', handleOpponentLeft);

        console.log('[emit][queue.join]:', socket.id);
        socket.emit("queue.join");
        setInQueue(false);
        setInGame(false);

        return () => {
            socket.off('queue.added', onQueueAdded);
            socket.off('game.start', onGameStart);
            socket.off('game.opponent.left', handleOpponentLeft);
        };

    }, [socket, onOpponentLeft]);

    return (
        <View style={styles.container}>
            {!inQueue && !inGame && (
                <Text style={styles.paragraph}>
                    {statusMessage}
                </Text>
            )}

            {inQueue && (
                <Text style={styles.paragraph}>
                    Waiting for another player...
                </Text>
            )}

            {inGame && (
                <>
                    <Text style={styles.paragraph}>
                        Game found !
                    </Text>
                        {/* <Text style={styles.paragraph}>
                            Player - {socket.id} -
                        </Text> */}
                        <Text style={styles.paragraph}>
                            - vs -
                        </Text>
                        <Text style={styles.paragraph}>
                            Player - {idOpponent} -
                        </Text>
                    <Board>
                        
                    </Board>
                </>
            )}
        </View>
    );
}

OnlineGameController.propTypes = {
    onOpponentLeft: PropTypes.func,
};

OnlineGameController.defaultProps = {
    onOpponentLeft: null,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        width: '100%',
        height: '100%',
    },
    paragraph: {
        fontSize: 16,
    }
});
