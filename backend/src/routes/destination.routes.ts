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

router.get("/", getAllDestinations);
//GET /destinations/:id

router.get("/:id", getDestinationById);

//GET /destinations?category=NATURE

router.get("/destinations/category/:category", getDestinationByCategory);

//POST /destinations
router.post("/destinations", createDestination);

router.post("/favorite/:destinationId",addToFavorites);

router.delete("/favorite/:destinationId",removeFromFavorites);

router.get("/favorites", getUserFavorites)

export default router;
