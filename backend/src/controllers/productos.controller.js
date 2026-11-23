
import pool from "../config/database.js";

// LISTAR PRODUCTOS Y SERVICIOS
export async function listarProductos(req, res) {
    try {
        const [productos] = await pool.execute(`
            SELECT *
            FROM productos_servicios
            ORDER BY id DESC
        `);

        res.json({
            success: true,
            data: productos
        });

    } catch (error) {
        console.error("Error al listar productos:", error);

        res.status(500).json({
            success: false,
            message: "Error al consultar productos y servicios"
        });
    }
}

// REGISTRAR PRODUCTO O SERVICIO
export async function crearProducto(req, res) {
    try {
        const {
            tipo,
            codigo,
            nombre,
            descripcion,
            categoria,
            unidadMedida,
            precioCompra,
            precioVenta,
            impuestoTipo,
            porcentajeImpuesto,
            controlaInventario,
            stockActual,
            stockMinimo
        } = req.body;

        if (
            !["PRODUCTO", "SERVICIO"].includes(tipo) ||
            !codigo?.trim() ||
            !nombre?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Completa los campos obligatorios"
            });
        }

        const compra = Number(precioCompra ?? 0);
        const venta = Number(precioVenta ?? 0);
        const impuesto = Number(porcentajeImpuesto ?? 0);
        const stock = Number(stockActual ?? 0);
        const minimo = Number(stockMinimo ?? 0);

        if (
            ![compra, venta, impuesto, stock, minimo].every(Number.isFinite) ||
            compra < 0 || venta < 0 ||
            impuesto < 0 || impuesto > 100 ||
            stock < 0 || minimo < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Verifica los precios, impuestos y existencias"
            });
        }

        const controla = tipo === "PRODUCTO" &&
            Boolean(controlaInventario);

        const [resultado] = await pool.execute(
            `INSERT INTO productos_servicios (
                tipo,
                codigo,
                nombre,
                descripcion,
                categoria,
                unidad_medida,
                precio_compra,
                precio_venta,
                impuesto_tipo,
                porcentaje_impuesto,
                controla_inventario,
                stock_actual,
                stock_minimo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                tipo,
                codigo.trim(),
                nombre.trim(),
                descripcion || null,
                categoria || null,
                unidadMedida || "UND",
                compra,
                venta,
                impuestoTipo || "IVA",
                impuesto,
                controla,
                controla ? stock : 0,
                controla ? minimo : 0
            ]
        );

        res.status(201).json({
            success: true,
            message: "Producto o servicio registrado correctamente",
            id: resultado.insertId
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "El código ya está registrado"
            });
        }

        console.error("Error al registrar:", error);

        res.status(500).json({
            success: false,
            message: "No fue posible registrar el producto o servicio"
        });
    }
}

// ACTUALIZAR PRODUCTO O SERVICIO
export async function actualizarProducto(req, res) {
    try {
        const { id } = req.params;

        const {
            tipo,
            codigo,
            nombre,
            descripcion,
            categoria,
            unidadMedida,
            precioCompra,
            precioVenta,
            impuestoTipo,
            porcentajeImpuesto,
            controlaInventario,
            stockActual,
            stockMinimo
        } = req.body;

        if (
            !["PRODUCTO", "SERVICIO"].includes(tipo) ||
            !codigo?.trim() ||
            !nombre?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Completa los campos obligatorios"
            });
        }

        const compra = Number(precioCompra ?? 0);
        const venta = Number(precioVenta ?? 0);
        const impuesto = Number(porcentajeImpuesto ?? 0);
        const stock = Number(stockActual ?? 0);
        const minimo = Number(stockMinimo ?? 0);

        if (
            ![compra, venta, impuesto, stock, minimo].every(Number.isFinite) ||
            compra < 0 || venta < 0 ||
            impuesto < 0 || impuesto > 100 ||
            stock < 0 || minimo < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Verifica los precios, impuestos y existencias"
            });
        }

        const controla = tipo === "PRODUCTO" &&
            Boolean(controlaInventario);

        const [resultado] = await pool.execute(
            `UPDATE productos_servicios SET
                tipo = ?,
                codigo = ?,
                nombre = ?,
                descripcion = ?,
                categoria = ?,
                unidad_medida = ?,
                precio_compra = ?,
                precio_venta = ?,
                impuesto_tipo = ?,
                porcentaje_impuesto = ?,
                controla_inventario = ?,
                stock_actual = ?,
                stock_minimo = ?
             WHERE id = ? AND activo = TRUE`,
            [
                tipo,
                codigo.trim(),
                nombre.trim(),
                descripcion || null,
                categoria || null,
                unidadMedida || "UND",
                compra,
                venta,
                impuestoTipo || "IVA",
                impuesto,
                controla,
                controla ? stock : 0,
                controla ? minimo : 0,
                id
            ]
        );

        if (!resultado.affectedRows) {
            return res.status(404).json({
                success: false,
                message: "Registro no encontrado o inactivo"
            });
        }

        res.json({
            success: true,
            message: "Registro actualizado correctamente"
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "El código ya pertenece a otro registro"
            });
        }

        console.error("Error al actualizar:", error);

        res.status(500).json({
            success: false,
            message: "Error al actualizar el registro"
        });
    }
}

// DESACTIVAR PRODUCTO O SERVICIO
export async function desactivarProducto(req, res) {
    try {
        const { id } = req.params;

        const [resultado] = await pool.execute(
            `UPDATE productos_servicios
             SET activo = FALSE
             WHERE id = ? AND activo = TRUE`,
            [id]
        );

        if (!resultado.affectedRows) {
            return res.status(404).json({
                success: false,
                message: "Registro no encontrado o ya está inactivo"
            });
        }

        res.json({
            success: true,
            message: "Registro desactivado correctamente"
        });

    } catch (error) {
        console.error("Error al desactivar:", error);

        res.status(500).json({
            success: false,
            message: "Error al desactivar el registro"
        });
    }
}
