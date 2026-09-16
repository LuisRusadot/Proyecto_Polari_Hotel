import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.min.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.min.js";
import { initLoading, onLoadingComplete } from "./loading.js";
import { initPage } from "./page.js";
import { initCarrusel } from "./carrusel.js";
import { initHero } from "./hero.js";
import { initExperiencias } from "./experiencias.js";
import { initEventos } from "./eventos.js";
import { initGaleria } from "./galeria.js";
import { initContacto } from "./contacto.js";

gsap.registerPlugin(ScrollTrigger);

const app = document.getElementById("app");
const esSubpagina = document.querySelector(".page-hero") !== null;

function revelarApp() {
    if (!app) return;
    // Revelar app con transición
    app.removeAttribute("hidden");
    app.classList.add("page-enter");
    requestAnimationFrame(() => {
        requestAnimationFrame(() => app.classList.add("page-enter-active"));
    });
}

// Fusible global: pase lo que pase (error de red, CDN bloqueado, módulo
// que falla al cargar), la pantalla de carga se esconde y la app se muestra.
function esconderPantallaCarga() {
    const loading = document.getElementById("loading-screen");
    if (loading) loading.style.display = "none";
    revelarApp();
}

window.addEventListener("error", esconderPantallaCarga);
if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
        // Si pasados 5s el loading no terminó solo, lo forzamos.
        setTimeout(esconderPantallaCarga, 5000);
    });
}

if (esSubpagina) {
    // Subpáginas: sin pantalla de carga, inicializar de inmediato
    revelarApp();
    initPage();
    if (document.getElementById("carruselTrack")) {
        initCarrusel();
    }
} else {
    // Landing page: esperar a que termine la pantalla de carga
    onLoadingComplete(() => {
        esconderPantallaCarga();

        // Inicializar secciones
        try {
            initHero();
            initExperiencias();
            initEventos();
            initGaleria();
            initContacto();
        } catch (e) {
            // Si una sección falla, la página principal ya está visible;
            // no bloqueamos el resto del sitio.
            console.error("Error al inicializar secciones:", e);
        }
    });

    // Iniciar pantalla de carga (envuelto para que un fallo aquí
    // no deje la página pegada en el loading).
    try {
        initLoading();
    } catch (e) {
        console.error("Error al iniciar la pantalla de carga:", e);
        esconderPantallaCarga();
    }
}