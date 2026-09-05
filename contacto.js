import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.min.js";
import Hls from "https://cdn.jsdelivr.net/npm/hls.js@1.5.13/+esm";

const HLS_URL = "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8";
const MARQUEE_TEXT = "BAJO LAS ESTRELLAS • ";

function setupHls(videoEl, url) {
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoEl);
    } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
        videoEl.src = url;
    }
}

function animateCount(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();

    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(1, elapsed / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

export function initContacto() {
    // Video de fondo del footer
    const video = document.getElementById("footer-video");
    setupHls(video, HLS_URL);

    // Marquee: repetir texto 10 veces (copias idénticas = loop seamless con xPercent -50)
    const marquee = document.getElementById("marquee");
    for (let i = 0; i < 10; i++) {
        const span = document.createElement("span");
        span.textContent = MARQUEE_TEXT;
        marquee.appendChild(span);
    }

    gsap.to(".marquee", {
        xPercent: -50,
        duration: 40,
        ease: "none",
        repeat: -1,
    });

    // Contadores de estadísticas
    const statNumbers = document.querySelectorAll(".stat-number");

    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    io.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    statNumbers.forEach((el) => io.observe(el));
}