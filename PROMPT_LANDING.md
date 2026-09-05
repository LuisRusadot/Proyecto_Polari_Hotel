# Prompt: Landing Page de Hotel Polaris (Single-Page, Dark Theme)

Construye una landing page de una sola página para el **Hotel Polaris** usando HTML5 + CSS3 + Vanilla JavaScript + GSAP + hls.js. Sustituye por completo el sitio multi-página actual (`index.html`, `nosotros.html`, `servicios.html`, `galeria.html`, `recomendaciones.html`, `contacto.html`) por una landing única que integre todo ese contenido en secciones con scroll.

## Sistema de Diseño Global

### Tipografías

Google Fonts import (en `<head>`): Cinzel (500, 700) y Montserrat (300, 400, 600).

```
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet">
```

- `--font-body: 'Montserrat', sans-serif`
- `--font-display: 'Cinzel', serif`

### CSS Custom Properties (definidas en `:root`, HSL, usar `hsl(var(--bg))` en el punto de uso)

```
:root {
  --bg: 224 46% 6%;        /* #070B19 - azul noche profundo */
  --surface: 223 51% 12%;  /* #0E162D */
  --text: 220 30% 96%;
  --muted: 220 15% 62%;    /* #A0AABF */
  --stroke: 45 62% 49% / 0.18;  /* dorado tenue para bordes */
  --gold: 45 65% 52%;      /* #D4AF37 */
}
```

No Tailwind — se definen clases utilitarias reutilizables en un solo `estilos.css` (`.bg-bg`, `.bg-surface`, `.text-primary`, `.text-gold`, `.text-muted`, `.border-stroke`, etc.) mapeadas a las variables, o se usan las variables directamente en bloques CSS por componente. Mantener nombres consistentes.

### Gradiente Acento (dorado estelar)

```
.accent-gradient {
  background: linear-gradient(90deg, #F5D76E 0%, #D4AF37 50%, #9A7B1E 100%);
}
```

Usado en el anillo del logo, bordes al hover, barras de progreso.

### Animaciones Custom (en `estilos.css`)

```
@keyframes scroll-down {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(200%); }
}
.animate-scroll-down { animation: scroll-down 1.5s ease-in-out infinite; }

@keyframes role-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-role-fade-in { animation: role-fade-in 0.4s ease-out; }

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animate-gradient-shift { background-size: 200% 200%; animation: gradient-shift 6s ease infinite; }

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}
.status-dot { animation: pulse 2s ease-in-out infinite; }
```

### Tema oscuro forzado — sin modo claro. `body` con `background: hsl(var(--bg))` y `color: hsl(var(--text))` por defecto en `estilos.css`.

## Estructura de Archivos

```
/index.html
/estilos.css
/main.js          (punto de entrada, importa e inicializa todo)
/loading.js       (lógica de pantalla de carga)
/hero.js          (navbar + hero + setup video HLS)
/experiencias.js  (sección experiencias/servicios + scroll-reveal)
/eventos.js       (sección eventos nocturnos)
/galeria.js       (galería parallax + lightbox)
/contacto.js      (footer video HLS + marquee)
/assets/          (imágenes, favicon)
```

Usar ES modules (`<script type="module" src="main.js"></script>`) para que la lógica de cada sección viva en su propio archivo e sea importada en `main.js`.

### Esqueleto de `index.html`

```
<body>
  <div id="loading-screen"><!-- controlado por loading.js --></div>

  <main id="app" hidden>
    <section id="hero"></section>
    <section id="experiencias"></section>   <!-- ex Selected Works -->
    <section id="eventos"></section>        <!-- ex Journal -->
    <section id="galeria"></section>        <!-- ex Explorations -->
    <section id="stats"></section>
    <footer id="contacto"></footer>
  </main>

  <script type="module" src="main.js"></script>
</body>
```

`main.js` ejecuta la pantalla de carga primero; al completarse, pone `#loading-screen` en `display: none`, quita el atributo `hidden` de `#app` e inicializa el resto de secciones (hero, experiencias, eventos, galería, contacto) vía sus funciones `init`.

## Sección 1: Pantalla de Carga

