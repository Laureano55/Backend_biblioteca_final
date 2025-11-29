import { Router } from "express";
import { register, getProfile, updateUser, softDeleteUser } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();


// Perfil (protegido)
router.get("/me", authMiddleware, getProfile);

// Modificar usuario
router.put("/:id", authMiddleware, updateUser);

// Soft delete
router.delete("/:id", authMiddleware, softDeleteUser);

export default router;
