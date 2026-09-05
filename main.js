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
    // Revelar app con transición
    app.removeAttribute("hidden");
    app.classList.add("page-enter");
    requestAnimationFrame(() => {
        requestAnimationFrame(() => app.classList.add("page-enter-active"));
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
        // Ocultar pantalla de carga
        const loading = document.getElementById("loading-screen");
        loading.style.display = "none";

        revelarApp();

        // Inicializar secciones
        initHero();
        initExperiencias();
        initEventos();
        initGaleria();
        initContacto();
    });

    // Iniciar pantalla de carga
    initLoading();
}