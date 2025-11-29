import { Schema, model, Document } from 'mongoose';

export interface IBook extends Document {
  nombre: string;
  autor: string;
  fechaPublicacion: Date;
  genero: string;
  editorial: string;
  disponibilidad: boolean;
  enabled: boolean;
}

const bookSchema = new Schema<IBook>(
  {
    nombre: {
      type: String,
      required: true
    },
    autor: {
      type: String,
      required: true
    },
    fechaPublicacion: {
      type: Date,
      required: true
    },
    genero: {
      type: String,
      required: true
    },
    editorial: {
      type: String,
      required: true
    },
    disponibilidad: {
      type: Boolean,
      default: true
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

export const Book = model<IBook>("Book", bookSchema);
