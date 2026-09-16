/* ============================================================
   HOTEL POLARIS — Panel de Administración (FASE 3)
   Archivo: admin/admin.js
   CRUD completo contra la API:
     · Contactos    → ../api/contactos.php
     · Experiencias → ../api/experiencias.php
     · Reservas     → ../api/reservas.php
   ============================================================ */

const API = {
    contactos: "../api/contactos.php",
    experiencias: "../api/experiencias.php",
    reservas: "../api/reservas.php",
};

/* ---------- Estado ---------- */
let tabActual = "contactos";
let datos = {
    contactos: [],
    experiencias: [],
    reservas: [],
};
let modoModal = null;   // "crear" | "editar"
let entidadModal = null; // "contacto" | "experiencia" | "reserva"
let idModal = null;

/* ---------- Utilidades ---------- */
const $ = (sel) => document.querySelector(sel);

function escapar(texto) {
    const div = document.createElement("div");
    div.textContent = texto == null ? "" : String(texto);
    return div.innerHTML;
}

function fechaFormateada(fecha) {
    if (!fecha) return "—";
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return escapar(fecha);
    return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function toast(texto, esError = false) {
    const el = $("#toast");
    el.textContent = texto;
    el.classList.toggle("error", esError);
    el.classList.add("visible");
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove("visible"), 3500);
}

async function peticion(url, opciones = {}) {
    const respuesta = await fetch(url, opciones);
    let resultado;
    try {
        resultado = await respuesta.json();
    } catch (e) {
        resultado = { ok: false, error: "Respuesta no válida del servidor." };
    }
    if (!respuesta.ok || !resultado.ok) {
        throw new Error(resultado.error || "Error en la petición.");
    }
    return resultado;
}

const VERBOS = {
    contacto: {
        leer: (id) => (id ? `${API.contactos}?id=${id}` : API.contactos),
        crear: API.contactos,
        editar: (id) => `${API.contactos}?id=${id}`,
        borrar: (id) => `${API.contactos}?id=${id}`,
    },
    experiencia: {
        leer: (id) => (id ? `${API.experiencias}?id=${id}` : API.experiencias),
        crear: API.experiencias,
        editar: (id) => `${API.experiencias}?id=${id}`,
        borrar: (id) => `${API.experiencias}?id=${id}`,
    },
    reserva: {
        leer: (id) => (id ? `${API.reservas}?id=${id}` : API.reservas),
        crear: API.reservas,
        editar: (id) => `${API.reservas}?id=${id}`,
        borrar: (id) => `${API.reservas}?id=${id}`,
    },
};

/* ============================================================
   LECTURA (Read)
   ============================================================ */
async function cargarTodo() {
    try {
        const [c, e, r] = await Promise.all([
            peticion(VERBOS.contacto.leer()),
            peticion(VERBOS.experiencia.leer()),
            peticion(VERBOS.reserva.leer()),
        ]);
        datos.contactos = c.contactos || [];
        datos.experiencias = e.experiencias || [];
        datos.reservas = r.reservas || [];
        renderTodo();
    } catch (error) {
        toast("No se pudo conectar con la API. Revisa que XAMPP esté activo.", true);
        console.error(error);
    }
}

/* ============================================================
   RENDER
   ============================================================ */
function renderTodo() {
    renderContactos();
    renderExperiencias();
    renderReservas();
    renderResumen();
}

function renderResumen() {
    $("#resumenContactos").textContent = datos.contactos.length;
    $("#resumenNuevos").textContent = datos.contactos.filter((c) => c.estado === "nuevo").length;
    $("#resumenExperiencias").textContent = datos.experiencias.length;
    $("#resumenReservas").textContent = datos.reservas.length;
}

const ETIQUETAS_ASUNTO = {
    reserva: "Reserva",
    astronomia: "Astronomía",
    eventos: "Eventos",
    otro: "Otro",
};

const ETIQUETAS_ESTADO_CONTACTO = {
    nuevo: "Nuevo",
    leido: "Leído",
    respondido: "Respondido",
    archivado: "Archivado",
};

