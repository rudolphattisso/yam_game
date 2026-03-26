// app/components/board/timers/opponent-timer.component.js
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SocketContext } from '../../contexts/socket.context';

const OpponentTimer = () => {
  const socket = useContext(SocketContext);
  const [opponentTimer, setOpponentTimer] = useState(0);

  useEffect(() => {
    const onGameTimer = (data) => {
      setOpponentTimer(data.opponentTimer);
    };

    socket.on('game.timer', onGameTimer);

    // clean up listener on unmount
    return () => {
      socket.off('game.timer', onGameTimer);
    };
  }, [socket]);

  return (
    <View style={styles.opponentTimerContainer}>
      <Text style={styles.timerText}>⏳ {opponentTimer}s</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // 🎨 Timer adversaire
  opponentTimerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#7A1111',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  // 🎨 Texte timer adversaire
  timerText: {
    color: '#FFF7E6',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default OpponentTimer;
