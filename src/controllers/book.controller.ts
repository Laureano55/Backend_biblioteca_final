import { Request, Response } from "express";
import { Book } from "../models/book.model";


export async function createBook(req: Request, res: Response) {
  try {
    const { nombre, autor, fechaPublicacion, genero, editorial } = req.body;

    const libro = await Book.create({
      nombre,
      autor,
      fechaPublicacion: new Date(fechaPublicacion),
      genero,
      editorial,
      disponibilidad: true,
      enabled: true
    });

    res.status(201).json({ message: "Libro creado", libro });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear libro" });
  }
}


export async function getBook(req: Request, res: Response) {
  try {
    const { id } = req.params;

    console.log("getBook: buscar libro id=", id);

    const libro = await Book.findById(id);

    console.log("getBook: encontrado=", !!libro, "enabled=", libro ? libro.enabled : undefined);

    if (!libro || libro.enabled === false) return res.status(404).json({ message: "Libro no encontrado" });

    res.json(libro);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener libro" });
  }
}


export async function getBooks(req: Request, res: Response) {
  try {
    const {
      genero,
      fechaPublicacion,
      editorial,
      autor,
      nombre,
      disponibilidad,
      page = 1,
      limit = 10
    } = req.query;

    // Filtros dinámicos
    const filtros: any = { enabled: true };

    if (genero) filtros.genero = genero;
    if (editorial) filtros.editorial = editorial;
    if (autor) filtros.autor = autor;
    if (nombre) filtros.nombre = new RegExp(nombre as string, "i");
    if (fechaPublicacion) filtros.fechaPublicacion = fechaPublicacion;
    if (disponibilidad) filtros.disponibilidad = disponibilidad === "true";

    const skip = (Number(page) - 1) * Number(limit);

    const libros = await Book.find(filtros)
      .select("nombre") // SOLO el nombre (requisito del proyecto)
      .skip(skip)
      .limit(Number(limit));

    const total = await Book.countDocuments(filtros);

    res.json({
      libros,
      paginacion: {
        paginaActual: Number(page),
        librosPorPagina: Number(limit),
        paginaMaxima: Math.ceil(total / Number(limit)),
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener libros" });
  }
}


export async function updateBook(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const updated = await Book.findByIdAndUpdate(id, req.body, {
      new: true
    });

    if (!updated) return res.status(404).json({ message: "Libro no encontrado" });

    res.json({ message: "Libro actualizado", updated });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar libro" });
  }
}


export async function softDeleteBook(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const updated = await Book.findByIdAndUpdate(
      id,
      { enabled: false },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Libro no encontrado" });

    res.json({ message: "Libro inhabilitado", updated });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar libro" });
  }
}
