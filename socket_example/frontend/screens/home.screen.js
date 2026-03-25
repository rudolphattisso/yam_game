// app/screens/home.screen.js

import PropTypes from "prop-types";
import { StyleSheet, View, Button, Text } from "react-native";

export default function HomeScreen({ navigation, route }) {

  const userMode = route?.params?.userMode;
  const displayName = route?.params?.displayName;
  const modeLabel = userMode === 'connected' ? 'Connecte' : 'Invite';

  return (
    <View style={styles.container}>
      <Text style={styles.modeText}>Mode utilisateur: {modeLabel}</Text>
      {displayName && <Text style={styles.modeText}>Bienvenue, {displayName}</Text>}
      <View>
        <Button
          title="Jouer en ligne"
          onPress={() => navigation.navigate('OnlineGameScreen')}
        />
      </View>
      <View>
        <Button
          title="Jouer contre le bot"
          onPress={() => navigation.navigate('VsBotGameScreen')}
        />
      </View>
    </View>
  );
}

HomeScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      userMode: PropTypes.string,
      displayName: PropTypes.string,
    }),
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  modeText: {
    fontSize: 16,
    marginBottom: 16,
  },
});
