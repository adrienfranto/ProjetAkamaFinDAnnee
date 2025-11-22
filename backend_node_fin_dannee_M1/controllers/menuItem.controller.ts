import { Request, Response } from "express";
import MenuItem from "../modals/MenuItem";

// AFFICHER TOUS LES MENUS
export const getAllMenuItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const menuItems = await MenuItem.find().sort({ createdAt: -1 });

    const data = menuItems.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
    }));

    res.json({ success: true, menu: data });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// CRÉER UN MENU
export const createMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, image } = req.body;

    if (!name || !description || price === undefined) {
      res.status(400).json({ success: false, msg: "Champs requis: name, description, price" });
      return;
    }

    const item = new MenuItem({
      name,
      description,
      price,
      image: image || null,
    });

    await item.save();

    res.status(201).json({
      success: true,
      msg: "Produit ajouté",
      item: {
        id: item._id.toString(),
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
      },
    });
  } catch (error) {
    console.error("Error creating menu item:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// METTRE À JOUR UN MENU
export const updateMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, image } = req.body;

    const item = await MenuItem.findById(id);

    if (!item) {
      res.status(404).json({ success: false, msg: "Plat non trouvé" });
      return;
    }

    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (image !== undefined) item.image = image;

    await item.save();

    res.json({
      success: true,
      msg: "Plat mis à jour",
      item: {
        id: item._id.toString(),
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
      },
    });
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// SUPPRIMER UN MENU
export const deleteMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const item = await MenuItem.findByIdAndDelete(id);

    if (!item) {
      res.status(404).json({ success: false, msg: "Plat non trouvé" });
      return;
    }

    res.json({ success: true, msg: "Plat supprimé" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};