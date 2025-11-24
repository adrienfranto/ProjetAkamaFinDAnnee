// socket/socketEvents.js
import { getSocket } from "./socket";

// ============== Test Socket ==============
export const testSocket = (payload, callback) => {
  const socket = getSocket();
  
  if (!socket || !socket.connected) {
    console.log("❌ Socket is not connected");
    return;
  }

  if (typeof callback === "function") {
    socket.on("testSocket", callback);
  } else if (payload) {
    console.log("📤 Sending testSocket:", payload);
    socket.emit("testSocket", payload);
  }
};

export const offTestSocket = () => {
  const socket = getSocket();
  if (socket) {
    socket.off("testSocket");
    console.log("🔇 Stopped listening to testSocket");
  }
};

// ============== User Events ==============
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

export const onUserStatusChanged = (callback) => {
  const socket = getSocket();
  
  if (!socket || !socket.connected) {
    console.log("❌ Socket is not connected");
    return;
  }

  socket.on("userStatusChanged", callback);
};

export const offUserStatusChanged = () => {
  const socket = getSocket();
  if (socket) {
    socket.off("userStatusChanged");
  }
};

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

// ============== Commande Events ==============

// Créer une commande
export const createCommande = (data, callback) => {
  const socket = getSocket();
  
  if (!socket || !socket.connected) {
    console.log("❌ Socket is not connected");
    if (callback) callback({ success: false, msg: "Socket non connecté" });
    return;
  }

  console.log("📤 Creating commande:", data);
  socket.emit("createCommande", data, callback);
};

// Mettre à jour une commande
export const updateCommande = (data, callback) => {
  const socket = getSocket();
  
  if (!socket || !socket.connected) {
    console.log("❌ Socket is not connected");
    if (callback) callback({ success: false, msg: "Socket non connecté" });
    return;
  }

  console.log("📤 Updating commande:", data);
  socket.emit("updateCommande", data, callback);
};

// Supprimer une commande
export const deleteCommande = (id, callback) => {
  const socket = getSocket();
  
  if (!socket || !socket.connected) {
    console.log("❌ Socket is not connected");
    if (callback) callback({ success: false, msg: "Socket non connecté" });
    return;
  }

  console.log("📤 Deleting commande:", id);
  socket.emit("deleteCommande", { id }, callback);
};

// Récupérer toutes les commandes
export const getAllCommandes = (callback) => {
  const socket = getSocket();
  
  if (!socket || !socket.connected) {
    console.log("❌ Socket is not connected");
    if (callback) callback({ success: false, msg: "Socket non connecté", data: [] });
    return;
  }

  console.log("📤 Getting all commandes");
  socket.emit("getAllCommandes", callback);
};

// Récupérer une commande par ID
export const getCommandeById = (id, callback) => {
  const socket = getSocket();
  
  if (!socket || !socket.connected) {
    console.log("❌ Socket is not connected");
    if (callback) callback({ success: false, msg: "Socket non connecté" });
    return;
  }

  console.log("📤 Getting commande by id:", id);
  socket.emit("getCommandeById", { id }, callback);
};

// ✅ Récupérer le nombre de commandes non lues
export const getUnreadCommandesCount = (callback) => {
  const socket = getSocket();
  
  if (!socket || !socket.connected) {
    console.log("❌ Socket is not connected");
    if (callback) callback({ success: false, count: 0 });
    return;
  }

  console.log("📤 Getting unread commandes count");
  socket.emit("getUnreadCommandesCount", callback);
};

// ✅ Marquer toutes les commandes comme lues
export const markAllCommandesAsRead = (callback) => {
  const socket = getSocket();
  
  if (!socket || !socket.connected) {
    console.log("❌ Socket is not connected");
    if (callback) callback({ success: false, msg: "Socket non connecté" });
    return;
  }

  console.log("📤 Marking all commandes as read");
  socket.emit("markAllCommandesAsRead", callback);
};

// ============== Listeners pour les événements temps réel ==============

// Écouter les nouvelles commandes créées
export const onCommandeCreated = (callback) => {
  const socket = getSocket();
  
  if (!socket || !socket.connected) {
    console.log("❌ Socket is not connected");
    return;
  }

  socket.on("commandeCreated", (data) => {
    console.log("📥 Nouvelle commande reçue:", data);
    callback(data);
  });
};

export const offCommandeCreated = () => {
  const socket = getSocket();
  if (socket) {
    socket.off("commandeCreated");
    console.log("🔇 Stopped listening to commandeCreated");
  }
};

// Écouter les mises à jour de commandes
export const onCommandeUpdated = (callback) => {
  const socket = getSocket();
  
  if (!socket || !socket.connected) {
    console.log("❌ Socket is not connected");
    return;
  }

  socket.on("commandeUpdated", (data) => {
    console.log("📥 Commande mise à jour:", data);
    callback(data);
  });
};

export const offCommandeUpdated = () => {
  const socket = getSocket();
  if (socket) {
    socket.off("commandeUpdated");
    console.log("🔇 Stopped listening to commandeUpdated");
  }
};

// Écouter les suppressions de commandes
export const onCommandeDeleted = (callback) => {
  const socket = getSocket();
  
  if (!socket || !socket.connected) {
    console.log("❌ Socket is not connected");
    return;
  }

  socket.on("commandeDeleted", (data) => {
    console.log("📥 Commande supprimée:", data);
    callback(data);
  });
};

export const offCommandeDeleted = () => {
  const socket = getSocket();
  if (socket) {
    socket.off("commandeDeleted");
    console.log("🔇 Stopped listening to commandeDeleted");
  }
};

// ✅ Écouter les changements du compteur de commandes non lues
export const onUnreadCommandesCount = (callback) => {
  const socket = getSocket();
  
  if (!socket || !socket.connected) {
    console.log("❌ Socket is not connected");
    return;
  }

  socket.on("unreadCommandesCount", (data) => {
    console.log("📥 Compteur de commandes non lues:", data.count);
    callback(data.count);
  });
};

export const offUnreadCommandesCount = () => {
  const socket = getSocket();
  if (socket) {
    socket.off("unreadCommandesCount");
    console.log("🔇 Stopped listening to unreadCommandesCount");
  }
};