Overlay a pantalla completa (`position: fixed; inset: 0; z-index: 9999; background: hsl(var(--bg));`). Contador con `requestAnimationFrame` de 000→100 durante 2700ms.

- Arriba izquierda: `<span class="loading-label">Hotel Polaris</span>` — variante de `text-xs text-muted uppercase tracking-[0.3em]` en CSS plano. Animado con un `@keyframes` pequeño (translateY -20px→0, opacity 0→1) disparado al añadir una clase `.is-visible` al cargar.
- Centro: palabras rotativas `["Lujo", "Estrellas", "Descanso", "Aventura"]` ciclando cada 900ms con `setInterval`. Intercambiar `textContent` y re-disparar una transición CSS (quitar/añadir clase `.enter`, o usar Web Animations API `element.animate([...])`) para imitar un crossfade y:20→0→-20. Tamaño responsive `clamp()`/media-queries, `font-display`, `color: hsl(var(--text) / 0.8)`.
- Abajo derecha: contador — numerales grandes `font-display`, `font-variant-numeric: tabular-nums`. Actualizar con `counterEl.textContent = String(count).padStart(3, "0")` en cada frame.
- Barra de progreso inferior: `height: 3px; background: hsl(var(--stroke));`, con `div.accent-gradient` interno con `transform: scaleX(count/100)` via JS por frame y `box-shadow: 0 0 8px rgba(212, 175, 55, 0.35)`.
- Al completar (count llega a 100): `setTimeout` 400ms y despachar evento custom `document.dispatchEvent(new CustomEvent('loading:complete'))` que `main.js` escucha para revelar la app.

## Sección 2: Hero

`<section id="hero">` a pantalla completa con video HLS de fondo y contenido centrado.

### Video de Fondo

```
<video id="hero-video" autoplay muted loop playsinline></video>
```

- Fuente HLS: usar el mismo stream de Mux `https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8` (nota: sustituible por un video propio de cielo estrellado/noche si se dispone de él).
- En `hero.js`: importar `Hls`. Si `Hls.isSupported()`, crear instancia, `loadSource(url)`, `attachMedia(videoEl)`. Si no, y `video.canPlayType('application/vnd.apple.mpegurl')`, asignar `video.src` directo (Safari nativo).
- Video posicionado absoluto y centrado: `position: absolute; top: 50%; left: 50%; min-width: 100%; min-height: 100%; object-fit: cover; transform: translate(-50%, -50%);`
- Overlay oscuro `<div class="hero-overlay">`: `background: rgba(0,0,0,0.35);`
- Fade inferior: `height: 12rem; background: linear-gradient(to top, hsl(var(--bg)), transparent);`

### Navbar (fijo, flotando centrado arriba)

`<nav class="navbar">` — `position: fixed; top: 0; left: 0; right: 0; z-index: 50; display: flex; justify-content: center; padding-top: 1rem;`

Píldora interna `<div class="navbar-pill">`: `display: inline-flex; align-items: center; border-radius: 9999px; backdrop-filter: blur(12px); border: 1px solid rgba(212,175,55,0.15); background: hsl(var(--surface)); padding: 0.5rem;`. Añadir clase `.scrolled` con `window.addEventListener('scroll', ...)` cuando `scrollY > 100`, aplicando `box-shadow: 0 4px 6px rgba(0,0,0,0.1)`.

Contenidos (izquierda a derecha), HTML estático dentro de la píldora:

1. **Logo**: círculo 9×9 con borde `.accent-gradient` (invertir dirección del gradiente con `:hover`). Círculo interior `hsl(var(--bg))` con "HP" en `font-display`, `font-size: 13px`. `transform: scale(1.1)` al hover con transición CSS.
2. **Divisor**: `width: 1px; height: 1.25rem; background: hsl(var(--stroke)); margin: 0 0.25rem;` (oculto por debajo de `md` via media query).
3. **Links de navegación** `["Inicio", "Experiencias", "Galería", "Contacto"]` como `<a href="#seccion">` con smooth scroll — `font-size: 0.75–0.875rem; border-radius: 9999px; padding: 0.375rem 1rem;`. El activo con clase `.active`: `color: hsl(var(--text)); background: hsl(var(--stroke) / 0.5)`. Inactivos: `color: hsl(var(--muted))`, `:hover` igual que activo. Alternar `.active` en JS según sección visible (IntersectionObserver o check de scroll).
4. **Divisor** (igual al anterior).
5. **Botón "Reservar"** `<a href="#contacto">`, mismo tamaño que los links. Al `:hover`, un `::before`/`<span>` hijo absoluto con `.accent-gradient` e `inset: -2px` aparece detrás; el contenido visible va en píldora `hsl(var(--surface))` redondeada con `backdrop-filter: blur(12px)`. Con "↗" final.

