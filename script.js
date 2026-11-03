
/* MI WEB — LUPE | INTERACCIONES */

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const hoverDevice = window.matchMedia(
  "(hover: hover) and (pointer: fine)"
).matches;

/* MENÚ */
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");

    menuToggle.innerHTML = open
      ? '<i class="fa-solid fa-xmark"></i>'
      : '<i class="fa-solid fa-bars"></i>';

    menuToggle.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll("#nav a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* SCROLL PROGRESS */
const progress = document.getElementById("progress");

function updateProgress() {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width =
    (max > 0 ? scrollY / max * 100 : 0) + "%";
}

addEventListener("scroll", updateProgress, { passive: true });
addEventListener("resize", updateProgress);
updateProgress();

/* REVEAL */
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .06 });

  revealElements.forEach(el => observer.observe(el));
} else {
  revealElements.forEach(el => el.classList.add("visible"));
}

/* ACTIVE NAV */
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll("#nav a").forEach(link => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === "#" + entry.target.id
        );
      });
    });
  }, { rootMargin: "-25% 0px -60% 0px" });

  document.querySelectorAll("main section[id]").forEach(el => {
    sectionObserver.observe(el);
  });
}

/* IMÁGENES */
document.querySelectorAll(".photo-box").forEach(box => {
  const img = box.querySelector("img");
  if (!img) return;

  function update() {
    box.classList.toggle(
      "has-image",
      img.complete && img.naturalWidth > 0
    );
  }

  img.addEventListener("load", update);
  img.addEventListener("error", () => {
    box.classList.remove("has-image");
  });

  update();
});

/* ESTRELLAS DISCRETAS */
const canvas = document.getElementById("stars");

