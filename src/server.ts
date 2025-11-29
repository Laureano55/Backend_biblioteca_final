// Load environment variables as early as possible. Use require so this runs
// before other imports (prevents import-hoisting from importing modules
// that rely on env vars before dotenv runs).
require("dotenv").config();

import mongoose from "mongoose";
import app from "./app";


if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3000;

  mongoose
    .connect(process.env.MONGO_URI!)
    .then(() => {
      console.log("MongoDB conectado");
      app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
    })
    .catch((err) => console.error("Error conectando a MongoDB", err));
}