const ETIQUETAS_ESTADO_RESERVA = {
    pendiente: "Pendiente",
    confirmada: "Confirmada",
    cancelada: "Cancelada",
    completada: "Completada",
};

function renderContactos() {
    const tbody = $("#tbody-contactos");
    const contador = $("#contadorContactos");

    if (!datos.contactos.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="vacias">No hay contactos registrados todavía.</td></tr>';
        contador.innerHTML = "0 contactos";
        return;
    }

    contador.innerHTML = `<b>${datos.contactos.length}</b> contactos`;
    tbody.innerHTML = datos.contactos
        .map((c) => {
            const asunto = ETIQUETAS_ASUNTO[c.asunto] || c.asunto;
            const estado = ETIQUETAS_ESTADO_CONTACTO[c.estado] || c.estado;
            return `<tr>
                <td>#${c.id}</td>
                <td><b>${escapar(c.nombre)}</b></td>
                <td>${escapar(c.email)}</td>
                <td>${escapar(c.telefono || "—")}</td>
                <td>${escapar(asunto)}</td>
                <td><span class="badge badge-${escapar(c.estado)}">${escapar(estado)}</span></td>
                <td class="celda-fecha">${fechaFormateada(c.creado_en)}</td>
                <td class="celda-acciones">
                    <button class="btn-icono ver" data-ver="contacto" data-id="${c.id}" type="button">Ver</button>
                    <button class="btn-icono editar" data-editar="contacto" data-id="${c.id}" type="button">Editar</button>
                    <button class="btn-icono borrar" data-borrar="contacto" data-id="${c.id}" type="button">Eliminar</button>
                </td>
            </tr>`;
        })
        .join("");
}

function renderExperiencias() {
    const tbody = $("#tbody-experiencias");
    const contador = $("#contadorExperiencias");

    if (!datos.experiencias.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="vacias">No hay experiencias registradas todavía.</td></tr>';
        contador.innerHTML = "0 experiencias";
        return;
    }

    contador.innerHTML = `<b>${datos.experiencias.length}</b> experiencias`;
    tbody.innerHTML = datos.experiencias
        .map((e) => `<tr>
            <td>#${e.id}</td>
            <td>${e.imagen ? `<img class="mini-img" src="${escapar(e.imagen)}" alt="${escapar(e.titulo)}" loading="lazy">` : "—"}</td>
            <td><b>${escapar(e.titulo)}</b></td>
            <td>${escapar(e.precio || "—")}</td>
            <td><span class="badge ${e.activo ? "badge-activo" : "badge-inactivo"}">${e.activo ? "Activa" : "Inactiva"}</span></td>
            <td class="celda-acciones">
                <button class="btn-icono ver" data-ver="experiencia" data-id="${e.id}" type="button">Ver</button>
                <button class="btn-icono editar" data-editar="experiencia" data-id="${e.id}" type="button">Editar</button>
                <button class="btn-icono borrar" data-borrar="experiencia" data-id="${e.id}" type="button">Eliminar</button>
            </td>
        </tr>`)
        .join("");
}

function renderReservas() {
    const tbody = $("#tbody-reservas");
    const contador = $("#contadorReservas");

    if (!datos.reservas.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="vacias">No hay reservas registradas todavía.</td></tr>';
        contador.innerHTML = "0 reservas";
        return;
    }

    contador.innerHTML = `<b>${datos.reservas.length}</b> reservas`;
    tbody.innerHTML = datos.reservas
        .map((r) => {
            const estado = ETIQUETAS_ESTADO_RESERVA[r.estado] || r.estado;
            return `<tr>
                <td>#${r.id}</td>
                <td><b>${escapar(r.contacto_nombre || "—")}</b></td>
                <td class="celda-fecha">${fechaFormateada(r.fecha_llegada)}</td>
                <td class="celda-fecha">${fechaFormateada(r.fecha_salida)}</td>
                <td>${r.huespedes}</td>
                <td>${escapar(r.tipo_habitacion || "—")}</td>
                <td><span class="badge badge-${escapar(r.estado)}">${escapar(estado)}</span></td>
                <td class="celda-acciones">
                    <button class="btn-icono ver" data-ver="reserva" data-id="${r.id}" type="button">Ver</button>
                    <button class="btn-icono editar" data-editar="reserva" data-id="${r.id}" type="button">Editar</button>
                    <button class="btn-icono borrar" data-borrar="reserva" data-id="${r.id}" type="button">Eliminar</button>
                </td>
            </tr>`;
        })
        .join("");
}

