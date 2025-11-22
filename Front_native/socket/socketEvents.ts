// socket/socketEvents.js
import { getSocket } from "./socket";

// Test Socket
export const testSocket = (payload, callback) => {
  const socket = getSocket();
  
  if (!socket || !socket.connected) {
    console.log("❌ Socket is not connected");
    return;
  }

  if (typeof callback === "function") {
    // Écouter la réponse
    socket.on("testSocket", callback);
  } else if (payload) {
    // Émettre un message
    console.log("📤 Sending testSocket:", payload);
    socket.emit("testSocket", payload);
  }
};

// Arrêter d'écouter un événement
export const offTestSocket = () => {
  const socket = getSocket();
  if (socket) {
    socket.off("testSocket");
    console.log("🔇 Stopped listening to testSocket");
  }
};

// Événement pour mettre à jour le profil
export const updateProfile = (data, callback) => {
  const socket = getSocket();
  
  if (!socket || !socket.connected) {
    console.log("❌ Socket is not connected");
    return;
  }

  socket.emit("updateProfile", data);
  
  if (typeof callback === "function") {
    socket.once("updateProfile", callback);
  }
};

// Écouter les changements de statut utilisateur
export const onUserStatusChanged = (callback) => {
  const socket = getSocket();
  
  if (!socket || !socket.connected) {
    console.log("❌ Socket is not connected");
    return;
  }

  socket.on("userStatusChanged", callback);
};

// Arrêter d'écouter les changements de statut
export const offUserStatusChanged = () => {
  const socket = getSocket();
  if (socket) {
    socket.off("userStatusChanged");
  }
};

// Obtenir le statut d'un utilisateur
export const getUserStatus = (userId, callback) => {
  const socket = getSocket();
  
  if (!socket || !socket.connected) {
    console.log("❌ Socket is not connected");
    return;
  }

  socket.emit("getUserStatus", { userId });
  
  if (typeof callback === "function") {
    socket.once("getUserStatus", callback);
  }
};