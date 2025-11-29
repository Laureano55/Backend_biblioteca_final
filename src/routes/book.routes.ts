import { Router } from "express";
import {
  createBook,
  getBook,
  getBooks,
  updateBook,
  softDeleteBook
} from "../controllers/book.controller";

import { authMiddleware } from "../middleware/auth";
import { requirePermission } from "../middleware/permissions";

const router = Router();

// Crear libro
router.post(
  "/",
  authMiddleware,
  requirePermission(["createBooks", "modifyBooks"]),
  createBook
);

// Leer 1 libro
router.get("/:id", getBook);

// Leer libros (filtros + paginación)
router.get("/", getBooks);

// Update libro
router.put(
  "/:id",
  authMiddleware,
  requirePermission("modifyBooks"),
  updateBook
);

// Soft delete
router.delete(
  "/:id",
  authMiddleware,
  requirePermission("disableBooks"),
  softDeleteBook
);

export default router;