/* ============================================================
   PESTAÑAS
   ============================================================ */
function cambiarTab(nombre) {
    tabActual = nombre;
    document.querySelectorAll(".tab").forEach((t) => {
        t.classList.toggle("activo", t.dataset.tab === nombre);
    });
    ["contactos", "experiencias", "reservas"].forEach((p) => {
        $("#panel-" + p).hidden = p !== nombre;
    });
}

/* ============================================================
   MODAL — Formularios
   ============================================================ */
function abrirModal(titulo) {
    $("#modal-titulo").textContent = titulo;
    $("#modal").classList.add("abierto");
}

function cerrarModal() {
    $("#modal").classList.remove("abierto");
    $("#modal-form").innerHTML = "";
    modoModal = null;
    entidadModal = null;
    idModal = null;
}

function campoSelect(label, nombre, opciones, valor, requerido = false) {
    const opcionesHtml = opciones
        .map((o) => `<option value="${o.valor}" ${String(o.valor) === String(valor) ? "selected" : ""}>${escapar(o.texto)}</option>`)
        .join("");
    return `<div class="campo">
        <label for="${nombre}">${label}</label>
        <select id="${nombre}" name="${nombre}" ${requerido ? "required" : ""}>${opcionesHtml}</select>
    </div>`;
}

function campoTexto(label, nombre, valor, tipo = "text", requerido = false, placeholder = "") {
    return `<div class="campo">
        <label for="${nombre}">${label}</label>
        <input type="${tipo}" id="${nombre}" name="${nombre}" value="${escapar(valor)}" ${requerido ? "required" : ""} placeholder="${escapar(placeholder)}">
    </div>`;
}

function campoArea(label, nombre, valor, requerido = false) {
    return `<div class="campo span-2">
        <label for="${nombre}">${label}</label>
        <textarea id="${nombre}" name="${nombre}" ${requerido ? "required" : ""}>${escapar(valor)}</textarea>
    </div>`;
}

function formularioContacto(datosContacto = {}) {
    return (
        campoTexto("Nombre completo", "nombre", datosContacto.nombre || "", "text", true, "Ej. Ana María Gómez") +
        campoTexto("Correo electrónico", "email", datosContacto.email || "", "email", true, "ejemplo@correo.com") +
        campoTexto("Teléfono", "telefono", datosContacto.telefono || "", "tel", false, "+57 300 000 0000") +
        campoSelect("Asunto", "asunto",
            [
                { valor: "reserva", texto: "Reserva de Habitaciones" },
                { valor: "astronomia", texto: "Tours y Observatorio" },
                { valor: "eventos", texto: "Eventos y Bodas" },
                { valor: "otro", texto: "Otras Consultas" },
            ],
            datosContacto.asunto || "otro", true) +
        campoSelect("Estado", "estado",
            [
                { valor: "nuevo", texto: "Nuevo" },
                { valor: "leido", texto: "Leído" },
                { valor: "respondido", texto: "Respondido" },
                { valor: "archivado", texto: "Archivado" },
            ],
            datosContacto.estado || "nuevo") +
        campoArea("Mensaje", "mensaje", datosContacto.mensaje || "", true)
    );
}

