
import { Router } from "express";

import {
    listarClientes,
    crearCliente,
    actualizarCliente,
    desactivarCliente
} from "../controllers/clientes.controller.js";

const router = Router();

router.get("/", listarClientes);
router.post("/", crearCliente);
router.put("/:id", actualizarCliente);
router.patch("/:id/desactivar", desactivarCliente);

export default router;
