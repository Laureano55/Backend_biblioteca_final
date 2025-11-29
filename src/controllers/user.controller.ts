import { Request, Response } from "express";
import { User } from "../models/user.model";

// ----------------------------------
// CREATE (Registro)
// ----------------------------------
export async function register(req: Request, res: Response) {
  try {
    const { nombre, correo, contraseña, permisos } = req.body;

    const exists = await User.findOne({ correo });
    if (exists) return res.status(400).json({ message: "Correo ya registrado" });

    const user = await User.create({
      nombre,
      correo,
      contraseña, // se hashea en el pre-save
      permisos: permisos || [] // por defecto, sin permisos
    });

    res.status(201).json({ message: "Usuario creado", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
}

// ----------------------------------
// READ (Perfil del usuario autenticado)
// ----------------------------------
export async function getProfile(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "No autenticado" });

    const user = await User.findById(req.user.id).select("-contraseña");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    if (user.enabled === false) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(user);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
}

// ----------------------------------
// UPDATE USER
// Solo el propio usuario o alguien con permiso puede modificar
// ----------------------------------
export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;        // ID del usuario a modificar
    const requester = req.user;       // usuario autenticado

    if (!requester) return res.status(401).json({ message: "No autenticado" });

    const isOwner = requester.id === id;
    const hasPermission = requester.permisos.includes("modifyUsers");

    if (!isOwner && !hasPermission) {
      return res.status(403).json({ message: "No tienes permiso para modificar este usuario" });
    }

    const { nombre, correo, permisos } = req.body;

    const updated = await User.findByIdAndUpdate(
      id,
      { nombre, correo, permisos },
      { new: true }
    ).select("-contraseña");

    res.json({ message: "Usuario actualizado", updated });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
}

// ----------------------------------
// DELETE (Soft delete)
// Solo el propio usuario o alguien con permiso puede eliminar
// ----------------------------------
export async function softDeleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const requester = req.user;

    if (!requester) return res.status(401).json({ message: "No autenticado" });

    const isOwner = requester.id === id;
    const hasPermission = requester.permisos.includes("disableUsers");

    if (!isOwner && !hasPermission) {
      return res.status(403).json({ message: "No tienes permiso para eliminar este usuario" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { enabled: false },
      { new: true }
    );

    res.json({ message: "Usuario inhabilitado", user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
}