### Contenido del Hero (centrado, `z-index: 10`)

- Eyebrow: `<p class="eyebrow blur-in">CIELOS OSCUROS CERTIFICADOS</p>` — `font-size: 0.75rem; color: hsl(var(--muted)); text-transform: uppercase; letter-spacing: 0.3em; margin-bottom: 2rem;`.
- Nombre: `<h1 class="name name-reveal">Hotel Polaris</h1>` — `font-display`, grande responsive, `line-height: 0.9; letter-spacing: 0.02em; color: hsl(var(--text)); margin-bottom: 1.5rem;`.
- Línea de rol: `<p>Tu <span id="role-word" class="animate-role-fade-in">Descanso</span> bajo las estrellas.</p>` — roles `["Descanso", "Lujo", "Aventura", "Naturaleza"]` ciclan cada 2s con `setInterval`. Cada cambio reemplaza el `textContent` del `<span>` y quita/re-añade `.animate-role-fade-in` (forzando reflow con `void el.offsetWidth` antes de re-añadir) para re-disparar la animación.
- Descripción: `<p class="blur-in">Un refugio de lujo, confort y distinción diseñado para guiarte hacia la desconexión total en un entorno astronómico privilegiado, protegido contra la contaminación lumínica.</p>` — `font-size: 0.875–1rem; color: hsl(var(--muted)); max-width: 28rem; margin-bottom: 3rem;`.
- CTAs (`display: inline-flex; gap: 1rem;`):
  - **"Ver Experiencias"** (→ `#experiencias`): sólido. Default `background: hsl(var(--text)); color: hsl(var(--bg));`. `:hover` invierte a `background: hsl(var(--bg)); color: hsl(var(--text));` + anillo de borde `.accent-gradient` (técnica `<span>` con `inset: -2px`, mismo patrón que el CTA del navbar).
  - **"Reservar Ahora"** (→ `#contacto`): outlined. Default `border: 2px solid hsl(var(--stroke)); background: hsl(var(--bg)); color: hsl(var(--text));`. `:hover` vuelve el borde transparente y muestra el anillo `.accent-gradient` detrás.
  - Ambos: `border-radius: 9999px; font-size: 0.875rem; padding: 0.875rem 1.75rem;`, `:hover { transform: scale(1.05); }` con transición CSS.

### Entrada GSAP

Al cargar la página (tras completar la pantalla de carga), correr timeline con `ease: "power3.out"`:

```
const tl = gsap.timeline();
tl.from(".name-reveal", { opacity: 0, y: 50, duration: 1.2, delay: 0.1 })
  .from(".blur-in", { opacity: 0, filter: "blur(10px)", y: 20, duration: 1, stagger: 0.1 }, 0.3);
```

### Indicador de Scroll

Abajo-centro: `<span>SCROLL</span>` (`font-size: 0.75rem; color: hsl(var(--muted)); text-transform: uppercase; letter-spacing: 0.2em;`) sobre una línea `width: 1px; height: 2.5rem; background: hsl(var(--stroke));` con un segmento interno resaltado con `.animate-scroll-down`.

## Sección 3: Experiencias (ex Selected Works)

`<section id="experiencias">` — `background: hsl(var(--bg)); padding: 4rem 0;`. Wrapper interno: `max-width: 1200px; margin: 0 auto; padding: 0 2.5rem;`.

### Header

Usar GSAP ScrollTrigger en lugar de `whileInView` — animar `opacity: 0→1, y: 30→0`, `duration: 1`, `ease: "power2.out"`, `once`:

