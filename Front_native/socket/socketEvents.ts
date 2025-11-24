// socket/socketEvents.js
import { getSocket } from "./socket";

// ============== Fonction utilitaire de vérification ==============
const checkSocketConnection = (functionName) => {
  const socket = getSocket();
  
  if (!socket) {
    console.error(`❌ ${functionName}: Socket not initialized`);
    return null;
  }
  
  if (!socket.connected) {
    console.error(`❌ ${functionName}: Socket not connected`);
    return null;
  }
  
  return socket;
};

// ============== Test Socket ==============
export const testSocket = (payload, callback) => {
  const socket = checkSocketConnection("testSocket");
  if (!socket) return;

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
  const socket = checkSocketConnection("updateProfile");
  if (!socket) return;

  socket.emit("updateProfile", data);
  
  if (typeof callback === "function") {
    socket.once("updateProfile", callback);
  }
};

export const onUserStatusChanged = (callback) => {
  const socket = checkSocketConnection("onUserStatusChanged");
  if (!socket) return;

  socket.on("userStatusChanged", callback);
};

export const offUserStatusChanged = () => {
  const socket = getSocket();
  if (socket) {
    socket.off("userStatusChanged");
  }
};

export const getUserStatus = (userId, callback) => {
  const socket = checkSocketConnection("getUserStatus");
  if (!socket) return;

  socket.emit("getUserStatus", { userId });
  
  if (typeof callback === "function") {
    socket.once("getUserStatus", callback);
  }
};

// ============== Commande Events ==============

// Créer une commande
export const createCommande = (data, callback) => {
  const socket = checkSocketConnection("createCommande");
  
  if (!socket) {
    if (callback) callback({ success: false, msg: "Socket non connecté" });
    return;
  }

  console.log("📤 Creating commande:", data);
  socket.emit("createCommande", data, callback);
};

// Mettre à jour une commande
export const updateCommande = (data, callback) => {
  const socket = checkSocketConnection("updateCommande");
  
  if (!socket) {
    if (callback) callback({ success: false, msg: "Socket non connecté" });
    return;
  }

  console.log("📤 Updating commande:", data);
  socket.emit("updateCommande", data, callback);
};

// Supprimer une commande
export const deleteCommande = (id, callback) => {
  const socket = checkSocketConnection("deleteCommande");
  
  if (!socket) {
    if (callback) callback({ success: false, msg: "Socket non connecté" });
    return;
  }

  console.log("📤 Deleting commande:", id);
  socket.emit("deleteCommande", { id }, callback);
};

// Récupérer toutes les commandes
export const getAllCommandes = (callback) => {
  const socket = checkSocketConnection("getAllCommandes");
  
  if (!socket) {
    if (callback) callback({ success: false, msg: "Socket non connecté", data: [] });
    return;
  }

  console.log("📤 Getting all commandes");
  socket.emit("getAllCommandes", callback);
};

// Récupérer une commande par ID
export const getCommandeById = (id, callback) => {
  const socket = checkSocketConnection("getCommandeById");
  
  if (!socket) {
    if (callback) callback({ success: false, msg: "Socket non connecté" });
    return;
  }

  console.log("📤 Getting commande by id:", id);
  socket.emit("getCommandeById", { id }, callback);
};

// ✅ Récupérer le nombre de commandes non lues
export const getUnreadCommandesCount = (callback) => {
  const socket = checkSocketConnection("getUnreadCommandesCount");
  
  if (!socket) {
    console.error("❌ getUnreadCommandesCount: Socket not available");
    if (callback) callback({ success: false, count: 0 });
    return;
  }

  console.log("📤 Getting unread commandes count");
  socket.emit("getUnreadCommandesCount", (response) => {
    console.log("📥 Unread count response:", response);
    if (callback) callback(response);
  });
};

// ✅ Marquer toutes les commandes comme lues
export const markAllCommandesAsRead = (callback) => {
  const socket = checkSocketConnection("markAllCommandesAsRead");
  
  if (!socket) {
    if (callback) callback({ success: false, msg: "Socket non connecté" });
    return;
  }

  console.log("📤 Marking all commandes as read");
  socket.emit("markAllCommandesAsRead", (response) => {
    console.log("📥 Mark as read response:", response);
    if (callback) callback(response);
  });
};

// ============== Listeners pour les événements temps réel ==============

