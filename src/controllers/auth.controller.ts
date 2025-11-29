import { Request, Response } from "express";
import { User } from "../models/user.model";
import { signToken } from "../middleware/jwt";

export async function login(req: Request, res: Response) {
  try {
    const { correo, contraseña } = req.body;

    const user = await User.findOne({ correo, enabled: true });
    if (!user) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    const valid = await user.comparePassword(contraseña);
    if (!valid) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    const token = signToken({
      id: user._id.toString(),
      correo: user.correo,
      permisos: user.permisos, // necesario para permisos
    });

    // 🔥 necesario para que los tests funcionen
    return res.json({
      token,
      user: {
        _id: user._id,
        correo: user.correo,
        permisos: user.permisos
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error del servidor" });
  }
}