```
gsap.from(".experiencias-header", {
  opacity: 0, y: 30, duration: 1, ease: "power2.out",
  scrollTrigger: { trigger: ".experiencias-header", start: "top 85%", once: true }
});
```

- Eyebrow: `width: 2rem; height: 1px; background: hsl(var(--stroke));` + etiqueta "Experiencias" (mismo estilo eyebrow del hero).
- Título: "Servicios *destacados*" — palabra destacada envuelta en `<em class="font-display text-gold">destacados</em>`.
- Subtítulo: "Una selección de experiencias diseñadas para contemplar el firmamento desde el lujo absoluto."
- Botón "Ver todos" (solo desktop, `display: none` debajo de `md`, `display: inline-flex` arriba) — píldora con anillo `.accent-gradient` al hover + flecha derecha, mismo patrón que los otros botones de anillo.

### Bento Grid

`display: grid; grid-template-columns: 1fr; gap: 1.5rem;` en móvil, `grid-template-columns: repeat(12, 1fr);` sobre `md`. Span en alternancia 7/5/5/7 (`grid-column: span 7 / span 5 / span 5 / span 7`) por tarjeta en secuencia.

4 tarjetas de experiencia (usar imágenes de los servicios actuales del sitio):

1. **Suites Observatorio** — habitaciones de lujo con techos y ventanales panorámicos orientados al cielo nocturno.
2. **Terraza & Telescopios** — telescopios profesionales y asistentes de astrofotografía.
3. **Spa & Círculo Térmico** — piscinas climatizadas, jacuzzis y fogatas bajo la Vía Láctea.
4. **Tours Astronómicos** — recorridos guiados con talleres de astrofotografía y senderismo nocturno.

Cada tarjeta: `<article class="service-card">` — `background: hsl(var(--surface)); border: 1px solid hsl(var(--stroke)); border-radius: 1.5rem;` con aspect-ratio fijo. Contiene:

- `<img>` de fondo — `object-fit: cover; transition: transform 0.4s;`, escalado con `.service-card:hover img { transform: scale(1.05); }`.
- Overlay halftone: `<div class="halftone">` — `background-image: radial-gradient(circle, #000 1px, transparent 1px); background-size: 4px 4px; opacity: 0.15; mix-blend-mode: multiply;`.
- Hover: `.service-card:hover .card-scrim { opacity: 1; }` sobre overlay `background: hsl(var(--bg) / 0.75); backdrop-filter: blur(16px);` (default `opacity: 0`, con transición).
- Label hover: píldora con borde `.accent-gradient` animado, fondo blanco, "Ver — *Título*" (título destacado en `font-display`).

## Sección 4: Eventos Nocturnos (ex Journal)

`<section id="eventos">` — `background: hsl(var(--bg)); padding: 6rem 0;`. Mismo patrón de header que Experiencias (eyebrow + "Eventos *nocturnos*" + subtítulo + botón "Ver todos"), animado con el mismo GSAP ScrollTrigger.

4 entradas como píldoras horizontales (`border-radius: 40px` en móvil, `border-radius: 9999px` sobre `sm`) con título, imagen miniatura, horario y fecha:

1. **Noches de Luna Nueva** — 20:00–23:30 (Hora Colombia). Observación de galaxias lejanas, nebulosas y cúmulos estelares.
2. **Astrofotografía Guiada** — 21:00–23:00. Talleres semanales para capturar la Vía Láctea con cámara o smartphone.
3. **Cenas Bajo las Estrellas** — 19:30–22:00. Menús degustación temáticos maridados con vinos selectos en la terraza.
4. **Bodas y Eventos Celestiales** — Cotización personalizada. Celebraciones exclusivas con ambientación espacial.

Cada entrada `<a class="evento-entry">`: `display: flex; align-items: center; gap: 1.5rem; padding: 1rem; background: hsl(var(--surface) / 0.3); border: 1px solid hsl(var(--stroke));`, con `:hover { background: hsl(var(--surface)); }`.

## Sección 5: Galería Estelar (ex Explorations / Parallax)

