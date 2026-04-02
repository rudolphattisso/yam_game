// app/contexts/socket.context.js

import React from "react";
import { Platform } from 'react-native';
import io from "socket.io-client";

// context react pour partager la connexion socket-io à travers l'application

console.log('Emulation OS Platform: ', Platform.OS);
// Also usable : "http://10.0.2.2:3000"
const expoSocketUrl = process.env.EXPO_PUBLIC_SOCKET_URL;
export const socketEndpoint = expoSocketUrl || (Platform.OS === 'web' ? "http://localhost:3000" : "http://172.20.10.3:3000");

export const socket = io(socketEndpoint, {
  transports: ["websocket"],
});;

export const connectionState = {
  hasConnection: false,
};

socket.on("connect", () => {
  console.log("connect: ", socket.id);
  connectionState.hasConnection = true;
});

socket.on("disconnect", () => {
  connectionState.hasConnection = false;
  console.log("disconnected from server"); // undefined
});

export const SocketContext = React.createContext();