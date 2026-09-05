import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.min.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.min.js";

gsap.registerPlugin(ScrollTrigger);

export function initPage() {
    const pill = document.getElementById("navbar-pill");
    const onScroll = () => {
        pill.classList.toggle("scrolled", window.scrollY > 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Entrada del hero de subpágina (misma animación que la portada)
    const tl = gsap.timeline();
    tl.from(".name-reveal", { opacity: 0, y: 50, duration: 1.2, delay: 0.1 }).from(
        ".blur-in",
        { opacity: 0, filter: "blur(10px)", y: 20, duration: 1, stagger: 0.1 },
        0.3
    );

    // Reveal de secciones al hacer scroll (ScrollTrigger)
    const headers = document.querySelectorAll(".section-header");
    headers.forEach((header) => {
        gsap.from(header, {
            opacity: 0,
            y: 30,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: header,
                start: "top 85%",
                once: true,
            },
        });
    });

    // Reveal de tarjetas (experience-card / contacto)
    const revealables = document.querySelectorAll(
        ".experience-card, .contact-card, .carrusel-container"
    );
    if (revealables.length) {
        gsap.from(revealables, {
            opacity: 0,
            y: 40,
            duration: 0.9,
            ease: "power2.out",
            stagger: 0.12,
            scrollTrigger: {
                trigger: revealables[0],
                start: "top 85%",
                once: true,
            },
        });
    }
}