`<section id="galeria">` — `min-height: 300vh;` para parallax driven por scroll.

### Capa 1: Centro Fijo (`z-index: 10`)

Div de contenido `height: 100vh;`, fijado con GSAP ScrollTrigger:

```
ScrollTrigger.create({ trigger: "#galeria", pin: contentEl, pinSpacing: false, start: "top top", end: "bottom bottom" });
```

- Eyebrow: "Galería"
- Título: "Visual *estelar*"
- Subtítulo + botón hacia Instagram del hotel (o red social).

### Capa 2: Columnas Parallax (`z-index: 20`, `position: absolute`)

`display: grid; grid-template-columns: 1fr 1fr; gap: 3rem/10rem;` dentro de wrapper `max-width: 1400px`.

6 imágenes de la galería actual del hotel (Terraza Observatorio, Suites, Restaurante, Spa, Tours, Eventos) en 2 columnas. Desplazamiento vertical con GSAP ligado al progreso de scroll:

```
gsap.to(".parallax-col-1", { y: -200, ease: "none", scrollTrigger: { trigger: "#galeria", scrub: true } });
gsap.to(".parallax-col-2", { y: 200, ease: "none", scrollTrigger: { trigger: "#galeria", scrub: true } });
```

Tarjetas: `aspect-ratio: 1; max-width: 320px;`, con rotación leve (`transform: rotate(...)`) y click que abre un lightbox simple (overlay `<div>` fijo toggled con clase `.is-open`, sin librerías).

## Sección 6: Stats

`<section id="stats">` — `background: hsl(var(--bg)); padding: 6rem 0;`. Grid de 3 columnas (`grid-template-columns: repeat(3, 1fr);`) con estadísticas del hotel:

- **12+** Suites Observatorio (o "Noches Estrelladas")
- **40+** Telescopios Profesionales
- **98%** Huéspedes Satisfechos

Animar los números contando hacia arriba al entrar en viewport con la misma técnica de contador de la pantalla de carga, disparada por `IntersectionObserver`.

## Sección 7: Contacto / Footer

`<footer id="contacto">` — `background: hsl(var(--bg)); padding-top: 5rem; padding-bottom: 3rem; overflow: hidden;`.

### Video de Fondo

Misma fuente HLS y setup que el hero (segunda instancia `Hls` en un segundo `<video>`), pero volteado verticalmente (`transform: scaleY(-1);`). Overlay más pesado: `background: rgba(0,0,0,0.6);`.

### GSAP Marquee

`<div class="marquee"><span>BAJO LAS ESTRELLAS • </span> × 10` repetido 10× en el markup (o generado en JS con loop). Animar:

```
gsap.to(".marquee", { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
```

### CTA

Botón de reserva: `<a href="mailto:reservas@hotelpolaris.com">` con el mismo patrón de anillo `.accent-gradient` al hover. Añadir también teléfono/WhatsApp de Colombia si aplica.

### Barra del Footer

Redes sociales `[Instagram, Facebook, TripAdvisor, WhatsApp]` como iconos `<a>` + punto verde palpitante (`<span class="status-dot">` con `@keyframes pulse` de opacidad/escala) + texto "Aceptando reservas". Incluir copyright: "© 2026 Hotel Polaris. Todos los derechos reservados." y enlaces a las secciones (`#hero`, `#experiencias`, `#eventos`, `#galeria`, `#contacto`).

## Dependencias (CDN, sin bundler ni framework)

- `gsap` (core + plugin `ScrollTrigger`)
- `hls.js`
- Sin React, sin Framer Motion, sin TypeScript — toda la lógica en módulos ES planos según la estructura anterior.

Añadir smooth scroll (`html { scroll-behavior: smooth; }` o GSAP ScrollTo para los links ancla de navegación) y transiciones de entrada de página simples (patrón CSS `.page-enter`/`.page-enter-active`) en lugar de transiciones de rutas, ya que es una página única con navegación por anclas. Mantener todo el contenido en español (idioma del sitio actual). Los textos y precios existentes (desde $180/noche, horas COT/UTC-5) deben preservarse en las secciones correspondientes.