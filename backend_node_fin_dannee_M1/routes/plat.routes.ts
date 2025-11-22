import { Router } from "express";
import {
  getAllPlats,
  getPlatById,
  createPlat,
  updatePlat,
  deletePlat,
} from "../controllers/plat.controller";

const router = Router();

router.get("/", getAllPlats);
router.get("/:id", getPlatById);
router.post("/", createPlat);
router.put("/:id", updatePlat);
router.delete("/:id", deletePlat);

export default router;