function formularioExperiencia(datosExp = {}) {
    return (
        campoTexto("Título", "titulo", datosExp.titulo || "", "text", true, "Ej. Suites Observatorio") +
        campoTexto("Precio", "precio", datosExp.precio || "", "text", false, "Desde $180 / noche") +
        campoSelect("¿Visible en el sitio?", "activo",
            [
                { valor: 1, texto: "Sí (activa)" },
                { valor: 0, texto: "No (inactiva)" },
            ],
            datosExp.activo === undefined ? 1 : datosExp.activo) +
        campoArea("Descripción", "descripcion", datosExp.descripcion || "", true) +
        campoTexto("URL de la imagen", "imagen", datosExp.imagen || "", "url", false, "https://...")
    );
}

function formularioReserva(datosReserva = {}, contactos = []) {
    const opcionesContacto = contactos.map((c) => ({
        valor: c.id,
        texto: `#${c.id} · ${c.nombre} (${c.email})`,
    }));
    return (
        campoSelect("Contacto asociado", "contacto_id", opcionesContacto, datosReserva.contacto_id || "") +
        campoTexto("Fecha de llegada", "fecha_llegada", datosReserva.fecha_llegada || "", "date", true) +
        campoTexto("Fecha de salida", "fecha_salida", datosReserva.fecha_salida || "", "date", true) +
        campoTexto("Huéspedes", "huespedes", datosReserva.huespedes || 1, "number", true) +
        campoTexto("Tipo de habitación", "tipo_habitacion", datosReserva.tipo_habitacion || "", "text", false, "Suite Observatorio") +
        campoSelect("Estado", "estado",
            [
                { valor: "pendiente", texto: "Pendiente" },
                { valor: "confirmada", texto: "Confirmada" },
                { valor: "cancelada", texto: "Cancelada" },
                { valor: "completada", texto: "Completada" },
            ],
            datosReserva.estado || "pendiente")
    );
}

/* ============================================================
   CREAR (Create)
   ============================================================ */
function abrirCrear(entidad) {
    entidadModal = entidad;
    modoModal = "crear";
    idModal = null;

    if (entidad === "contacto") {
        abrirModal("Nuevo contacto");
        $("#modal-form").innerHTML = formularioContacto();
    } else if (entidad === "experiencia") {
        abrirModal("Nueva experiencia");
        $("#modal-form").innerHTML = formularioExperiencia();
    } else if (entidad === "reserva") {
        abrirModal("Nueva reserva");
        $("#modal-form").innerHTML = formularioReserva({}, datos.contactos);
    }
}

function buscarRegistro(entidad, id) {
    if (entidad === "contacto") return datos.contactos.find((x) => x.id == id);
    if (entidad === "experiencia") return datos.experiencias.find((x) => x.id == id);
    return datos.reservas.find((x) => x.id == id);
}

/* ============================================================
   EDITAR (Update)
   ============================================================ */
function abrirEditar(entidad, id) {
    const registro = buscarRegistro(entidad, id);

    if (!registro) {
        toast("Registro no encontrado.", true);
        return;
    }

    entidadModal = entidad;
    modoModal = "editar";
    idModal = id;

    if (entidad === "contacto") {
        abrirModal(`Editar contacto #${id}`);
        $("#modal-form").innerHTML = formularioContacto(registro);
    } else if (entidad === "experiencia") {
        abrirModal(`Editar experiencia #${id}`);
        $("#modal-form").innerHTML = formularioExperiencia(registro);
    } else if (entidad === "reserva") {
        abrirModal(`Editar reserva #${id}`);
        $("#modal-form").innerHTML = formularioReserva(registro, datos.contactos);
    }
}

/* ============================================================
   ELIMINAR (Delete)
   ============================================================ */
async function eliminar(entidad, id) {
    const registro = buscarRegistro(entidad, id);

    let nombre = registro?.id;
    if (entidad === "contacto") nombre = registro?.nombre;
    else if (entidad === "experiencia") nombre = registro?.titulo;

    const tipo = entidad === "reserva" ? "la reserva" : "el registro";
    const confirmar = window.confirm(
        `¿Seguro que deseas eliminar ${tipo} "${nombre}"?` + "\nEsta acción no se puede deshacer."
    );
    if (!confirmar) return;

    try {
        await peticion(VERBOS[entidad].borrar(id), { method: "DELETE" });
        toast("Registro eliminado correctamente.");
        await cargarTodo();
    } catch (error) {
        toast(error.message || "No se pudo eliminar.", true);
    }
}

