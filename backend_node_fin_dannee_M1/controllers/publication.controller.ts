// src/controllers/publication.controller.ts
import { Request, Response } from "express";
import Publication from "../modals/Publication";

// AFFICHER TOUTES LES PUBLICATIONS
export const getAllPublications = async (req: Request, res: Response): Promise<void> => {
  try {
    const publications = await Publication.find().sort({ createdAt: -1 });

    const data = publications.map((pub) => ({
      id: pub._id.toString(),
      nom: pub.nom,
      description: pub.description,
      prix: pub.prix,
      prixPromo: pub.prixPromo,
      image: pub.image,
      createdAt: pub.createdAt.toISOString(),
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching publications:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// AFFICHER UNE PUBLICATION PAR ID
export const getPublicationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const publication = await Publication.findById(id);

    if (!publication) {
      res.status(404).json({ success: false, msg: "Publication non trouvée" });
      return;
    }

    res.json({
      success: true,
      data: {
        id: publication._id.toString(),
        nom: publication.nom,
        description: publication.description,
        prix: publication.prix,
        prixPromo: publication.prixPromo,
        image: publication.image,
        createdAt: publication.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching publication:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// CRÉER UNE PUBLICATION
export const createPublication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nom, description, prix, prixPromo, image } = req.body;

    // Validation
    if (!description) {
      res.status(400).json({ success: false, msg: "Description requise" });
      return;
    }

    // Validation du prix promo
    if (prixPromo && prix && prixPromo >= prix) {
      res.status(400).json({ 
        success: false, 
        msg: "Le prix promo doit être inférieur au prix normal" 
      });
      return;
    }

    const publication = new Publication({
      nom: nom || null,
      description,
      prix: prix || null,
      prixPromo: prixPromo || null,
      image: image || null,
    });

    await publication.save();

    res.status(201).json({
      success: true,
      msg: "Publication créée",
      data: {
        id: publication._id.toString(),
        nom: publication.nom,
        description: publication.description,
        prix: publication.prix,
        prixPromo: publication.prixPromo,
        image: publication.image,
        createdAt: publication.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating publication:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// METTRE À JOUR UNE PUBLICATION
export const updatePublication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom, description, prix, prixPromo, image } = req.body;

    const publication = await Publication.findById(id);

    if (!publication) {
      res.status(404).json({ success: false, msg: "Publication non trouvée" });
      return;
    }

    // Mise à jour des champs
    if (nom !== undefined) publication.nom = nom;
    if (description !== undefined) publication.description = description;
    if (prix !== undefined) publication.prix = prix;
    if (prixPromo !== undefined) publication.prixPromo = prixPromo;
    if (image !== undefined) publication.image = image;

    // Validation du prix promo
    if (publication.prixPromo && publication.prix && publication.prixPromo >= publication.prix) {
      res.status(400).json({ 
        success: false, 
        msg: "Le prix promo doit être inférieur au prix normal" 
      });
      return;
    }

    await publication.save();

    res.json({
      success: true,
      msg: "Publication mise à jour",
      data: {
        id: publication._id.toString(),
        nom: publication.nom,
        description: publication.description,
        prix: publication.prix,
        prixPromo: publication.prixPromo,
        image: publication.image,
        createdAt: publication.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating publication:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// SUPPRIMER UNE PUBLICATION
export const deletePublication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const publication = await Publication.findByIdAndDelete(id);

    if (!publication) {
      res.status(404).json({ success: false, msg: "Publication non trouvée" });
      return;
    }

    res.json({ success: true, msg: "Publication supprimée" });
  } catch (error) {
    console.error("Error deleting publication:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};