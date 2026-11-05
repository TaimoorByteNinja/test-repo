import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  addNewConfiguration,
  getAllConfigurations,
  getSingleConfiguration,
  updateConfiguration,
  deleteConfiguration,
} from "../controllers/configurationController.js";

// KAN-20: all configuration endpoints sit behind the authentication middleware,
// so req.user is always populated in the controller.
const router = Router();
router.use(authenticate);

router.post("/", addNewConfiguration);
router.get("/", getAllConfigurations);
router.get("/:configurationId", getSingleConfiguration);
router.put("/:configurationId", updateConfiguration);
router.patch("/:configurationId", updateConfiguration);
router.delete("/:configurationId", deleteConfiguration);

export default router;
