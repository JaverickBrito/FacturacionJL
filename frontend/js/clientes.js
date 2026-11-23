
/* =====================================
   JLSERVISOFT - MODULO DE CLIENTES
   JavaScript puro
===================================== */

const Clientes = (() => {

    let listaClientes = [];
    let clienteEditando = null;

    const formatoFecha = () => {
        return new Date().toLocaleDateString("es-CO");
    };

    const escapar = (valor) => {
        return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[caracter]);
    };

    function mostrar(container) {

        container.innerHTML = `
            <div class="module-header">
                <div>
                    <h1>Gestión de clientes</h1>
                    <p>Administra los clientes de JLSERVISOFT S.A.S.</p>
                </div>

                <button class="btn-primary" id="nuevoCliente">
                    + Nuevo cliente
                </button>
            </div>

            <div class="client-summary">
                <div class="stat-card">
                    <span>Total de clientes</span>
                    <h2 id="totalClientes">0</h2>
                    <small>Registros activos</small>
                </div>
            </div>

            <section class="panel">

                <div class="panel-header">
                    <div>
                        <h2>Listado de clientes</h2>
                        <p>Consulta y administra tus registros.</p>
                    </div>
                </div>

                <input
                    type="search"
                    id="buscarCliente"
                    class="form-control search-control"
                    placeholder="Buscar por nombre o identificación..."
                >

                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Identificación</th>
                                <th>Cliente</th>
                                <th>Correo</th>
                                <th>Teléfono</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody id="tablaClientes"></tbody>
                    </table>
                </div>

            </section>

            <div class="modal" id="modalCliente">
                <div class="modal-content">

                    <div class="modal-header">
                        <h2 id="tituloFormulario">Registrar cliente</h2>
                        <button class="close-modal" id="cerrarModal">
                            ×
                        </button>
                    </div>

                    <form id="formCliente">

                        <div class="form-grid">

                            <div class="form-group">
                                <label>Tipo de documento *</label>
                                <select id="tipoDocumento" required>
                                    <option value="CC">Cédula de ciudadanía</option>
                                    <option value="NIT">NIT</option>
                                    <option value="CE">Cédula de extranjería</option>
                                    <option value="PASAPORTE">Pasaporte</option>
                                    <option value="OTRO">Otro</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Número de documento *</label>
                                <input id="documento" required maxlength="30">
                            </div>

                            <div class="form-group full-width">
                                <label>Nombre o razón social *</label>
                                <input id="nombre" required maxlength="150">
                            </div>

                            <div class="form-group">
                                <label>Correo electrónico</label>
                                <input id="correo" type="email" maxlength="150">
                            </div>

                            <div class="form-group">
                                <label>Teléfono</label>
                                <input id="telefono" maxlength="30">
                            </div>

                            <div class="form-group full-width">
                                <label>Dirección</label>
                                <input id="direccion" maxlength="200">
                            </div>

                            <div class="form-group full-width">
                                <label>Ciudad</label>
                                <input id="ciudad" maxlength="100">
                            </div>

                        </div>

                        <div class="form-actions">
                            <button type="button"
                                class="btn-secondary"
                                id="cancelarCliente">
                                Cancelar
                            </button>

                            <button type="submit" class="btn-primary">
                                Guardar cliente
                            </button>
                        </div>

                    </form>

                </div>
            </div>
        `;

        eventos(container);
        cargarDesdeMySQL(container);
    }

    function eventos(container) {

        const modal = container.querySelector("#modalCliente");
        const formulario = container.querySelector("#formCliente");

        container.querySelector("#nuevoCliente")
            .addEventListener("click", () => abrirFormulario());

        container.querySelector("#cerrarModal")
            .addEventListener("click", cerrarFormulario);

        container.querySelector("#cancelarCliente")
            .addEventListener("click", cerrarFormulario);

        container.querySelector("#buscarCliente")
            .addEventListener("input", () => actualizarTabla(container));

        formulario.addEventListener("submit", (evento) => {
            evento.preventDefault();
            guardarCliente(container);
        });

        container.querySelector("#tablaClientes")
            .addEventListener("click", async evento => {

                const boton = evento.target.closest("[data-accion]");

                if (!boton) return;

                const id = Number(boton.dataset.id);
                const cliente = listaClientes.find(c => c.id === id);

                if (!cliente) return;

                if (boton.dataset.accion === "editar") {
                    abrirFormulario(cliente);
                }

                if (boton.dataset.accion === "desactivar") {

                    const confirmar = confirm(
                        "¿Deseas desactivar este cliente?"
                    );

                    if (!confirmar) return;

                    try {
                        const respuesta = await fetch(
                            `http://localhost:3000/api/clientes/${id}/desactivar`,
                            { method: "PATCH" }
                        );

                        const resultado = await respuesta.json();

                        if (!respuesta.ok) {
                            throw new Error(resultado.message);
                        }

                        await cargarDesdeMySQL(container);

                    } catch (error) {
                        alert(error.message);
                    }
                }
               
            });
    }

    function abrirFormulario(cliente = null) {

        const modal = document.getElementById("modalCliente");
        const formulario = document.getElementById("formCliente");

        clienteEditando = cliente;

        formulario.reset();

        document.getElementById("tituloFormulario").textContent =
            cliente ? "Editar cliente" : "Registrar cliente";

        if (cliente) {
            document.getElementById("tipoDocumento").value =
                cliente.tipoDocumento;

            document.getElementById("documento").value =
                cliente.documento;

            document.getElementById("nombre").value =
                cliente.nombre;

            document.getElementById("correo").value =
                cliente.correo;

            document.getElementById("telefono").value =
                cliente.telefono;

            document.getElementById("direccion").value =
                cliente.direccion;

            document.getElementById("ciudad").value =
                cliente.ciudad;
        }

        modal.classList.add("visible");
    }

    function cerrarFormulario() {

        document.getElementById("modalCliente")
            .classList.remove("visible");

        clienteEditando = null;
    }

    
async function guardarCliente(container) {

    const cliente = {
        tipoDocumento: document.getElementById("tipoDocumento").value,
        documento: document.getElementById("documento").value.trim(),
        nombre: document.getElementById("nombre").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        direccion: document.getElementById("direccion").value.trim(),
        ciudad: document.getElementById("ciudad").value.trim()
    };

    if (!cliente.documento || !cliente.nombre) {
        alert("Completa los campos obligatorios.");
        return;
    }

    try {
        const url = clienteEditando
            ? `http://localhost:3000/api/clientes/${clienteEditando.id}`
            : "http://localhost:3000/api/clientes";

        const respuesta = await fetch(url, {
            method: clienteEditando ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(cliente)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.message || "Error al guardar");
        }

        alert(resultado.message);

        cerrarFormulario();

        await cargarDesdeMySQL(container);

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

    
async function cargarDesdeMySQL(container) {

    try {
        console.log("Consultando clientes en MySQL...");

        const respuesta = await fetch(
            "http://localhost:3000/api/clientes"
        );

        console.log("Estado HTTP:", respuesta.status);

        if (!respuesta.ok) {
            throw new Error(
                `Error HTTP: ${respuesta.status}`
            );
        }

        const resultado = await respuesta.json();

        console.log("Respuesta del servidor:", resultado);

        if (!resultado.success) {
            throw new Error(
                resultado.message || "La API no pudo consultar los clientes"
            );
        }

        if (!Array.isArray(resultado.data)) {
            throw new Error(
                "La respuesta de la API no contiene un arreglo de clientes"
            );
        }

        listaClientes = resultado.data.map(c => ({
            id: Number(c.id),
            tipoDocumento: c.tipo_documento,
            documento: c.numero_documento,
            nombre: c.razon_social || "",
            correo: c.correo || "",
            telefono: c.telefono || "",
            direccion: c.direccion || "",
            ciudad: c.ciudad || "",
            activo: Boolean(Number(c.activo)),
            fecha: c.fecha_creacion
        }));

        actualizarTabla(container);

        console.log(
            "Clientes cargados correctamente:",
            listaClientes
        );

    } catch (error) {

        console.error(
            "ERROR AL CARGAR CLIENTES:",
            error
        );

        const tabla = container.querySelector("#tablaClientes");

        if (tabla) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-table">
                        Error al cargar los clientes.
                        Revisa la consola del navegador.
                    </td>
                </tr>
            `;
        }
    }
}



    function actualizarTabla(container) {

        console.log("LISTA COMPLETA:", listaClientes);
console.log("TOTAL CLIENTES:", listaClientes.length);
console.log("CLIENTES ACTIVOS:",
    listaClientes.filter(c => c.activo)
);

        const tabla = container.querySelector("#tablaClientes");
        const busqueda = container.querySelector("#buscarCliente")
            .value.toLowerCase();

        const activos = listaClientes.filter(c => c.activo);

        const filtrados = activos.filter(c =>
            c.nombre.toLowerCase().includes(busqueda) ||
            c.documento.toLowerCase().includes(busqueda)
        );

        container.querySelector("#totalClientes").textContent =
            activos.length;

        if (!filtrados.length) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-table">
                        No se encontraron clientes.
                    </td>
                </tr>
            `;
            return;
        }

        tabla.innerHTML = filtrados.map(cliente => `
            <tr>
                <td>${escapar(cliente.documento)}</td>
                <td>${escapar(cliente.nombre)}</td>
                <td>${escapar(cliente.correo || "-")}</td>
                <td>${escapar(cliente.telefono || "-")}</td>
                <td>
                    <span class="status-badge">Activo</span>
                </td>
                <td>
                    <button class="action-btn"
                        data-accion="editar"
                        data-id="${cliente.id}">
                        Editar
                    </button>

                    <button class="action-btn danger"
                        data-accion="desactivar"
                        data-id="${cliente.id}">
                        Desactivar
                    </button>
                </td>
            </tr>
        `).join("");
    }

    return { mostrar };

})();
