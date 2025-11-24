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
        
        // ✅ IMPORTANT: Configurer les listeners d'événements globaux dès la connexion
        setupGlobalListeners(socket);
        
        resolve(socket);
      });

      socket.on("connect_error", (error) => {
        clearTimeout(timeout);
        console.error("❌ Socket connection error:", error.message);
        reject(error);
      });
    });

    // Écouter les événements de reconnexion
    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Le serveur a déconnecté le socket, reconnecter manuellement
        socket.connect();
      }
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      // ✅ Reconfigurer les listeners après reconnexion
      setupGlobalListeners(socket);
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("🔄 Attempting to reconnect...", attemptNumber);
    });

    socket.on("reconnect_error", (error) => {
      console.error("❌ Reconnection error:", error.message);
    });

    socket.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed after all attempts");
    });

    return socket;
  } catch (error) {
    console.error("❌ Error connecting socket:", error);
    throw error;
  }
}

// ✅ NOUVEAU: Fonction pour configurer les listeners globaux
function setupGlobalListeners(socket) {
  console.log("🔧 Setting up global socket listeners...");
  
  // Écouter l'événement unreadCommandesCount de manière globale
  socket.on("unreadCommandesCount", (data) => {
    console.log("📥 [GLOBAL] unreadCommandesCount event received:", data);
  });

  // Écouter l'événement commandeCreated de manière globale
  socket.on("commandeCreated", (data) => {
    console.log("📥 [GLOBAL] commandeCreated event received:", data.id);
  });

  // Écouter l'événement commandeUpdated de manière globale
  socket.on("commandeUpdated", (data) => {
    console.log("📥 [GLOBAL] commandeUpdated event received:", data.id);
  });

  // Écouter l'événement commandeDeleted de manière globale
  socket.on("commandeDeleted", (data) => {
    console.log("📥 [GLOBAL] commandeDeleted event received:", data.id);
  });

  console.log("✅ Global listeners configured successfully");
}

export function getSocket() {
  if (!socket) {
    console.warn("⚠️ Socket not initialized. Call connectSocket() first.");
  } else if (!socket.connected) {
    console.warn("⚠️ Socket is not connected. Status:", socket.connected);
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    console.log("🔌 Disconnecting socket...");
    // Retirer tous les listeners avant de déconnecter
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    console.log("✅ Socket disconnected and cleaned up");
  }
}

// ✅ NOUVEAU: Fonction utilitaire pour vérifier l'état du socket
export function getSocketStatus() {
  if (!socket) {
    return { initialized: false, connected: false, id: null };
  }
  return {
    initialized: true,
    connected: socket.connected,
    id: socket.id
  };
}

// ✅ NOUVEAU: Fonction pour forcer la reconnexion
export function forceReconnect() {
  if (socket) {
    console.log("🔄 Forcing socket reconnection...");
    socket.disconnect();
    socket.connect();
  } else {
    console.warn("⚠️ Cannot reconnect: socket not initialized");
  }
}