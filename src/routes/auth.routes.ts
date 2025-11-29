import { Router } from "express";
import { login } from "../controllers/auth.controller";
import { register } from "../controllers/user.controller";

const router = Router();

// Registro
router.post("/register", register);

// Login
router.post("/login", login);

export default router;
