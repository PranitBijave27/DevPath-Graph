import { Router } from "express";
import {
  health,
  overview,
  roles,
  roleDetails,
  searchSkills,
  skillDetails,
  graphForRole
} from "../controllers/graphController.js";

const router = Router();

router.get("/health", health);
router.get("/overview", overview);
router.get("/roles", roles);
router.get("/roles/:role", roleDetails);
router.get("/skills/search", searchSkills);
router.get("/skills/:skill", skillDetails);
router.get("/graph/role/:role", graphForRole);

export default router;
