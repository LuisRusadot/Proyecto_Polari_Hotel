/* ============================================================
   HOTEL POLARIS — Formulario de contacto → API (FASE 3)
   Archivo: contacto-api.js
   Envía los datos del formulario de contacto a la API
   (api/contactos.php, método POST) usando fetch.
   ============================================================ */

const API_URL = "api/contactos.php";

/** Muestra un mensaje de estado dentro de la tarjeta del formulario. */
function mostrarMensaje(tipo, texto) {
    const cont = document.getElementById("form-status");
    if (!cont) return;

    cont.textContent = texto;
    cont.className = "form-status " + (tipo === "ok" ? "form-status-ok" : "form-status-error");
    cont.hidden = false;

    // Ocultar el mensaje después de unos segundos
    clearTimeout(cont._timer);
    cont._timer = setTimeout(() => {
        cont.hidden = true;
    }, 7000);
}

/** Desactiva / reactiva el botón de envío mientras se procesa. */
function setCargando(form, cargando) {
    const btn = form.querySelector(".btn-submit");
    if (!btn) return;
    btn.disabled = cargando;
    btn.textContent = cargando ? "Enviando bajo las estrellas…" : "Enviar Mensaje";
}

export function initContactoApi() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Recolectar datos del formulario
        const datos = {
            nombre: form.nombre.value.trim(),
            email: form.email.value.trim(),
            telefono: form.telefono.value.trim(),
            asunto: form.asunto.value,
            mensaje: form.mensaje.value.trim(),
        };

        // Validación básica en el cliente
        if (!datos.nombre || !datos.email || !datos.asunto || !datos.mensaje) {
            mostrarMensaje("error", "Por favor completa todos los campos obligatorios.");
            return;
        }

        setCargando(form, true);
        try {
            const respuesta = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos),
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok || !resultado.ok) {
                mostrarMensaje(
                    "error",
                    resultado.error || "No se pudo enviar tu mensaje. Inténtalo de nuevo."
                );
                return;
            }

            mostrarMensaje("ok", "¡Mensaje enviado! Nuestro equipo te contactará pronto. ✨");
            form.reset();
        } catch {
            // Error de red o servidor: se informa al usuario con un mensaje claro
            // y el formulario queda listo para reintentar.
            mostrarMensaje(
                "error",
                "Error de conexión con el servidor. Verifica que XAMPP (Apache) esté activo."
            );
        } finally {
            setCargando(form, false);
        }
    });
}