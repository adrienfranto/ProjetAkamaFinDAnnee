// src/socket/commandeEvents.ts
import { Server, Socket } from "socket.io";
import Commande from "../modals/Commande";

export function registerCommandeEvents(io: Server, socket: Socket) {
  console.log(`📦 Registering commande events for user ${socket.data.userId}`);

  // Événement: Créer une nouvelle commande
  socket.on("createCommande", async (data, callback) => {
    try {
      const { table_number, order_name, total_amount, payment_method, status, items } = data;

      // Validation
      if (!table_number || !items || !Array.isArray(items) || items.length === 0) {
        return callback({
          success: false,
          msg: "Données invalides: table_number et items requis"
        });
      }

      // Créer la commande
      const commande = new Commande({
        tableNumber: parseInt(table_number.toString()),
        orderNumber: order_name || `CMD-${Date.now()}`,
        totalAmount: total_amount?.toString() || "0",
        paymentMethod: payment_method || "Inconnu",
        status: status || "En cours",
        items: items,
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
        created_at: commande.createdAt.toISOString(),
        updated_at: commande.updatedAt.toISOString(),
      };

      // Émettre à tous les clients connectés
      io.emit("commandeCreated", commandeData);

      console.log(`✅ Commande créée: ${commande._id}`);

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
      const { id, table_number, order_name, total_amount, payment_method, status, items } = data;

      const commande = await Commande.findById(id);

      if (!commande) {
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
        created_at: commande.createdAt.toISOString(),
        updated_at: commande.updatedAt.toISOString(),
      };

      // Émettre à tous les clients
      io.emit("commandeUpdated", commandeData);

      console.log(`✅ Commande mise à jour: ${commande._id}`);

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
      const { id } = data;

      const commande = await Commande.findByIdAndDelete(id);

      if (!commande) {
        return callback({
          success: false,
          msg: "Commande non trouvée"
        });
      }

      // Émettre à tous les clients
      io.emit("commandeDeleted", { id: id });

      console.log(`✅ Commande supprimée: ${id}`);

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
      const commandes = await Commande.find().sort({ createdAt: -1 });

      const data = commandes.map((c) => ({
        id: c._id.toString(),
        table_number: c.tableNumber,
        order_name: c.orderNumber,
        total_amount: c.totalAmount,
        payment_method: c.paymentMethod,
        status: c.status,
        items: c.items,
        created_at: c.createdAt.toISOString(),
        updated_at: c.updatedAt.toISOString(),
      }));

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
      const { id } = data;
      const commande = await Commande.findById(id);

      if (!commande) {
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
        created_at: commande.createdAt.toISOString(),
        updated_at: commande.updatedAt.toISOString(),
      };

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
}