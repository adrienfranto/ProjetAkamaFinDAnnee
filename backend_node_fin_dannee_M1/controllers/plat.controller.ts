import { Request, Response } from "express";
import Plat from "../modals/Plat";

// AFFICHER TOUS LES PLATS
export const getAllPlats = async (req: Request, res: Response): Promise<void> => {
  try {
    const plats = await Plat.find().sort({ createdAt: -1 });

    const data = plats.map((plat) => ({
      id: plat._id.toString(),
      nom: plat.nom,
      description: plat.description,
      prix: plat.prix,
      prixPromo: plat.prixPromo,
      image: plat.image,
    }));

    res.status(200).json({ success: true, plats: data });
  } catch (error) {
    console.error("Error fetching plats:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// AFFICHER UN PLAT PAR ID
export const getPlatById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const plat = await Plat.findById(id);

    if (!plat) {
      res.status(404).json({ success: false, msg: "Plat non trouvé" });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: plat._id.toString(),
        nom: plat.nom,
        description: plat.description,
        prix: plat.prix,
        prixPromo: plat.prixPromo,
        image: plat.image,
      },
    });
  } catch (error) {
    console.error("Error fetching plat:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// CRÉER UN PLAT
export const createPlat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nom, description, prix, prixPromo, image } = req.body;

    if (!nom || !description || prix === undefined || !image) {
      res.status(400).json({ success: false, msg: "Champs requis: nom, description, prix, image" });
      return;
    }

    const plat = new Plat({
      nom,
      description,
      prix,
      prixPromo: prixPromo || null,
      image,
    });

    await plat.save();

    res.status(201).json({
      success: true,
      msg: "Plat créé",
      data: {
        id: plat._id.toString(),
        nom: plat.nom,
        description: plat.description,
        prix: plat.prix,
        prixPromo: plat.prixPromo,
        image: plat.image,
      },
    });
  } catch (error) {
    console.error("Error creating plat:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// METTRE À JOUR UN PLAT
export const updatePlat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom, description, prix, prixPromo, image } = req.body;

    const plat = await Plat.findById(id);

    if (!plat) {
      res.status(404).json({ success: false, msg: "Plat non trouvé" });
      return;
    }

    if (nom !== undefined) plat.nom = nom;
    if (description !== undefined) plat.description = description;
    if (prix !== undefined) plat.prix = prix;
    if (prixPromo !== undefined) plat.prixPromo = prixPromo;
    if (image !== undefined) plat.image = image;

    await plat.save();

    res.status(200).json({
      success: true,
      msg: "Plat mis à jour",
      data: {
        id: plat._id.toString(),
        nom: plat.nom,
        description: plat.description,
        prix: plat.prix,
        prixPromo: plat.prixPromo,
        image: plat.image,
      },
    });
  } catch (error) {
    console.error("Error updating plat:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// SUPPRIMER UN PLAT
export const deletePlat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const plat = await Plat.findByIdAndDelete(id);

    if (!plat) {
      res.status(404).json({ success: false, msg: "Plat non trouvé" });
      return;
    }

    res.status(200).json({ success: true, msg: "Plat supprimé" });
  } catch (error) {
    console.error("Error deleting plat:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};