import { Router } from "express";
import {
  createDestination,
  getAllDestinations,
  getDestinationByCategory,
  getDestinationById,
} from "../controllers/destinations.controller";
const router = Router();

router.get("/", getAllDestinations);
//GET /destinations/:id

router.get("/:id", getDestinationById);

//GET /destinations?category=NATURE

router.get("/destinations/category/:category", getDestinationByCategory);

//POST /destinations
router.post("/destinations", createDestination);

export default router;