// ✅ Écouter les nouvelles commandes créées
export const onCommandeCreated = (callback) => {
  const socket = checkSocketConnection("onCommandeCreated");
  if (!socket) return;

  console.log("👂 Setting up listener for commandeCreated");
  
  // Vérifier si le listener existe déjà
  const existingListeners = socket.listeners("commandeCreated");
  if (existingListeners.length > 0) {
    console.warn("⚠️ Listener for commandeCreated already exists, removing old one");
    socket.off("commandeCreated");
  }

  socket.on("commandeCreated", (data) => {
    console.log("📥 [EVENT] commandeCreated received:", data.id);
    callback(data);
  });
  
  console.log("✅ Listener for commandeCreated set up successfully");
};

export const offCommandeCreated = () => {
  const socket = getSocket();
  if (socket) {
    socket.off("commandeCreated");
    console.log("🔇 Stopped listening to commandeCreated");
  }
};

// ✅ Écouter les mises à jour de commandes
export const onCommandeUpdated = (callback) => {
  const socket = checkSocketConnection("onCommandeUpdated");
  if (!socket) return;

  console.log("👂 Setting up listener for commandeUpdated");
  
  // Vérifier si le listener existe déjà
  const existingListeners = socket.listeners("commandeUpdated");
  if (existingListeners.length > 0) {
    console.warn("⚠️ Listener for commandeUpdated already exists, removing old one");
    socket.off("commandeUpdated");
  }

  socket.on("commandeUpdated", (data) => {
    console.log("📥 [EVENT] commandeUpdated received:", data.id);
    callback(data);
  });
  
  console.log("✅ Listener for commandeUpdated set up successfully");
};

export const offCommandeUpdated = () => {
  const socket = getSocket();
  if (socket) {
    socket.off("commandeUpdated");
    console.log("🔇 Stopped listening to commandeUpdated");
  }
};

// ✅ Écouter les suppressions de commandes
export const onCommandeDeleted = (callback) => {
  const socket = checkSocketConnection("onCommandeDeleted");
  if (!socket) return;

  console.log("👂 Setting up listener for commandeDeleted");
  
  // Vérifier si le listener existe déjà
  const existingListeners = socket.listeners("commandeDeleted");
  if (existingListeners.length > 0) {
    console.warn("⚠️ Listener for commandeDeleted already exists, removing old one");
    socket.off("commandeDeleted");
  }

  socket.on("commandeDeleted", (data) => {
    console.log("📥 [EVENT] commandeDeleted received:", data.id);
    callback(data);
  });
  
  console.log("✅ Listener for commandeDeleted set up successfully");
};

export const offCommandeDeleted = () => {
  const socket = getSocket();
  if (socket) {
    socket.off("commandeDeleted");
    console.log("🔇 Stopped listening to commandeDeleted");
  }
};

// ✅ Écouter les changements du compteur de commandes non lues - CRITIQUE
export const onUnreadCommandesCount = (callback) => {
  const socket = checkSocketConnection("onUnreadCommandesCount");
  if (!socket) {
    console.error("❌ onUnreadCommandesCount: Cannot set up listener - socket not available");
    return;
  }

  console.log("👂 Setting up listener for unreadCommandesCount");
  
  // Vérifier si le listener existe déjà
  const existingListeners = socket.listeners("unreadCommandesCount");
  console.log(`📊 Existing listeners for unreadCommandesCount: ${existingListeners.length}`);
  
  if (existingListeners.length > 0) {
    console.warn("⚠️ Listener for unreadCommandesCount already exists, removing old one");
    socket.off("unreadCommandesCount");
  }

  socket.on("unreadCommandesCount", (data) => {
    console.log("📥 [EVENT] unreadCommandesCount received:", data);
    if (data && typeof data.count !== 'undefined') {
      console.log(`📊 Calling callback with count: ${data.count}`);
      callback(data.count);
    } else {
      console.error("❌ Invalid data format for unreadCommandesCount:", data);
    }
  });
  
  console.log("✅ Listener for unreadCommandesCount set up successfully");
  
  // Vérifier immédiatement après configuration
  const newListeners = socket.listeners("unreadCommandesCount");
  console.log(`📊 After setup, listeners count: ${newListeners.length}`);
};

export const offUnreadCommandesCount = () => {
  const socket = getSocket();
  if (socket) {
    const beforeCount = socket.listeners("unreadCommandesCount").length;
    socket.off("unreadCommandesCount");
    const afterCount = socket.listeners("unreadCommandesCount").length;
    console.log(`🔇 Stopped listening to unreadCommandesCount (removed ${beforeCount - afterCount} listeners)`);
  }
};