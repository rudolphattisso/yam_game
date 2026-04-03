// ./App.js

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/home.screen';
import OnlineGameScreen from './screens/online-game.screen';
import VsBotGameScreen from './screens/vs-bot-game.screen';
import { SocketContext, socket } from './contexts/socket.context';
import StartScreen from './screens/start.screen';
import LoginScreen from './screens/login.screen';
import HistoryScreen from './screens/history.screen';
import { buildClientSessionId, loadAuthSession } from './utils/auth-session.storage';

const Stack = createStackNavigator();

function App() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [initialRouteName, setInitialRouteName] = useState('StartScreen');
  const [initialHomeParams, setInitialHomeParams] = useState(undefined);

  useEffect(() => {
    const bootstrapSession = async () => {
      const savedSession = await loadAuthSession();
      if (savedSession?.isAuthenticated) {
        setInitialRouteName('HomeScreen');
        setInitialHomeParams({
          userMode: 'connected',
          displayName: savedSession.displayName,
          refreshToken: savedSession.refreshToken,
          accessToken: savedSession.accessToken,
          user: savedSession.user,
          isAuthenticated: true,
          clientSessionId: savedSession.clientSessionId || buildClientSessionId(),
        });
      }

      setIsBootstrapping(false);
    };

    bootstrapSession();
  }, []);

  if (isBootstrapping) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  return (
    <SocketContext.Provider value={socket}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRouteName}>
          <Stack.Screen name="StartScreen" component={StartScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ title: 'Connexion / inscription' }} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} initialParams={initialHomeParams} />
          <Stack.Screen name="HistoryScreen" component={HistoryScreen} options={{ title: 'Historique' }} />
          <Stack.Screen name="OnlineGameScreen" component={OnlineGameScreen} />
          <Stack.Screen name="VsBotGameScreen" component={VsBotGameScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SocketContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F0A1E',
  },
});

export default App;