if (canvas) {
  const ctx = canvas.getContext("2d");

  if (ctx) {
    let stars = [];
    let animationId = null;

    function resizeStars() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(115, Math.floor(innerWidth / 13));

      stars = Array.from({ length: count }, () => ({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        r: Math.random() * 1.1 + .25,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * .012 + .003,
        alpha: Math.random() * .35 + .2
      }));
    }

    function drawStars() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);

      stars.forEach(s => {
        const twinkle = reducedMotion
          ? 1
          : .75 + .25 * Math.sin(s.phase);

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184,224,255,${s.alpha * twinkle})`;
        ctx.fill();

        if (!reducedMotion) s.phase += s.speed;
      });

      if (!reducedMotion) {
        animationId = requestAnimationFrame(drawStars);
      }
    }

    resizeStars();
    drawStars();

    addEventListener("resize", () => {
      if (animationId !== null) cancelAnimationFrame(animationId);
      resizeStars();
      drawStars();
    });
  }
}


/* CURSOR GLOW */

const cursorGlow = document.getElementById("cursorGlow");

if (cursorGlow) {
  let mouseX = -1000;
  let mouseY = -1000;
  let currentX = -1000;
  let currentY = -1000;

  window.addEventListener("pointermove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorGlow.style.opacity = "1";
  });

  function animateCursor() {
    currentX += (mouseX - currentX) * 0.25;
    currentY += (mouseY - currentY) * 0.25;

    cursorGlow.style.transform =
      `translate3d(${currentX - 230}px, ${currentY - 230}px, 0)`;

    requestAnimationFrame(animateCursor);
  }

  animateCursor();
}


/* LUPE HOVER */
const lupeTitle = document.getElementById("lupeTitle");

if (lupeTitle && hoverDevice) {
  lupeTitle.addEventListener("pointermove", e => {
    const rect = lupeTitle.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;
    lupeTitle.style.setProperty("--lx", x + "%");
    lupeTitle.style.setProperty("--ly", y + "%");
  });
}

/* POLAROIDS 3D */
if (hoverDevice && !reducedMotion) {
  document.querySelectorAll(".glass-photo").forEach(photo => {
    photo.addEventListener("pointermove", e => {
      const rect = photo.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rx = (.5 - y) * 10;
      const ry = (x - .5) * 10;
      const angle = getComputedStyle(photo)
        .getPropertyValue("--rotation").trim() || "0deg";

      photo.style.transform = `
        perspective(950px)
        rotate(${angle})
        rotateX(${rx}deg)
        rotateY(${ry}deg)
        scale(1.025)
      `;
      photo.style.setProperty("--shine", (100 - x * 100) + "%");
    });

    photo.addEventListener("pointerleave", () => {
      photo.style.transform = "";
      photo.style.setProperty("--shine", "100%");
    });
  });
}

/* LIBROS */
const bookInformation = {
  "Harry Potter":
    "Harry potter es una saga muy importante para mí, fue aquella que me introdujo al género de fantasía y me motivo a empezar a leer libros de más de 1000 hojas como La orden del Fénix, mi libro favorito es el Caliz de Fuego y me gustan las adaptaciones, espero que la serie sea igual de buena que las novelas",
  "Percy Jackson":
    "Mitología griega, aventuras y personajes increíbles. Me encantan todos los tipos de mitología como la griega, romana, egipcia y nórdica. Cada una de ellas esta en esta saga y las refleja muy bien. Por estos libros aprendí mas de cultura y me incentivaron a conocer más, incluso este y un musical me llevaron a leer LA ODISEA Y LA ILIADA completamente en verso muchísimas veces.",
  "Los juegos del hambre":
    "Esta es una precuela a la triología original de Collins, quiero saber más sobre el pasado del capitolio, este es mi libro fav de la saga porque explica muchos vacíos. Este Noviembre sale la película en cines después de años, necesito que sea muy parecida al libroo",
  "Sherlock Holmes":
    "Esta es una lectura pendiente para mí, quiero leerme Sherlock Holmes ya que me leí Enola Holmes, la saga de su hermana escrita por Nancy Springer, no el autor original que fué Arthur Conan Doyle.",
  "Enola Holmes":
    "Aventuras, independencia, ingenio y resolución de misterios. Mi saga favorita de misterio, mi libro favorito es El caso de la dama zurda, tiene demasiados giros inesperados",
  "La Odisea":
    "Leí La Odisea completa en verso. Esta poesía épica me pareció muy interesante y la curiosidad me llevó a leerme las novelas originales escritas por Homero sin adaptar pero si traducidas, cuando me aburro me encanta repetir la lectura",
  "La Ilíada":
    "Leí La Ilíada completa en verso. Al igual que la Odisea esta historia me encanta y me ayuda a aprender más sobre cultura e historia clásica además de diferentes versiones de distintos mitos"
};

const bookModal = document.getElementById("bookModal");
const bookModalTitle = document.getElementById("bookModalTitle");
const bookModalDescription = document.getElementById("bookModalDescription");
const modalClose = document.getElementById("modalClose");

let lastFocusedElement = null;

function openBookModal(book) {
  if (!bookModal) return;

  lastFocusedElement = document.activeElement;
  bookModalTitle.textContent = book;
  bookModalDescription.textContent =
    bookInformation[book] || "Aquí escribiré mi opinión.";

  bookModal.classList.add("open");
  bookModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  modalClose.focus();
}

function closeBookModal() {
  if (!bookModal || !bookModal.classList.contains("open")) return;

  bookModal.classList.remove("open");
  bookModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (lastFocusedElement) lastFocusedElement.focus();
}

document.querySelectorAll("[data-book]").forEach(book => {
  book.addEventListener("click", () => {
    openBookModal(book.dataset.book);
  });
});

if (modalClose) modalClose.addEventListener("click", closeBookModal);

if (bookModal) {
  bookModal.addEventListener("click", e => {
    if (e.target === bookModal) closeBookModal();
  });
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeBookModal();

  if (e.key === "Tab" && bookModal?.classList.contains("open")) {
    e.preventDefault();
    modalClose.focus();
  }
});

/* ONDA MUSICAL */
const soundBars = document.getElementById("soundBars");

if (soundBars) {
  for (let i = 0; i < 55; i++) {
    const bar = document.createElement("span");
    bar.className = "sound-bar";

    const distance = Math.abs(i - 27) / 27;
    const height = 5 + (1 - distance) * (10 + Math.random() * 28);

    bar.style.setProperty("--base-height", height + "px");
    bar.style.setProperty(
      "--duration",
      (.8 + Math.random() * 1.2) + "s"
    );
    bar.style.setProperty("--delay", (-Math.random() * 2) + "s");
    soundBars.appendChild(bar);
  }
}

/* AUDIO DE MUSICALES */
const musicalAudio = document.getElementById("musicalAudio");
const soundToggle = document.getElementById("soundToggle");
const soundStatus = document.getElementById("soundStatus");

const musicalNames = {
  hamilton: "Hamilton",
  epic: "EPIC",
  six: "SIX",
  hadestown: "Hadestown",
  heathers: "Heathers"
};

let soundEnabled = false;
let activeMusical = null;

function stopMusical() {
  if (!musicalAudio) return;
  musicalAudio.pause();
  musicalAudio.currentTime = 0;
  activeMusical = null;
}

function playMusical(key) {
  if (!musicalAudio || !musicalNames[key]) return;

  activeMusical = key;
  soundStatus.textContent = "♫ " + musicalNames[key];

  if (!soundEnabled) return;

  musicalAudio.pause();
  musicalAudio.src = "audio/" + key + ".mp3";
  musicalAudio.currentTime = 0;

  const playback = musicalAudio.play();

  if (playback && typeof playback.catch === "function") {
    playback.catch(() => {
      if (activeMusical === key) {
        soundStatus.textContent =
          "No se pudo reproducir audio/" + key + ".mp3";
      }
    });
  }
}

function updateSoundButton() {
  if (!soundToggle) return;

  soundToggle.innerHTML = soundEnabled
    ? '<i class="fa-solid fa-volume-high"></i> Silenciar'
    : '<i class="fa-solid fa-volume-xmark"></i> Activar sonido';
}

if (soundToggle) {
  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    updateSoundButton();

    if (!soundEnabled) {
      stopMusical();
      soundStatus.textContent = "Sonido desactivado ✦";
    } else {
      soundStatus.textContent =
        "Sonido activado. Pasa el cursor sobre un musical ✦";
    }
  });
}

document.querySelectorAll(".musical-polaroid").forEach(card => {
  const key = card.dataset.musical;

  card.addEventListener("pointerenter", () => playMusical(key));

  card.addEventListener("pointerleave", () => {
    if (activeMusical !== key) return;
    stopMusical();
    soundStatus.textContent = "Pasa el cursor sobre un musical ✦";
  });

  card.addEventListener("focus", () => {
    if (soundEnabled) playMusical(key);
  });

  card.addEventListener("blur", () => {
    if (activeMusical === key) stopMusical();
  });

  card.addEventListener("click", () => {
    if (!soundEnabled) {
      soundEnabled = true;
      updateSoundButton();
    }
    playMusical(key);
  });

  card.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      card.click();
    }
  });
});

/* AÑO */
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* ===== MARVEL INTERACTIVO ===== */

document.querySelectorAll(".marvel-panel").forEach(panel => {
  panel.addEventListener("click", () => {

    document.querySelectorAll(".marvel-panel").forEach(p => {
      p.classList.remove("active", "marvel-panel-main");
    });

    panel.classList.add("active", "marvel-panel-main");

    const container = document.querySelector(".marvel-panels");
    container.prepend(panel);

  });
});