/* ============================================================
   VER DETALLE (Read de un registro)
   ============================================================ */
function verDetalle(entidad, id) {
    const registro = buscarRegistro(entidad, id);

    if (!registro) {
        toast("Registro no encontrado.", true);
        return;
    }

    entidadModal = entidad;
    let html = "";

    if (entidad === "contacto") {
        const asunto = ETIQUETAS_ASUNTO[registro.asunto] || registro.asunto;
        const estado = ETIQUETAS_ESTADO_CONTACTO[registro.estado] || registro.estado;
        html = `
            <div class="detalle-grupo"><span class="det-tit">Nombre</span><p class="det-val">${escapar(registro.nombre)}</p></div>
            <div class="detalle-grupo"><span class="det-tit">Correo</span><p class="det-val">${escapar(registro.email)}</p></div>
            <div class="detalle-grupo"><span class="det-tit">Teléfono</span><p class="det-val">${escapar(registro.telefono || "—")}</p></div>
            <div class="detalle-grupo"><span class="det-tit">Asunto</span><p class="det-val">${escapar(asunto)}</p></div>
            <div class="detalle-grupo"><span class="det-tit">Estado</span><p class="det-val"><span class="badge badge-${escapar(registro.estado)}">${escapar(estado)}</span></p></div>
            <div class="detalle-grupo"><span class="det-tit">Fecha</span><p class="det-val">${fechaFormateada(registro.creado_en)}</p></div>
            <div class="detalle-grupo"><span class="det-tit">Mensaje</span><p class="det-val">${escapar(registro.mensaje)}</p></div>`;
    } else if (entidad === "experiencia") {
        html = `
            ${registro.imagen ? `<div class="detalle-grupo"><img src="${escapar(registro.imagen)}" alt="${escapar(registro.titulo)}"></div>` : ""}
            <div class="detalle-grupo"><span class="det-tit">Título</span><p class="det-val">${escapar(registro.titulo)}</p></div>
            <div class="detalle-grupo"><span class="det-tit">Precio</span><p class="det-val">${escapar(registro.precio || "—")}</p></div>
            <div class="detalle-grupo"><span class="det-tit">Estado</span><p class="det-val"><span class="badge ${registro.activo ? "badge-activo" : "badge-inactivo"}">${registro.activo ? "Activa" : "Inactiva"}</span></p></div>
            <div class="detalle-grupo"><span class="det-tit">Descripción</span><p class="det-val">${escapar(registro.descripcion)}</p></div>`;
    } else if (entidad === "reserva") {
        const estado = ETIQUETAS_ESTADO_RESERVA[registro.estado] || registro.estado;
        html = `
            <div class="detalle-grupo"><span class="det-tit">Cliente</span><p class="det-val">${escapar(registro.contacto_nombre || "—")}</p></div>
            <div class="detalle-grupo"><span class="det-tit">Correo del cliente</span><p class="det-val">${escapar(registro.contacto_email || "—")}</p></div>
            <div class="detalle-grupo"><span class="det-tit">Llegada</span><p class="det-val">${fechaFormateada(registro.fecha_llegada)}</p></div>
            <div class="detalle-grupo"><span class="det-tit">Salida</span><p class="det-val">${fechaFormateada(registro.fecha_salida)}</p></div>
            <div class="detalle-grupo"><span class="det-tit">Huéspedes</span><p class="det-val">${registro.huespedes}</p></div>
            <div class="detalle-grupo"><span class="det-tit">Habitación</span><p class="det-val">${escapar(registro.tipo_habitacion || "—")}</p></div>
            <div class="detalle-grupo"><span class="det-tit">Estado</span><p class="det-val"><span class="badge badge-${escapar(registro.estado)}">${escapar(estado)}</span></p></div>
            <div class="detalle-grupo"><span class="det-tit">Fecha de registro</span><p class="det-val">${fechaFormateada(registro.creado_en)}</p></div>`;
    }

    abrirModal(`Detalle · #${id}`);
    $("#modal-form").innerHTML = `<div class="span-2 detalle-caja">${html}</div>`;
}

