import { Schema, model, Document, Types } from 'mongoose';

export interface IReservation extends Document {
  user: Types.ObjectId;
  book: Types.ObjectId;
  reservedAt: Date;
  deliveredAt: Date | null;
}

const reservationSchema = new Schema<IReservation>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    reservedAt: {
      type: Date,
      default: Date.now
    },
    deliveredAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export const Reservation = model<IReservation>('Reservation', reservationSchema);
