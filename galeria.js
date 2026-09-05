import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.min.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.min.js";

export function initGaleria() {
    const section = document.getElementById("galeria");
    const contentEl = document.querySelector(".parallax-center");

    // Pin del contenido central
    ScrollTrigger.create({
        trigger: section,
        pin: contentEl,
        pinSpacing: false,
        start: "top top",
        end: "bottom bottom",
    });

    // Parallax de columnas
    gsap.to(".parallax-col-1", {
        y: -200,
        ease: "none",
        scrollTrigger: {
            trigger: section,
            scrub: true,
            start: "top top",
            end: "bottom bottom",
        },
    });

    gsap.to(".parallax-col-2", {
        y: 200,
        ease: "none",
        scrollTrigger: {
            trigger: section,
            scrub: true,
            start: "top top",
            end: "bottom bottom",
        },
    });

    // Lightbox
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const closeBtn = document.getElementById("lightbox-close");

    const captions = [
        "Terraza Observatorio",
        "Suites Observatorio",
        "Tours Astronómicos",
        "Bar & Restaurante Constelación",
        "Spa & Ritual Nocturno",
        "Hotel Polaris",
    ];

    function openLightbox(index) {
        const card = document.querySelector(`.parallax-card[data-index="${index}"]`);
        if (!card) return;
        const img = card.querySelector("img");
        lightboxImg.src = img.src;
        lightboxCaption.textContent = captions[index] || "";
        lightbox.classList.add("is-open");
        document.body.style.overflow = "hidden";
    }

    document.querySelectorAll(".parallax-card").forEach((card) => {
        card.addEventListener("click", () => {
            openLightbox(Number(card.dataset.index));
        });
    });

    function closeLightbox() {
        lightbox.classList.remove("is-open");
        document.body.style.overflow = "";
    }

    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeLightbox();
    });
}