// src/routes/publication.routes.ts
import { Router } from "express";
import {
  getAllPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
} from "../controllers/publication.controller";

const router = Router();

router.get("/", getAllPublications);
router.get("/:id", getPublicationById);
router.post("/", createPublication);
router.put("/:id", updatePublication);
router.delete("/:id", deletePublication);

export default router;