import { Router } from "express";
import {
  createReservation,
  deliverReservation,
  getReservationsByUser,
  getReservationsByBook
} from "../controllers/reservation.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Reservar un libro (autenticado)
router.post("/libros/:id/reservar", authMiddleware, createReservation);

// Entregar reserva (autenticado; owner o permiso modifyBooks)
router.post("/reservas/:id/entregar", authMiddleware, deliverReservation);

// Historial por usuario
router.get("/usuarios/:id/reservas", authMiddleware, getReservationsByUser);

// Historial por libro
router.get("/libros/:id/reservas", authMiddleware, getReservationsByBook);

export default router;
