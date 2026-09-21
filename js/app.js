(() => {
  "use strict";

  // =========================================================
  // Loader: only waits for lightweight visual assets.
  // The song starts streaming after the user taps "Empezar".
  // =========================================================
  const loader = document.getElementById("loader");
  const loaderPhrase = document.getElementById("loaderPhrase");
  const loaderBar = document.getElementById("loaderBar");

  const loaderPhrases = [
    "Compilando algo bonito para Eymiamor…",
    "Cargando gerberas amarillas…",
    "Preparando un detalle muy tuyo…",
    "Guardando nuestro recuerdo para el final…",
    "Casi listo, amor 💛"
  ];

  const loaderAssets = [
    "assets/images/us.jpg",
    "assets/images/snoopy.png"
  ];

  let loaderPhraseIndex = 0;
  let loadedVisualAssets = 0;
  const loaderStartedAt = performance.now();

  document.body.classList.add("is-loading");

  const phraseTimer = setInterval(() => {
    loaderPhrase.classList.add("changing");
    setTimeout(() => {
      loaderPhraseIndex = (loaderPhraseIndex + 1) % loaderPhrases.length;
      loaderPhrase.textContent = loaderPhrases[loaderPhraseIndex];
      loaderPhrase.classList.remove("changing");
    }, 220);
  }, 720);

  function preloadImage(url) {
    return new Promise(resolve => {
      const image = new Image();
      const done = () => {
        loadedVisualAssets += 1;
        const pct = 18 + Math.round((loadedVisualAssets / loaderAssets.length) * 82);
        loaderBar.style.width = `${Math.min(pct, 100)}%`;
        resolve();
      };
      image.onload = done;
      image.onerror = done;
      image.src = url;
    });
  }

  async function finishLoader() {
    await Promise.all(loaderAssets.map(preloadImage));

    // Prevent a jarring flash on very fast connections without making the site feel slow.
    const elapsed = performance.now() - loaderStartedAt;
    const minimumDisplay = 1250;
    if (elapsed < minimumDisplay) {
      await wait(minimumDisplay - elapsed);
    }

    clearInterval(phraseTimer);
    loaderBar.style.width = "100%";
    loaderPhrase.classList.remove("changing");
    loaderPhrase.textContent = "Todo listo para ti 💛";

    await wait(340);
    loader.classList.add("hidden");
    document.body.classList.remove("is-loading");

    setTimeout(() => loader.remove(), 700);
  }

  finishLoader();


  // =========================
  // CONFIGURACIÓN RÁPIDA
  // =========================
  const CONFIG = {
    girlfriendName: "Eymiamor",
    // Pega aquí una URL directa o un Data URI de un audio que tengas derecho de usar.
    // Ejemplo: "assets/audio/tu-cancion.mp3"
    musicUrl: "assets/audio/solo-por-vos.mp3",
    petals: true,
    petalIntervalMs: 650
  };

  const scenes = [...document.querySelectorAll(".scene")];
  const progress = document.getElementById("progress");
  const progressShell = document.getElementById("progressShell");
  const music = document.getElementById("bgMusic");
  const musicBtn = document.getElementById("musicBtn");
  const toast = document.getElementById("toast");
  const petalLayer = document.getElementById("petalLayer");
  const sparkLayer = document.getElementById("sparkLayer");
  const garden = document.getElementById("garden");
  const gardenNext = document.getElementById("gardenNext");
  const gardenHint = document.getElementById("gardenHint");
  const revealBtn = document.getElementById("revealBtn");

  let current = 0;
  let musicStarted = false;
  let bloomCount = 0;
  let terminalPlayed = false;
  let petalTimer = null;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  async function toggleMusic(forcePlay = false) {
    if (!CONFIG.musicUrl) {
      showToast("La página está lista: agrega tu canción en CONFIG.musicUrl.");
      return;
    }
    try {
      // Defer the 5 MB song until the first user interaction.
      if (!music.getAttribute("src")) {
        music.src = CONFIG.musicUrl;
      }
      if (music.paused || forcePlay) {
        await music.play();
        musicBtn.classList.add("playing");
        musicStarted = true;
      } else {
        music.pause();
        musicBtn.classList.remove("playing");
      }
    } catch (e) {
      showToast("Toca otra vez el botón de música para reproducirla.");
    }
  }

  musicBtn.addEventListener("click", () => toggleMusic());

  function goTo(index) {
    if (index < 0 || index >= scenes.length) return;
    scenes[current].classList.remove("active");
    current = index;
    scenes[current].classList.add("active");

    const pct = (current / (scenes.length - 1)) * 100;
    progress.style.width = `${pct}%`;

    if (current === 3 && !terminalPlayed) runTerminal();
    if (current === 4) {
      progressShell.style.opacity = "0";
      grandFinale();
    }
    setTimeout(refreshScrollCues, 120);
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-next]");
    if (!btn || btn.disabled) return;

    if (!musicStarted && current === 0 && CONFIG.musicUrl) {
      toggleMusic(true);
    }
    burst(btn.getBoundingClientRect().left + btn.offsetWidth / 2,
          btn.getBoundingClientRect().top + btn.offsetHeight / 2, 12);
    goTo(current + 1);
  });

  function burst(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "spark";
      const a = Math.random() * Math.PI * 2;
      const d = 28 + Math.random() * 56;
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      s.style.setProperty("--dx", `${Math.cos(a) * d}px`);
      s.style.setProperty("--dy", `${Math.sin(a) * d}px`);
      sparkLayer.appendChild(s);
      setTimeout(() => s.remove(), 1900);
    }
  }

  function spawnPetal(extra = false) {
    if (!CONFIG.petals) return;
    const p = document.createElement("i");
    p.className = "petal";
    p.style.left = `${Math.random() * 100}vw`;
    p.style.top = extra ? `${-10 - Math.random() * 20}vh` : "-10vh";
    p.style.setProperty("--drift", `${-120 + Math.random() * 240}px`);
    p.style.animationDuration = `${7 + Math.random() * 7}s`;
    p.style.transform = `scale(${.7 + Math.random() * .8})`;
    petalLayer.appendChild(p);
    setTimeout(() => p.remove(), 15000);
  }

  if (CONFIG.petals) {
    petalTimer = setInterval(spawnPetal, CONFIG.petalIntervalMs);
    for (let i = 0; i < 8; i++) setTimeout(() => spawnPetal(true), i * 180);
  }

  function makeGerbera(index) {
    const flower = document.createElement("div");
    flower.className = "gerbera";
    flower.style.setProperty("--s", String(.82 + index * .035));
    flower.setAttribute("role", "button");
    flower.setAttribute("tabindex", "0");
    flower.setAttribute("aria-label", "Hacer florecer una gerbera");

    let petals = "";
    for (let i = 0; i < 24; i++) {
      petals += `<span class="pet" style="transform:rotate(${i * 15}deg)"></span>`;
    }

    flower.innerHTML = `
      <span class="stem"></span>
      <span class="leaf"></span>
      <span class="leaf l2"></span>
      <span class="head">${petals}<span class="core"></span></span>
    `;

    const bloom = () => {
      if (flower.classList.contains("bloom")) return;
      flower.classList.add("bloom");
      bloomCount++;
      const r = flower.getBoundingClientRect();
      burst(r.left + r.width/2, r.top + 60, 10);
      checkGarden();
    };

    flower.addEventListener("click", bloom);
    flower.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        bloom();
      }
    });
    return { flower, bloom };
  }

  const flowerRefs = [];
  for (let i = 0; i < 5; i++) {
    const item = makeGerbera(i);
    flowerRefs.push(item);
    garden.appendChild(item.flower);
  }

  function checkGarden() {
    if (bloomCount >= flowerRefs.length) {
      gardenNext.disabled = false;
      gardenHint.textContent = "Listo. Tu jardín ya está floreciendo 💛";
      gardenNext.classList.remove("ghost");
      gardenNext.classList.add("primary");
    } else {
      gardenHint.textContent = `${bloomCount} de ${flowerRefs.length} gerberas floreciendo…`;
    }
  }

  document.getElementById("bloomAll").addEventListener("click", () => {
    flowerRefs.forEach((f, i) => setTimeout(f.bloom, i * 150));
  });

  const terminalLines = [
    `<span class="cmd">$ npm run surprise</span>`,
    `Buscando el recuerdo más bonito... <span class="ok">OK</span>`,
    `Cargando gerberas amarillas... <span class="ok">OK</span>`,
    `Asignando destinataria: <span class="gold">${CONFIG.girlfriendName}</span>`,
    `Origen: tu Ing.`,
    `Estado: <span class="ok">listo para desplegar 💛</span>`
  ];

  async function runTerminal() {
    terminalPlayed = true;
    const body = document.getElementById("terminalBody");
    body.innerHTML = "";
    for (let i = 0; i < terminalLines.length; i++) {
      const line = document.createElement("div");
      line.innerHTML = terminalLines[i] + (i === terminalLines.length - 1 ? ` <span class="cursor"></span>` : "");
      line.style.opacity = "0";
      body.appendChild(line);
      await wait(i === 0 ? 260 : 520);
      line.style.transition = ".35s ease";
      line.style.opacity = "1";
    }
    await wait(500);
    revealBtn.disabled = false;
  }

  revealBtn.addEventListener("click", () => {
    const r = revealBtn.getBoundingClientRect();
    burst(r.left + r.width/2, r.top + r.height/2, 18);
    goTo(4);
  });

  function grandFinale() {
    for (let i = 0; i < 36; i++) {
      setTimeout(() => spawnPetal(true), i * 80);
    }
    setTimeout(() => {
      burst(innerWidth / 2, innerHeight * .28, 26);
    }, 650);
  }

  function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  // Pequeño detalle interactivo en el final.
  document.getElementById("photoCard").addEventListener("pointerdown", (e) => {
    if (current !== 4) return;
    burst(e.clientX, e.clientY, 8);
  });

  // ===== Indicador inteligente de scroll =====
  const panelScrollState = new WeakMap();

  function ensureScrollCues() {
    document.querySelectorAll(".panel").forEach(panel => {
      if (panel.querySelector(":scope > .scroll-cue")) return;
      const cue = document.createElement("div");
      cue.className = "scroll-cue";
      cue.innerHTML = `<span>Desliza para ver más</span><i class="chev"></i>`;
      panel.appendChild(cue);

      const update = () => {
        const overflow = panel.scrollHeight > panel.clientHeight + 8;
        const nearBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 22;
        cue.classList.toggle("visible", overflow && !nearBottom);
      };

      panel.addEventListener("scroll", update, { passive: true });
      panelScrollState.set(panel, update);
      requestAnimationFrame(update);
    });
  }

  function refreshScrollCues() {
    document.querySelectorAll(".panel").forEach(panel => {
      const update = panelScrollState.get(panel);
      if (update) update();
    });
  }

  ensureScrollCues();
  window.addEventListener("resize", () => {
    clearTimeout(window.__eymiResizeTimer);
    window.__eymiResizeTimer = setTimeout(refreshScrollCues, 120);
  });

})();