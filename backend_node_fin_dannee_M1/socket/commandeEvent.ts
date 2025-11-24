// src/socket/commandeEvents.ts
import { Server, Socket } from "socket.io";
import Commande from "../modals/Commande";

export function registerCommandeEvents(io: Server, socket: Socket) {
  const userName = socket.data.name || 'Unknown';
  const userId = socket.data.userId;
  console.log(`📦 Registering commande events for user ${userName} (${userId})`);

  // Événement: Créer une nouvelle commande
  socket.on("createCommande", async (data, callback) => {
    try {
      console.log(`\n🆕 ============================================`);
      console.log(`🆕 CREATE COMMANDE by ${userName}`);
      console.log(`📝 Data:`, data);
      
      const { table_number, order_name, total_amount, payment_method, status, items } = data;

      // Validation
      if (!table_number || !items || !Array.isArray(items) || items.length === 0) {
        console.log(`❌ Validation failed for createCommande`);
        return callback({
          success: false,
          msg: "Données invalides: table_number et items requis"
        });
      }

      // Créer la commande avec isRead = false par défaut
      const commande = new Commande({
        tableNumber: parseInt(table_number.toString()),
        orderNumber: order_name || `CMD-${Date.now()}`,
        totalAmount: total_amount?.toString() || "0",
        paymentMethod: payment_method || "Inconnu",
        status: status || "En cours",
        items: items,
        isRead: false, // ✅ Par défaut non lue
      });

      await commande.save();

      const commandeData = {
        id: commande._id.toString(),
        table_number: commande.tableNumber,
        order_name: commande.orderNumber,
        total_amount: commande.totalAmount,
        payment_method: commande.paymentMethod,
        status: commande.status,
        items: commande.items,
        isRead: commande.isRead,
        created_at: commande.createdAt.toISOString(),
        updated_at: commande.updatedAt.toISOString(),
      };

      console.log(`✅ Commande created: ${commande._id}`);

      // ✅ CRITIQUE: Émettre à TOUS les clients connectés (y compris l'émetteur)
      console.log(`📡 Broadcasting commandeCreated to ALL clients...`);
      io.emit("commandeCreated", commandeData);
      console.log(`✅ commandeCreated broadcasted`);

      // ✅ CRITIQUE: Compter et émettre le nombre de commandes non lues
      const unreadCount = await Commande.countDocuments({ isRead: false });
      console.log(`📊 Current unread count: ${unreadCount}`);
      console.log(`📡 Broadcasting unreadCommandesCount to ALL clients...`);
      io.emit("unreadCommandesCount", { count: unreadCount });
      console.log(`✅ unreadCommandesCount broadcasted: ${unreadCount}`);
      console.log(`🆕 ============================================\n`);

      // Callback pour confirmation
      if (callback) {
        callback({
          success: true,
          msg: "Commande créée",
          data: commandeData
        });
      }
    } catch (error: any) {
      console.error("❌ Error creating commande:", error);
      if (callback) {
        callback({
          success: false,
          msg: error.message || "Erreur serveur"
        });
      }
    }
  });

  // Événement: Mettre à jour une commande
  socket.on("updateCommande", async (data, callback) => {
    try {
      console.log(`\n🔄 ============================================`);
      console.log(`🔄 UPDATE COMMANDE by ${userName}`);
      console.log(`📝 Data:`, data);
      
      const { id, table_number, order_name, total_amount, payment_method, status, items } = data;

      const commande = await Commande.findById(id);

      if (!commande) {
        console.log(`❌ Commande not found: ${id}`);
        return callback({
          success: false,
          msg: "Commande non trouvée"
        });
      }

      // Mise à jour des champs
      if (table_number !== undefined) commande.tableNumber = parseInt(table_number.toString());
      if (order_name !== undefined) commande.orderNumber = order_name;
      if (total_amount !== undefined) commande.totalAmount = total_amount.toString();
      if (payment_method !== undefined) commande.paymentMethod = payment_method;
      if (status !== undefined) commande.status = status;
      if (items !== undefined) commande.items = items;

      await commande.save();

      const commandeData = {
        id: commande._id.toString(),
        table_number: commande.tableNumber,
        order_name: commande.orderNumber,
        total_amount: commande.totalAmount,
        payment_method: commande.paymentMethod,
        status: commande.status,
        items: commande.items,
        isRead: commande.isRead,
        created_at: commande.createdAt.toISOString(),
        updated_at: commande.updatedAt.toISOString(),
      };

      console.log(`✅ Commande updated: ${commande._id}`);

      // Émettre à tous les clients
      console.log(`📡 Broadcasting commandeUpdated to ALL clients...`);
      io.emit("commandeUpdated", commandeData);
      console.log(`✅ commandeUpdated broadcasted`);

      // Mettre à jour le compteur
      const unreadCount = await Commande.countDocuments({ isRead: false });
      console.log(`📊 Current unread count: ${unreadCount}`);
      console.log(`📡 Broadcasting unreadCommandesCount to ALL clients...`);
      io.emit("unreadCommandesCount", { count: unreadCount });
      console.log(`✅ unreadCommandesCount broadcasted: ${unreadCount}`);
      console.log(`🔄 ============================================\n`);

      if (callback) {
        callback({
          success: true,
          msg: "Commande mise à jour",
          data: commandeData
        });
      }
    } catch (error: any) {
      console.error("❌ Error updating commande:", error);
      if (callback) {
        callback({
          success: false,
          msg: error.message || "Erreur serveur"
        });
      }
    }
  });

  // Événement: Supprimer une commande
  socket.on("deleteCommande", async (data, callback) => {
    try {
      console.log(`\n🗑️  ============================================`);
      console.log(`🗑️  DELETE COMMANDE by ${userName}`);
      console.log(`📝 ID:`, data.id);
      
      const { id } = data;

      const commande = await Commande.findByIdAndDelete(id);

      if (!commande) {
        console.log(`❌ Commande not found: ${id}`);
        return callback({
          success: false,
          msg: "Commande non trouvée"
        });
      }

      console.log(`✅ Commande deleted: ${id}`);

      // Émettre à tous les clients
      console.log(`📡 Broadcasting commandeDeleted to ALL clients...`);
      io.emit("commandeDeleted", { id: id });
      console.log(`✅ commandeDeleted broadcasted`);

      // Mettre à jour le compteur
      const unreadCount = await Commande.countDocuments({ isRead: false });
      console.log(`📊 Current unread count: ${unreadCount}`);
      console.log(`📡 Broadcasting unreadCommandesCount to ALL clients...`);
      io.emit("unreadCommandesCount", { count: unreadCount });
      console.log(`✅ unreadCommandesCount broadcasted: ${unreadCount}`);
      console.log(`🗑️  ============================================\n`);

      if (callback) {
        callback({
          success: true,
          msg: "Commande supprimée"
        });
      }
    } catch (error: any) {
      console.error("❌ Error deleting commande:", error);
      if (callback) {
        callback({
          success: false,
          msg: error.message || "Erreur serveur"
        });
      }
    }
  });

  // Événement: Récupérer toutes les commandes
  socket.on("getAllCommandes", async (callback) => {
    try {
      console.log(`📋 GET ALL COMMANDES by ${userName}`);
      const commandes = await Commande.find().sort({ createdAt: -1 });

      const data = commandes.map((c) => ({
        id: c._id.toString(),
        table_number: c.tableNumber,
        order_name: c.orderNumber,
        total_amount: c.totalAmount,
        payment_method: c.paymentMethod,
        status: c.status,
        items: c.items,
        isRead: c.isRead,
        created_at: c.createdAt.toISOString(),
        updated_at: c.updatedAt.toISOString(),
      }));

      console.log(`✅ Returning ${data.length} commandes`);

      if (callback) {
        callback({
          success: true,
          data: data
        });
      }
    } catch (error: any) {
      console.error("❌ Error fetching commandes:", error);
      if (callback) {
        callback({
          success: false,
          msg: error.message || "Erreur serveur"
        });
      }
    }
  });

  // Événement: Récupérer une commande par ID
  socket.on("getCommandeById", async (data, callback) => {
    try {
      console.log(`🔍 GET COMMANDE BY ID by ${userName}:`, data.id);
      const { id } = data;
      const commande = await Commande.findById(id);

      if (!commande) {
        console.log(`❌ Commande not found: ${id}`);
        return callback({
          success: false,
          msg: "Commande non trouvée"
        });
      }

      const commandeData = {
        id: commande._id.toString(),
        table_number: commande.tableNumber,
        order_name: commande.orderNumber,
        total_amount: commande.totalAmount,
        payment_method: commande.paymentMethod,
        status: commande.status,
        items: commande.items,
        isRead: commande.isRead,
        created_at: commande.createdAt.toISOString(),
        updated_at: commande.updatedAt.toISOString(),
      };

      console.log(`✅ Commande found: ${id}`);

      if (callback) {
        callback({
          success: true,
          data: commandeData
        });
      }
    } catch (error: any) {
      console.error("❌ Error fetching commande:", error);
      if (callback) {
        callback({
          success: false,
          msg: error.message || "Erreur serveur"
        });
      }
    }
  });

  // Événement: Obtenir le nombre de commandes non lues
  socket.on("getUnreadCommandesCount", async (callback) => {
    try {
      console.log(`📊 GET UNREAD COUNT by ${userName}`);
      const count = await Commande.countDocuments({ isRead: false });
      console.log(`✅ Current unread count: ${count}`);
      
      if (callback) {
        callback({
          success: true,
          count: count
        });
      }
    } catch (error: any) {
      console.error("❌ Error getting unread count:", error);
      if (callback) {
        callback({
          success: false,
          msg: error.message || "Erreur serveur",
          count: 0
        });
      }
    }
  });

  // Événement: Marquer toutes les commandes comme lues
  socket.on("markAllCommandesAsRead", async (callback) => {
    try {
      console.log(`\n✅ ============================================`);
      console.log(`✅ MARK ALL AS READ by ${userName}`);
      
      const result = await Commande.updateMany(
        { isRead: false },
        { $set: { isRead: true } }
      );

      console.log(`✅ ${result.modifiedCount} commandes marked as read`);

      // ✅ CRITIQUE: Émettre la mise à jour du compteur à TOUS les clients
      console.log(`📡 Broadcasting unreadCommandesCount = 0 to ALL clients...`);
      io.emit("unreadCommandesCount", { count: 0 });
      console.log(`✅ unreadCommandesCount broadcasted: 0`);
      console.log(`✅ ============================================\n`);

      if (callback) {
        callback({
          success: true,
          msg: `${result.modifiedCount} commandes marquées comme lues`,
          modifiedCount: result.modifiedCount
        });
      }
    } catch (error: any) {
      console.error("❌ Error marking commandes as read:", error);
      if (callback) {
        callback({
          success: false,
          msg: error.message || "Erreur serveur"
        });
      }
    }
  });

  console.log(`✅ All commande events registered for ${userName}`);
}