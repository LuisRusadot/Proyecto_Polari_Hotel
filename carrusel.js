export function initCarrusel() {
    const track = document.getElementById("carruselTrack");
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    const dotsNav = document.getElementById("carruselDots");

    if (!track || !dotsNav || !nextBtn || !prevBtn) return;

    const slides = Array.from(track.children);
    let currentIndex = 0;
    let autoSlideTimer;

    slides.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.classList.add("dot");
        if (index === 0) dot.classList.add("active");
        dotsNav.appendChild(dot);
        dot.addEventListener("click", () => {
            moveToSlide(index);
            resetAutoSlide();
        });
    });

    const dots = Array.from(dotsNav.children);

    function moveToSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        track.style.transform = `translateX(-${index * 100}%)`;
        dots[currentIndex].classList.remove("active");
        dots[index].classList.add("active");
        currentIndex = index;
    }

    function startAutoSlide() {
        autoSlideTimer = setInterval(() => {
            moveToSlide(currentIndex + 1);
        }, 4000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideTimer);
        startAutoSlide();
    }

    nextBtn.addEventListener("click", () => {
        moveToSlide(currentIndex + 1);
        resetAutoSlide();
    });

    prevBtn.addEventListener("click", () => {
        moveToSlide(currentIndex - 1);
        resetAutoSlide();
    });

    // Soporte táctil / swipe
    let touchStartX = 0;
    track.addEventListener(
        "touchstart",
        (e) => {
            touchStartX = e.touches[0].clientX;
        },
        { passive: true }
    );
    track.addEventListener(
        "touchend",
        (e) => {
            const diff = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(diff) > 40) {
                if (diff < 0) moveToSlide(currentIndex + 1);
                else moveToSlide(currentIndex - 1);
                resetAutoSlide();
            }
        },
        { passive: true }
    );

    startAutoSlide();
}