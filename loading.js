const WORDS = ["Lujo", "Estrellas", "Descanso", "Aventura"];
const DURATION = 2700; // ms
const WORD_INTERVAL = 900; // ms

export function initLoading() {
    const counterEl = document.getElementById("loading-counter");
    const fillEl = document.getElementById("loading-fill");
    const wordEl = document.getElementById("loading-word");
    const labelEl = document.querySelector(".loading-label");

    // Animación de entrada del label
    requestAnimationFrame(() => labelEl.classList.add("is-visible"));

    let count = 0;
    let startTime = null;

    function tick(now) {
        if (startTime === null) startTime = now;
        const elapsed = now - startTime;
        count = Math.min(100, Math.round((elapsed / DURATION) * 100));

        counterEl.textContent = String(count).padStart(3, "0");
        fillEl.style.transform = `scaleX(${count / 100})`;

        if (count < 100) {
            requestAnimationFrame(tick);
        } else {
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent("loading:complete"));
            }, 400);
        }
    }

    requestAnimationFrame(tick);

    // Palabras rotativas cada 900ms
    let wordIndex = 0;
    setInterval(() => {
        wordIndex = (wordIndex + 1) % WORDS.length;
        const next = WORDS[wordIndex];

        // Salida del word actual
        wordEl.classList.remove("enter");
        wordEl.classList.add("exit");

        setTimeout(() => {
            wordEl.textContent = next;
            wordEl.classList.remove("exit");
            wordEl.getBoundingClientRect(); // forzar reflow
            wordEl.classList.add("enter");
        }, 450);
    }, WORD_INTERVAL);
}

export function onLoadingComplete(callback) {
    document.addEventListener("loading:complete", callback, { once: true });
}