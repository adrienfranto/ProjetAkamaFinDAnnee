// socket/socket.js
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../Composant/config/api.config";

let socket = null;

export async function connectSocket() {
  try {
    // Récupérer le token depuis AsyncStorage
    const token = await AsyncStorage.getItem("authToken");
    
    if (!token) {
      throw new Error("No token found. User must login first");
    }

    // Si socket existe déjà et est connecté, le retourner
    if (socket && socket.connected) {
      console.log("✅ Socket already connected:", socket.id);
      return socket;
    }

    // Créer une nouvelle connexion socket
    socket = io(API_CONFIG.SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'], // Important pour React Native
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Attendre la connexion
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Socket connection timeout"));
      }, 10000); // 10 secondes timeout

      socket.on("connect", () => {
        clearTimeout(timeout);
        console.log("✅ Socket connected:", socket.id);
        resolve(socket);
      });

      socket.on("connect_error", (error) => {
        clearTimeout(timeout);
        console.error("❌ Socket connection error:", error.message);
        reject(error);
      });
    });

    // Écouter les événements globaux
    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
    });

    socket.on("reconnect_error", (error) => {
      console.error("❌ Reconnection error:", error.message);
    });

    return socket;
  } catch (error) {
    console.error("❌ Error connecting socket:", error);
    throw error;
  }
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    console.log("🔌 Disconnecting socket...");
    socket.disconnect();
    socket = null;
  }
}