/* ============================================================
   GUARDAR (Create / Update unificado)
   ============================================================ */
async function guardarModal() {
    const form = $("#modal-form");
    if (!form.innerHTML) {
        cerrarModal();
        return;
    }

    const datosForm = new FormData(form);
    const cuerpo = {};

    if (entidadModal === "contacto") {
        cuerpo.nombre = datosForm.get("nombre") || "";
        cuerpo.email = datosForm.get("email") || "";
        cuerpo.telefono = datosForm.get("telefono") || "";
        cuerpo.asunto = datosForm.get("asunto") || "otro";
        cuerpo.estado = datosForm.get("estado") || "nuevo";
        cuerpo.mensaje = datosForm.get("mensaje") || "";
    } else if (entidadModal === "experiencia") {
        cuerpo.titulo = datosForm.get("titulo") || "";
        cuerpo.descripcion = datosForm.get("descripcion") || "";
        cuerpo.precio = datosForm.get("precio") || "";
        cuerpo.imagen = datosForm.get("imagen") || "";
        cuerpo.activo = Number(datosForm.get("activo")) || 0;
    } else if (entidadModal === "reserva") {
        cuerpo.contacto_id = Number(datosForm.get("contacto_id")) || 0;
        cuerpo.fecha_llegada = datosForm.get("fecha_llegada") || "";
        cuerpo.fecha_salida = datosForm.get("fecha_salida") || "";
        cuerpo.huespedes = Number(datosForm.get("huespedes")) || 1;
        cuerpo.tipo_habitacion = datosForm.get("tipo_habitacion") || "";
        cuerpo.estado = datosForm.get("estado") || "pendiente";
    }

    try {
        if (modoModal === "crear") {
            await peticion(VERBOS[entidadModal].crear, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cuerpo),
            });
            toast("Registro creado correctamente.");
        } else {
            await peticion(VERBOS[entidadModal].editar(idModal), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cuerpo),
            });
            toast("Registro actualizado correctamente.");
        }
        cerrarModal();
        await cargarTodo();
    } catch (error) {
        toast(error.message || "No se pudo guardar.", true);
    }
}

/* ============================================================
   EVENTOS
   ============================================================ */
document.addEventListener("click", (event) => {
    const objetivo = event.target.closest("[data-ver], [data-editar], [data-borrar], [data-crear]");
    if (!objetivo) return;

    if (objetivo.dataset.ver) {
        verDetalle(objetivo.dataset.ver, objetivo.dataset.id);
    } else if (objetivo.dataset.editar) {
        abrirEditar(objetivo.dataset.editar, objetivo.dataset.id);
    } else if (objetivo.dataset.borrar) {
        eliminar(objetivo.dataset.borrar, objetivo.dataset.id);
    } else if (objetivo.dataset.crear) {
        abrirCrear(objetivo.dataset.crear);
    }
});

document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => cambiarTab(tab.dataset.tab));
});

$("#refrescarBtn").addEventListener("click", cargarTodo);
$("#modalCerrar").addEventListener("click", cerrarModal);
$("#modalCancelar").addEventListener("click", cerrarModal);
$("#modalGuardar").addEventListener("click", guardarModal);

// Cerrar modal con tecla Escape
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") cerrarModal();
});

// Cerrar modal al hacer clic en el fondo
$("#modal").addEventListener("click", (event) => {
    if (event.target === $("#modal")) cerrarModal();
});

/* ============================================================
   ARRANQUE
   ============================================================ */
function arrancar() {
    cargarTodo().catch((error) => {
        // Error inicial de conexión ya informado por cargarTodo.
        console.error("Error al cargar el panel:", error);
    });
}
arrancar();