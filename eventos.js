import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.min.js";

export function initEventos() {
    const headerAnim = gsap.from(".eventos-header", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".eventos-header",
            start: "top 85%",
            once: true,
        },
    });

    const listAnim = gsap.from(".evento-entry", {
        opacity: 0,
        x: -30,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: {
            trigger: ".eventos-list",
            start: "top 85%",
            once: true,
        },
    });

    return { headerAnim, listAnim };
}