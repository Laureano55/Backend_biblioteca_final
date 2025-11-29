import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export type UserPermission =
  | "createBooks"
  | "modifyBooks"
  | "modifyUsers"
  | "disableUsers"
  | "disableBooks";

export interface IUser extends Document {
  nombre: string;
  correo: string;
  contraseña: string;
  permisos: UserPermission[];
  enabled: boolean;
  comparePassword(input: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    nombre: {
      type: String,
      required: true
    },
    correo: {
      type: String,
      required: true,
      unique: true
    },
    contraseña: {
      type: String,
      required: true
    },
    permisos: {
      type: [String],
      default: []
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Hash antes de guardar
userSchema.pre<IUser>("save", async function () {
  if (!this.isModified("contraseña")) return;

  this.contraseña = await bcrypt.hash(this.contraseña, 10);
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = function (input: string) {
  return bcrypt.compare(input, this.contraseña);
};

export const User = model<IUser>("User", userSchema);
