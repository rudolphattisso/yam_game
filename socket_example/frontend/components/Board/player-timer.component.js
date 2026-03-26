// app/components/board/timers/player-timer.component.js
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SocketContext } from '../../contexts/socket.context';

const PlayerTimer = () => {
  const socket = useContext(SocketContext);
  const [playerTimer, setPlayerTimer] = useState(0);

  useEffect(() => {
    const onGameTimer = (data) => {
      setPlayerTimer(data['playerTimer']);
    };

    socket.on("game.timer", onGameTimer);

    return () => {
      socket.off("game.timer", onGameTimer);
    };
  }, [socket]);

  return (
    <View style={styles.playerTimerContainer}>
      <Text style={styles.timerText}>⏳ {playerTimer}s</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  playerTimerContainer: {
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
  // 🎨 Texte timer joueur
  timerText: {
    color: '#FFF7E6',
    fontSize: 12,
    fontWeight: '700',
  },
});
export default PlayerTimer;