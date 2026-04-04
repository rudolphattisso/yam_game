import React from "react";
import PropTypes from "prop-types";
import OnlineGameScreen from "./online-game.screen";

export default function VsBotGameScreen({ navigation, route }) {
  const mergedRoute = {
    ...route,
    params: {
      ...(route?.params || {}),
      gameMode: "bot",
      joinEvent: "queue.bot.join",
      waitingStatusMessage: "Demarrage de la partie contre la machine...",
      hideWaitingUi: true,
      displayGameFoundSplash: false,
    },
  };

  return <OnlineGameScreen navigation={navigation} route={mergedRoute} />;
}

VsBotGameScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      playerName: PropTypes.string,
      displayName: PropTypes.string,
      user: PropTypes.shape({
        id: PropTypes.string,
      }),
      userMode: PropTypes.string,
      refreshToken: PropTypes.string,
      isAuthenticated: PropTypes.bool,
      clientSessionId: PropTypes.string,
      previewGameEndOutcome: PropTypes.oneOf(["win", "lose", "draw"]),
    }),
  }),
};

VsBotGameScreen.defaultProps = {
  route: undefined,
};
