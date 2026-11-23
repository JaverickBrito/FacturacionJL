
import { Router } from "express";

import {
    listarProductos,
    crearProducto,
    actualizarProducto,
    desactivarProducto
} from "../controllers/productos.controller.js";

const router = Router();

router.get("/", listarProductos);
router.post("/", crearProducto);
router.put("/:id", actualizarProducto);
router.patch("/:id/desactivar", desactivarProducto);

export default router;
