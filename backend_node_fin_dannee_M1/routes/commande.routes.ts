import { Router } from "express";
import {
  getAllCommandes,
  getCommandeById,
  createCommande,
  updateCommande,
  deleteCommande,
} from "../controllers/commande.controller";

const router = Router();

router.get("/", getAllCommandes);
router.get("/:id", getCommandeById);
router.post("/", createCommande);
router.put("/:id", updateCommande);
router.delete("/:id", deleteCommande);

export default router;