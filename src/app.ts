import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import bookRoutes from "./routes/book.routes";
import reservationRoutes from "./routes/reservation.routes";




const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas
app.use("/auth", authRoutes);
app.use("/usuarios", userRoutes);
app.use("/libros", bookRoutes);
app.use("/", reservationRoutes);



export default app;
