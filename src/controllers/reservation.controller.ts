import { Request, Response } from "express";
import { Reservation } from "../models/reservation.model";
import { Book } from "../models/book.model";
import { User } from "../models/user.model";
import mongoose from "mongoose";

// POST /libros/:id/reservar
export async function createReservation(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "No autenticado" });

    const userId = req.user.id;
    const bookId = req.params.id;

    // validaciones básicas
    const book = await Book.findOne({ _id: bookId, enabled: true });
    if (!book) return res.status(404).json({ message: "Libro no encontrado" });
    if (!book.disponibilidad) return res.status(400).json({ message: "Libro no disponible" });

    // crear reserva (sin transacciones para entornos sin replica set)
    const reservation = await Reservation.create({
      user: userId,
      book: bookId,
      reservedAt: new Date(),
      deliveredAt: null
    });

    // marcar libro como no disponible
    book.disponibilidad = false;
    await book.save();

    const populated = await Reservation.findById(reservation._id).populate({
      path: "book user",
      select: "nombre autor correo"
    });

    return res.status(201).json({ message: "Reserva creada", reserva: populated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al crear reserva" });
  }
}

// POST /reservas/:id/entregar
export async function deliverReservation(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "No autenticado" });

    const reservationId = req.params.id;
    const requester = req.user;

    const reservation = await Reservation.findById(reservationId).populate("book user");
    if (!reservation) return res.status(404).json({ message: "Reserva no encontrada" });

    // solo el que reservó o usuario con permiso modifyBooks puede marcar entrega
    const isOwner = reservation.user && (reservation.user as any)._id.toString() === requester.id;
    const hasPermission = requester.permisos.includes("modifyBooks");

    if (!isOwner && !hasPermission) {
      return res.status(403).json({ message: "No tienes permiso para entregar esta reserva" });
    }

    if (reservation.deliveredAt) {
      return res.status(400).json({ message: "Reserva ya fue entregada" });
    }

    // marcar entregada y poner libro disponible (sin transacciones)
    reservation.deliveredAt = new Date();
    await reservation.save();

    // volver a poner el libro disponible
    const bookId = (reservation.book as any)._id;
    const book = await Book.findById(bookId);
    if (book) {
      book.disponibilidad = true;
      await book.save();
    }

    const populated = await Reservation.findById(reservation._id).populate({
      path: "book user",
      select: "nombre autor correo"
    });

    return res.json({ message: "Reserva entregada", reserva: populated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al entregar reserva" });
  }
}

// GET /usuarios/:id/reservas  => historial de un usuario
export async function getReservationsByUser(req: Request, res: Response) {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    if (user.enabled === false) return res.status(404).json({ message: "Usuario no encontrado" });

    const reservas = await Reservation.find({ user: userId })
      .populate({ path: "book", select: "nombre autor fechaPublicacion editorial" })
      .sort({ reservedAt: -1 });

    return res.json({ reservas });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener historial de usuario" });
  }
}

// GET /libros/:id/reservas => historial de un libro
export async function getReservationsByBook(req: Request, res: Response) {
  try {
    const bookId = req.params.id;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Libro no encontrado" });
    if (book.enabled === false) return res.status(404).json({ message: "Libro no encontrado" });

    const reservas = await Reservation.find({ book: bookId })
      .populate({ path: "user", select: "nombre correo" })
      .sort({ reservedAt: -1 });

    return res.json({ reservas });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener historial de libro" });
  }
}
