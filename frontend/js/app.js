
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const pageTitle = document.getElementById("pageTitle");

const content = document.querySelector(".content");

const pageNames = {
    inicio: "Panel principal",
    clientes: "Gestión de clientes",
    productos: "Productos y servicios",
    facturas: "Facturación",
    pagos: "Pagos y cartera",
    informes: "Informes",
    usuarios: "Usuarios",
    empresa: "Datos de la empresa",
    configuracion: "Configuración"
};

// Abrir y cerrar menú
menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

// Navegación del sistema
document.querySelectorAll("[data-page]").forEach(button => {

    button.addEventListener("click", () => {

        const page = button.dataset.page;

        if (!pageNames[page]) return;

        document.querySelectorAll(".menu-item")
            .forEach(item => item.classList.remove("active"));

        const menuButton = document.querySelector(
            `.menu-item[data-page="${page}"]`
        );

        if (menuButton) {
            menuButton.classList.add("active");
        }

        pageTitle.textContent = pageNames[page];

        if (page === "inicio") {
            location.reload();
            return;
        }

        if (page === "clientes") {
            Clientes.mostrar(content);
            sidebar.classList.remove("open");
            return;
        }

        if (page === "productos") {
            Productos.mostrar(content);
            sidebar.classList.remove("open");
            return;
        }

        content.innerHTML = `
            <div class="panel">
                <h2>${pageNames[page]}</h2>
                <br>
                <p style="color:#94a3b8">
                    Este módulo está preparado para su desarrollo.
                </p>
            </div>
        `;

        sidebar.classList.remove("open");
    });

});

console.log("JLSERVISOFT frontend iniciado correctamente");
