/* ========
   CARRUSEL
   ========*/
document.addEventListener('DOMContentLoaded', () => {

    const track = document.getElementById('carouselTrack');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const dotsNav = document.getElementById('carouselDots');

    if (track && dotsNav && nextBtn && prevBtn) {
        const slides = Array.from(track.children);
        let currentIndex = 0;
        let autoSlideTimer; 

        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dotsNav.appendChild(dot);
            dot.addEventListener('click', () => {
                moveToSlide(index);
                resetAutoSlide(); 
            });
        });

        const dots = Array.from(dotsNav.children);

        function moveToSlide(index) {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            track.style.transform = `translateX(-${index * 100}%)`;
            dots[currentIndex].classList.remove('active');
            dots[index].classList.add('active');
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

        nextBtn.addEventListener('click', () => {
            moveToSlide(currentIndex + 1);
            resetAutoSlide();
        });

        prevBtn.addEventListener('click', () => {
            moveToSlide(currentIndex - 1);
            resetAutoSlide();
        });

        startAutoSlide();
    }
})
/* ====================
   CLICK EN EL CARRUSEL
   ====================*/
const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <img class="modal-img" id="modalImg" src="" alt="Imagen ampliada">
            <div class="modal-caption">
                <h3 id="modalTitle"></h3>
                <p id="modalDesc"></p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const closeBtn = modal.querySelector('.modal-close');

    const carouselImages = document.querySelectorAll('.carousel-slide');
    
    carouselImages.forEach(slide => {
        slide.addEventListener('click', () => {
            const img = slide.querySelector('img');
            const title = slide.querySelector('.overlay-title');
            const desc = slide.querySelector('.overlay-desc');

            if (img) {
                modalImg.src = img.src;
                modalImg.alt = img.alt;
                modalTitle.textContent = title ? title.textContent : img.alt;
                modalDesc.textContent = desc ? desc.textContent : 'Detalle de la experiencia en Hotel Polaris.';
                
                modal.classList.add('active');
            }
        });
    });

    function closeModal() {
        modal.classList.remove('active');
    }

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
/* ===============================
   CLICK EN LAS IMAGENES DEL INDEX
   ===============================*/
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <img class="modal-img" id="modalImg" src="" alt="Imagen ampliada">
            <div class="modal-caption">
                <h3 id="modalTitle"></h3>
                <p id="modalDesc"></p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const closeBtn = modal.querySelector('.modal-close');
    const expandableImages = document.querySelectorAll('.carousel-slide, .card-img-wrapper, .service-card img');

    expandableImages.forEach(container => {
        container.addEventListener('click', (e) => {
            let img = container.tagName === 'IMG' ? container : container.querySelector('img');
            
            if (img) {
                const parentCard = container.closest('.service-card') || container.closest('.carousel-slide');
                const title = parentCard ? parentCard.querySelector('.card-subheading, .overlay-title') : null;
                const desc = parentCard ? parentCard.querySelector('.card-text, .overlay-desc') : null;

                modalImg.src = img.src;
                modalImg.alt = img.alt;
                modalTitle.textContent = title ? title.textContent : img.alt;
                modalDesc.textContent = desc ? desc.textContent : 'Fotografía oficial de Hotel Polaris.';
                
                modal.classList.add('active');
            }
        });
    });

    function closeModal() {
        modal.classList.remove('active');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
});