
import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";

import pool from "./config/database.js";
import clientesRoutes from "./routes/clientes.routes.js";
import productosRoutes from "./routes/productos.routes.js";
const app = express();

app.use(helmet());

app.use(cors({
    origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
    res.json({
        empresa: "JLSERVISOFT S.A.S.",
        sistema: "Facturación",
        estado: "Activo"
    });
});

app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            success: true,
            servidor: "Conectado",
            baseDatos: "MySQL conectada"
        });

    } catch (error) {
        console.error("Error MySQL:", error.message);

        res.status(503).json({
            success: false,
            message: "No se pudo conectar con MySQL"
        });
    }
});

app.use("/api/clientes", clientesRoutes);
app.use("/api/productos-servicios", productosRoutes);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`JLSERVISOFT activo en puerto ${PORT}`);
});
