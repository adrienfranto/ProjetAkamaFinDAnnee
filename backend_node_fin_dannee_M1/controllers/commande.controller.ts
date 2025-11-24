// src/controllers/commande.controller.ts
import { Request, Response } from "express";
import Commande from "../modals/Commande";

// ⚠️ Note: Ces controllers HTTP sont disponibles pour compatibilité
// Mais l'application utilise Socket.IO pour les opérations en temps réel (voir commandeEvents.ts)

// AFFICHER TOUTES LES COMMANDES
export const getAllCommandes = async (req: Request, res: Response): Promise<void> => {
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
      isRead: c.isRead,
      created_at: c.createdAt.toISOString(),
      updated_at: c.updatedAt.toISOString(),
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching commandes:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// AFFICHER UNE COMMANDE PAR ID
export const getCommandeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const commande = await Commande.findById(id);

    if (!commande) {
      res.status(404).json({ success: false, msg: "Commande non trouvée" });
      return;
    }

    res.json({
      success: true,
      data: {
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
      },
    });
  } catch (error) {
    console.error("Error fetching commande:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// CRÉER UNE COMMANDE
export const createCommande = async (req: Request, res: Response): Promise<void> => {
  try {
    const { table_number, order_name, total_amount, payment_method, status, items } = req.body;

    console.log("📥 Requête reçue:", JSON.stringify(req.body, null, 2));

    // Validation table_number
    if (table_number === undefined || table_number === null) {
      res.status(400).json({ success: false, msg: "table_number requis" });
      return;
    }

    // ✅ Gérer items comme array directement (pas de parsing JSON)
    let parsedItems = items;

    // Si le frontend envoie quand même une string JSON (fallback)
    if (typeof items === 'string') {
      try {
        parsedItems = JSON.parse(items);
      } catch (e) {
        res.status(400).json({ success: false, msg: "Format items invalide (JSON parsing failed)" });
        return;
      }
    }

    // Vérification que items est un array non vide
    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      res.status(400).json({ success: false, msg: "Items requis (array non vide)" });
      return;
    }

    // Validation de la structure des items
    const validItems = parsedItems.every(item => 
      item.id && item.name && typeof item.quantity === 'number' && typeof item.price === 'number'
    );

    if (!validItems) {
      res.status(400).json({ 
        success: false, 
        msg: "Chaque item doit contenir: id, name, quantity (number), price (number)" 
      });
      return;
    }

    const commande = new Commande({
      tableNumber: parseInt(table_number.toString()),
      orderNumber: order_name || `CMD-${Date.now()}`,
      totalAmount: total_amount?.toString() || "0",
      paymentMethod: payment_method || "Inconnu",
      status: status || "En cours",
      items: parsedItems,
      isRead: false, // Par défaut non lue
    });

    await commande.save();

    console.log("✅ Commande créée:", commande._id.toString());

    res.status(201).json({
      success: true,
      msg: "Commande créée",
      commande_id: commande._id.toString(),
      data: {
        id: commande._id.toString(),
        table_number: commande.tableNumber,
        order_name: commande.orderNumber,
        total_amount: commande.totalAmount,
        payment_method: commande.paymentMethod,
        status: commande.status,
        items: commande.items,
        isRead: commande.isRead,
        created_at: commande.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("❌ Error creating commande:", error);
    
    // Gestion des erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      res.status(400).json({ 
        success: false, 
        msg: "Erreur de validation", 
        errors: messages 
      });
      return;
    }

    res.status(500).json({ 
      success: false, 
      msg: "Server error", 
      error: error.message 
    });
  }
};

// METTRE À JOUR UNE COMMANDE
export const updateCommande = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { table_number, order_name, total_amount, payment_method, status, items, isRead } = req.body;

    const commande = await Commande.findById(id);

    if (!commande) {
      res.status(404).json({ success: false, msg: "Commande non trouvée" });
      return;
    }

    // ✅ Gérer items comme array
    let parsedItems = items;
    if (typeof items === 'string') {
      try {
        parsedItems = JSON.parse(items);
      } catch (e) {
        res.status(400).json({ success: false, msg: "Format items invalide" });
        return;
      }
    }

    // Mise à jour des champs
    if (table_number !== undefined) commande.tableNumber = parseInt(table_number.toString());
    if (order_name !== undefined) commande.orderNumber = order_name;
    if (total_amount !== undefined) commande.totalAmount = total_amount.toString();
    if (payment_method !== undefined) commande.paymentMethod = payment_method;
    if (status !== undefined) commande.status = status;
    if (isRead !== undefined) commande.isRead = isRead;

    await commande.save();

    res.json({
      success: true,
      msg: "Commande mise à jour",
      data: {
        id: commande._id.toString(),
        table_number: commande.tableNumber,
        order_name: commande.orderNumber,
        total_amount: commande.totalAmount,
        payment_method: commande.paymentMethod,
        status: commande.status,
        items: commande.items,
        isRead: commande.isRead,
        updated_at: commande.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error updating commande:", error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      res.status(400).json({ 
        success: false, 
        msg: "Erreur de validation", 
        errors: messages 
      });
      return;
    }

    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// SUPPRIMER UNE COMMANDE
export const deleteCommande = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const commande = await Commande.findByIdAndDelete(id);

    if (!commande) {
      res.status(404).json({ success: false, msg: "Commande non trouvée" });
      return;
    }

    res.json({ success: true, msg: "Commande supprimée" });
  } catch (error) {
    console.error("Error deleting commande:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};