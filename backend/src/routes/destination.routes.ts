import { Router } from "express";
import {
  addToFavorites,
  createDestination,
  getAllDestinations,
  getDestinationByCategory,
  getDestinationById,
  getUserFavorites,
  removeFromFavorites,
} from "../controllers/destinations.controller";

const router = Router();

// GET /destinations
router.get("/", getAllDestinations);

// GET /destinations/category/:category
router.get("/category/:category", getDestinationByCategory);

// POST /destinations
router.post("/", createDestination);

// Favorites
router.post("/favorite/:destinationId", addToFavorites);

router.delete("/favorite/:destinationId", removeFromFavorites);

// GET /destinations/favorites
router.get("/favorites", getUserFavorites);

// GET /destinations/:id
router.get("/:id", getDestinationById);

export default router;