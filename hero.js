import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.min.js";
import Hls from "https://cdn.jsdelivr.net/npm/hls.js@1.5.13/+esm";

const HLS_URL = "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8";
const ROLES = ["Descanso", "Lujo", "Aventura", "Naturaleza"];

function setupHls(videoEl, url) {
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoEl);
    } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
        videoEl.src = url;
    }
}

export function initHero() {
    // Video de fondo
    const video = document.getElementById("hero-video");
    setupHls(video, HLS_URL);

    // Navbar scrolled
    const pill = document.getElementById("navbar-pill");
    const onScroll = () => {
        pill.classList.toggle("scrolled", window.scrollY > 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Link activo según sección visible
    const sections = ["hero", "experiencias", "eventos", "galeria", "contacto"];
    const navLinks = document.querySelectorAll(".nav-link");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    navLinks.forEach((link) => {
                        link.classList.toggle(
                            "active",
                            link.getAttribute("href") === `#${entry.target.id}`
                        );
                    });
                }
            });
        },
        { rootMargin: "-45% 0px -45% 0px" }
    );

    sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
    });

    // Palabra de rol rotativa
    const roleEl = document.getElementById("role-word");
    let roleIndex = 0;
    setInterval(() => {
        roleIndex = (roleIndex + 1) % ROLES.length;
        roleEl.textContent = ROLES[roleIndex];
        roleEl.classList.remove("animate-role-fade-in");
        roleEl.getBoundingClientRect(); // forzar reflow
        roleEl.classList.add("animate-role-fade-in");
    }, 2000);

    // Entrada GSAP
    const tl = gsap.timeline();
    tl.from(".name-reveal", { opacity: 0, y: 50, duration: 1.2, delay: 0.1 })
        .from(
            ".blur-in",
            { opacity: 0, filter: "blur(10px)", y: 20, duration: 1, stagger: 0.1 },
            0.3
        );
}