
import pool from "../config/database.js";

// CONSULTAR CLIENTES
export async function listarClientes(req, res) {
    try {
        const [clientes] = await pool.execute(`
            SELECT *
            FROM clientes
            ORDER BY id DESC
        `);

        res.json({
            success: true,
            data: clientes
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error al consultar clientes"
        });
    }
}

// REGISTRAR CLIENTE
export async function crearCliente(req, res) {
    try {
        const {
            tipoDocumento,
            documento,
            nombre,
            correo,
            telefono,
            direccion,
            ciudad
        } = req.body;

        if (
            !tipoDocumento ||
            !documento?.trim() ||
            !nombre?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Completa los campos obligatorios"
            });
        }

        const [resultado] = await pool.execute(
            `INSERT INTO clientes (
                tipo_documento,
                numero_documento,
                razon_social,
                correo,
                telefono,
                direccion,
                ciudad
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                tipoDocumento,
                documento.trim(),
                nombre.trim(),
                correo || null,
                telefono || null,
                direccion || null,
                ciudad || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Cliente registrado correctamente",
            id: resultado.insertId
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "El documento ya está registrado"
            });
        }

        console.error(error);

        res.status(500).json({
            success: false,
            message: "No fue posible registrar el cliente"
        });
    }
}

// ACTUALIZAR CLIENTE
export async function actualizarCliente(req, res) {
    try {
        const { id } = req.params;

        const {
            tipoDocumento,
            documento,
            nombre,
            correo,
            telefono,
            direccion,
            ciudad
        } = req.body;

        if (!tipoDocumento || !documento?.trim() || !nombre?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Completa los campos obligatorios"
            });
        }

        const [resultado] = await pool.execute(
            `UPDATE clientes SET
                tipo_documento = ?,
                numero_documento = ?,
                razon_social = ?,
                correo = ?,
                telefono = ?,
                direccion = ?,
                ciudad = ?
             WHERE id = ? AND activo = TRUE`,
            [
                tipoDocumento,
                documento.trim(),
                nombre.trim(),
                correo || null,
                telefono || null,
                direccion || null,
                ciudad || null,
                id
            ]
        );

        if (!resultado.affectedRows) {
            return res.status(404).json({
                success: false,
                message: "Cliente no encontrado o inactivo"
            });
        }

        res.json({
            success: true,
            message: "Cliente actualizado correctamente"
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "El documento ya pertenece a otro cliente"
            });
        }

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error al actualizar cliente"
        });
    }
}

// DESACTIVAR CLIENTE
export async function desactivarCliente(req, res) {
    try {
        const { id } = req.params;

        const [resultado] = await pool.execute(
            `UPDATE clientes
             SET activo = FALSE
             WHERE id = ? AND activo = TRUE`,
            [id]
        );

        if (!resultado.affectedRows) {
            return res.status(404).json({
                success: false,
                message: "Cliente no encontrado o ya está inactivo"
            });
        }

        res.json({
            success: true,
            message: "Cliente desactivado correctamente"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error al desactivar cliente"
        });
    }
}
