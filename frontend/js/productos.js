/* =================================================
   JLSERVISOFT S.A.S.
   MODULO DE PRODUCTOS Y SERVICIOS
   JavaScript puro - MySQL
================================================= */

const Productos = (() => {

    const API = "http://localhost:3000/api/productos-servicios";

    let listaProductos = [];
    let productoEditando = null;

    // ESCAPAR CARACTERES HTML
    const escapar = (valor) => {
        return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[caracter]);
    };

    // FORMATO MONEDA COLOMBIANA
    const moneda = (valor) => {
        return Number(valor || 0).toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 2
        });
    };

    // MOSTRAR MODULO
    function mostrar(container) {

        container.innerHTML = `
            <div class="module-header">
                <div>
                    <h1>Productos y servicios</h1>
                    <p>Administra los conceptos utilizados en la facturación.</p>
                </div>

                <button class="btn-primary" id="nuevoProducto">
                    + Nuevo registro
                </button>
            </div>

            <div class="client-summary">

                <div class="stat-card">
                    <span>Total registros</span>
                    <h2 id="totalRegistros">0</h2>
                    <small>Registros activos</small>
                </div>

                <div class="stat-card">
                    <span>Productos</span>
                    <h2 id="totalProductos">0</h2>
                    <small>Productos registrados</small>
                </div>

                <div class="stat-card">
                    <span>Servicios</span>
                    <h2 id="totalServicios">0</h2>
                    <small>Servicios registrados</small>
                </div>

            </div>

            <section class="panel">

                <div class="panel-header">
                    <div>
                        <h2>Listado de productos y servicios</h2>
                        <p>Consulta y administra tus conceptos facturables.</p>
                    </div>
                </div>

                <div class="form-grid" style="margin-bottom:20px">

                    <div class="form-group">
                        <label>Buscar registro</label>
                        <input
                            type="search"
                            id="buscarProducto"
                            class="form-control"
                            placeholder="Buscar por código o nombre..."
                        >
                    </div>

                    <div class="form-group">
                        <label>Tipo de registro</label>
                        <select id="filtroTipo" class="form-control">
                            <option value="">Todos</option>
                            <option value="PRODUCTO">Productos</option>
                            <option value="SERVICIO">Servicios</option>
                        </select>
                    </div>

                </div>

                <div class="table-container">
                    <table class="data-table">

                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Precio venta</th>
                                <th>Impuesto</th>
                                <th>Existencias</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody id="tablaProductos">
                            <tr>
                                <td colspan="7" class="empty-table">
                                    Cargando información...
                                </td>
                            </tr>
                        </tbody>

                    </table>
                </div>

            </section>

            <!-- MODAL DE PRODUCTOS -->
            <div class="modal" id="modalProducto">

                <div class="modal-content">

                    <div class="modal-header">
                        <h2 id="tituloProducto">Registrar producto</h2>

                        <button
                            type="button"
                            class="close-modal"
                            id="cerrarProducto">
                            ×
                        </button>
                    </div>

                    <form id="formProducto">

                        <div class="form-grid">

                            <div class="form-group">
                                <label>Tipo *</label>

                                <select id="tipoProducto" required>
                                    <option value="PRODUCTO">Producto</option>
                                    <option value="SERVICIO">Servicio</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Código *</label>

                                <input
                                    id="codigoProducto"
                                    maxlength="50"
                                    required
                                >
                            </div>

                            <div class="form-group full-width">
                                <label>Nombre *</label>

                                <input
                                    id="nombreProducto"
                                    maxlength="150"
                                    required
                                >
                            </div>

                            <div class="form-group full-width">
                                <label>Descripción</label>

                                <textarea
                                    id="descripcionProducto"
                                    rows="2"
                                    maxlength="500">
                                </textarea>
                            </div>

                            <div class="form-group">
                                <label>Categoría</label>

                                <input
                                    id="categoriaProducto"
                                    maxlength="100"
                                >
                            </div>

                            <div class="form-group">
                                <label>Unidad de medida</label>

                                <select id="unidadProducto">
                                    <option value="UND">Unidad</option>
                                    <option value="KG">Kilogramo</option>
                                    <option value="GR">Gramo</option>
                                    <option value="M">Metro</option>
                                    <option value="M2">Metro cuadrado</option>
                                    <option value="M3">Metro cúbico</option>
                                    <option value="LT">Litro</option>
                                    <option value="HR">Hora</option>
                                    <option value="DIA">Día</option>
                                    <option value="SERV">Servicio</option>
                                    <option value="CAJA">Caja</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Precio de compra</label>

                                <input
                                    id="precioCompra"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value="0"
                                >
                            </div>

                            <div class="form-group">
                                <label>Precio de venta *</label>

                                <input
                                    id="precioVenta"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value="0"
                                    required
                                >
                            </div>

                            <div class="form-group">
                                <label>Tipo de impuesto</label>

                                <select id="impuestoTipo">
                                    <option value="IVA">IVA</option>
                                    <option value="INC">Impuesto al consumo</option>
                                    <option value="EXENTO">Exento</option>
                                    <option value="EXCLUIDO">Excluido</option>
                                    <option value="NO_RESPONSABLE">No responsable</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Porcentaje (%)</label>

                                <input
                                    id="porcentajeImpuesto"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value="19"
                                >
                            </div>

                            <div class="form-group full-width"
                                id="grupoInventario">

                                <label style="display:flex;gap:10px;align-items:center">

                                    <input
                                        type="checkbox"
                                        id="controlaInventario"
                                    >

                                    Controlar inventario

                                </label>

                            </div>

                            <div class="form-group" id="grupoStock">
                                <label>Existencias actuales</label>

                                <input
                                    id="stockActual"
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    value="0"
                                >
                            </div>

                            <div class="form-group" id="grupoMinimo">
                                <label>Stock mínimo</label>

                                <input
                                    id="stockMinimo"
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    value="0"
                                >
                            </div>

                        </div>

                        <div class="form-actions">

                            <button
                                type="button"
                                class="btn-secondary"
                                id="cancelarProducto">
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                class="btn-primary">
                                Guardar registro
                            </button>

                        </div>

                    </form>

                </div>
            </div>
        `;

        eventos(container);
        cargarDesdeMySQL(container);
    }

        // EVENTOS DEL MODULO
    function eventos(container) {

        const formulario = container.querySelector("#formProducto");

        container.querySelector("#nuevoProducto")
            .addEventListener("click", () => abrirFormulario(container));

        container.querySelector("#cerrarProducto")
            .addEventListener("click", () => cerrarFormulario(container));

        container.querySelector("#cancelarProducto")
            .addEventListener("click", () => cerrarFormulario(container));

        container.querySelector("#buscarProducto")
            .addEventListener("input", () => actualizarTabla(container));

        container.querySelector("#filtroTipo")
            .addEventListener("change", () => actualizarTabla(container));

        container.querySelector("#tipoProducto")
            .addEventListener("change", () => actualizarInventario(container));

        container.querySelector("#controlaInventario")
            .addEventListener("change", () => actualizarInventario(container));

        formulario.addEventListener("submit", evento => {
            evento.preventDefault();
            guardarProducto(container);
        });

        container.querySelector("#tablaProductos")
            .addEventListener("click", async evento => {

                const boton = evento.target.closest("[data-accion]");

                if (!boton) return;

                const id = Number(boton.dataset.id);

                const producto = listaProductos.find(p => p.id === id);

                if (!producto) return;

                if (boton.dataset.accion === "editar") {
                    abrirFormulario(container, producto);
                }

                if (boton.dataset.accion === "desactivar") {

                    if (!confirm("¿Deseas desactivar este registro?")) {
                        return;
                    }

                    try {

                        const respuesta = await fetch(
                            `${API}/${id}/desactivar`,
                            { method: "PATCH" }
                        );

                        const resultado = await respuesta.json();

                        if (!respuesta.ok) {
                            throw new Error(
                                resultado.message || "Error al desactivar"
                            );
                        }

                        alert(resultado.message);

                        await cargarDesdeMySQL(container);

                    } catch (error) {
                        console.error(error);
                        alert(error.message);
                    }
                }
            });
    }

    // CONTROL DE INVENTARIO
    function actualizarInventario(container) {

        const esProducto =
            container.querySelector("#tipoProducto").value === "PRODUCTO";

        const controla =
            container.querySelector("#controlaInventario").checked;

        container.querySelector("#grupoInventario").style.display =
            esProducto ? "block" : "none";

        container.querySelector("#grupoStock").style.display =
            esProducto && controla ? "block" : "none";

        container.querySelector("#grupoMinimo").style.display =
            esProducto && controla ? "block" : "none";
    }

    // ABRIR FORMULARIO
    function abrirFormulario(container, producto = null) {

        const formulario = container.querySelector("#formProducto");

        productoEditando = producto;

        formulario.reset();

        container.querySelector("#tituloProducto").textContent =
            producto
                ? "Editar producto o servicio"
                : "Registrar producto o servicio";

        container.querySelector("#tipoProducto").value =
            producto?.tipo || "PRODUCTO";

        container.querySelector("#codigoProducto").value =
            producto?.codigo || "";

        container.querySelector("#nombreProducto").value =
            producto?.nombre || "";

        container.querySelector("#descripcionProducto").value =
            producto?.descripcion || "";

        container.querySelector("#categoriaProducto").value =
            producto?.categoria || "";

        container.querySelector("#unidadProducto").value =
            producto?.unidadMedida || "UND";

        container.querySelector("#precioCompra").value =
            producto?.precioCompra ?? 0;

        container.querySelector("#precioVenta").value =
            producto?.precioVenta ?? 0;

        container.querySelector("#impuestoTipo").value =
            producto?.impuestoTipo || "IVA";

        container.querySelector("#porcentajeImpuesto").value =
            producto?.porcentajeImpuesto ?? 19;

        container.querySelector("#controlaInventario").checked =
            producto?.controlaInventario ?? false;

        container.querySelector("#stockActual").value =
            producto?.stockActual ?? 0;

        container.querySelector("#stockMinimo").value =
            producto?.stockMinimo ?? 0;

        actualizarInventario(container);

        container.querySelector("#modalProducto")
            .classList.add("visible");
    }

    // CERRAR FORMULARIO
    function cerrarFormulario(container) {

        container.querySelector("#modalProducto")
            .classList.remove("visible");

        productoEditando = null;
    }

    // GUARDAR PRODUCTO O SERVICIO
    async function guardarProducto(container) {

        const tipo = container.querySelector("#tipoProducto").value;

        const controlaInventario =
            tipo === "PRODUCTO" &&
            container.querySelector("#controlaInventario").checked;

        const producto = {

            tipo,

            codigo: container.querySelector("#codigoProducto")
                .value.trim(),

            nombre: container.querySelector("#nombreProducto")
                .value.trim(),

            descripcion: container.querySelector("#descripcionProducto")
                .value.trim(),

            categoria: container.querySelector("#categoriaProducto")
                .value.trim(),

            unidadMedida: container.querySelector("#unidadProducto").value,

            precioCompra: Number(
                container.querySelector("#precioCompra").value
            ),

            precioVenta: Number(
                container.querySelector("#precioVenta").value
            ),

            impuestoTipo: container.querySelector("#impuestoTipo").value,

            porcentajeImpuesto: Number(
                container.querySelector("#porcentajeImpuesto").value
            ),

            controlaInventario,

            stockActual: controlaInventario
                ? Number(container.querySelector("#stockActual").value)
                : 0,

            stockMinimo: controlaInventario
                ? Number(container.querySelector("#stockMinimo").value)
                : 0
        };

        if (!producto.codigo || !producto.nombre) {
            alert("Completa el código y nombre del registro.");
            return;
        }

        const numeros = [
            producto.precioCompra,
            producto.precioVenta,
            producto.porcentajeImpuesto,
            producto.stockActual,
            producto.stockMinimo
        ];

        if (
            !numeros.every(Number.isFinite) ||
            numeros.some(n => n < 0) ||
            producto.porcentajeImpuesto > 100
        ) {
            alert("Verifica los valores numéricos ingresados.");
            return;
        }

        try {

            const url = productoEditando
                ? `${API}/${productoEditando.id}`
                : API;

            const respuesta = await fetch(url, {

                method: productoEditando ? "PUT" : "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(producto)
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    resultado.message || "Error al guardar"
                );
            }

            alert(
                resultado.message ||
                "Registro guardado correctamente."
            );

            cerrarFormulario(container);

            await cargarDesdeMySQL(container);

        } catch (error) {

            console.error("Error al guardar producto:", error);

            alert(error.message);
        }
    }

        // CARGAR PRODUCTOS DESDE MYSQL
    async function cargarDesdeMySQL(container) {

        const tabla = container.querySelector("#tablaProductos");

        try {

            tabla.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-table">
                        Consultando información de MySQL...
                    </td>
                </tr>
            `;

            const respuesta = await fetch(API);

            if (!respuesta.ok) {
                throw new Error(
                    "No fue posible consultar los registros."
                );
            }

            const resultado = await respuesta.json();

            if (
                !resultado.success ||
                !Array.isArray(resultado.data)
            ) {
                throw new Error(
                    "La respuesta del servidor no es válida."
                );
            }

            listaProductos = resultado.data.map(p => ({

                id: Number(p.id),

                tipo: p.tipo,

                codigo: p.codigo,

                nombre: p.nombre,

                descripcion: p.descripcion || "",

                categoria: p.categoria || "",

                unidadMedida: p.unidad_medida || "UND",

                precioCompra: Number(p.precio_compra || 0),

                precioVenta: Number(p.precio_venta || 0),

                impuestoTipo: p.impuesto_tipo || "IVA",

                porcentajeImpuesto:
                    Number(p.porcentaje_impuesto || 0),

                controlaInventario:
                    Boolean(p.controla_inventario),

                stockActual: Number(p.stock_actual || 0),

                stockMinimo: Number(p.stock_minimo || 0),

                activo: Boolean(p.activo)

            }));

            actualizarTabla(container);

            console.log("Productos cargados:", listaProductos);

        } catch (error) {

            console.error("ERROR AL CARGAR PRODUCTOS:", error);

            tabla.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-table">
                        No se pudo cargar la información de MySQL.
                    </td>
                </tr>
            `;

            alert(error.message);
        }
    }

    // ACTUALIZAR TABLA
    function actualizarTabla(container) {

        const tabla = container.querySelector("#tablaProductos");

        const busqueda = container.querySelector("#buscarProducto")
            .value.toLowerCase().trim();

        const filtro = container.querySelector("#filtroTipo").value;

        const activos = listaProductos.filter(p => p.activo);

        const filtrados = activos.filter(p => {

            const coincideBusqueda =
                String(p.nombre).toLowerCase().includes(busqueda) ||
                String(p.codigo).toLowerCase().includes(busqueda);

            const coincideTipo =
                !filtro || p.tipo === filtro;

            return coincideBusqueda && coincideTipo;
        });

        // ACTUALIZAR RESUMEN
        container.querySelector("#totalRegistros").textContent =
            activos.length;

        container.querySelector("#totalProductos").textContent =
            activos.filter(p => p.tipo === "PRODUCTO").length;

        container.querySelector("#totalServicios").textContent =
            activos.filter(p => p.tipo === "SERVICIO").length;

        // SI NO HAY REGISTROS
        if (!filtrados.length) {

            tabla.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-table">
                        No se encontraron registros.
                    </td>
                </tr>
            `;

            return;
        }

        // CONSTRUIR TABLA
        tabla.innerHTML = filtrados.map(producto => `

            <tr>

                <td>
                    ${escapar(producto.codigo)}
                </td>

                <td>
                    <strong>
                        ${escapar(producto.nombre)}
                    </strong>
                </td>

                <td>
                    <span class="status-badge">
                        ${
                            producto.tipo === "PRODUCTO"
                                ? "Producto"
                                : "Servicio"
                        }
                    </span>
                </td>

                <td>
                    ${moneda(producto.precioVenta)}
                </td>

                <td>
                    ${escapar(producto.impuestoTipo)}
                    (${producto.porcentajeImpuesto}%)
                </td>

                <td>
                    ${
                        producto.tipo === "PRODUCTO" &&
                        producto.controlaInventario
                            ? escapar(producto.stockActual)
                            : "-"
                    }
                </td>

                <td>

                    <button
                        class="action-btn"
                        data-accion="editar"
                        data-id="${producto.id}">
                        Editar
                    </button>

                    <button
                        class="action-btn danger"
                        data-accion="desactivar"
                        data-id="${producto.id}">
                        Desactivar
                    </button>

                </td>

            </tr>

        `).join("");
    }

    // EXPORTAR MODULO
    return {
        mostrar
    };

})();