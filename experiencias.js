import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.min.js";

export function initExperiencias() {
    gsap.from(".experiencias-header", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".experiencias-header",
            start: "top 85%",
            once: true,
        },
    });

    // Revelado escalonado de las tarjetas
    gsap.from(".service-card", {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: "power2.out",
        stagger: 0.12,
        scrollTrigger: {
            trigger: ".bento-grid",
            start: "top 85%",
            once: true,
        },
    });
}