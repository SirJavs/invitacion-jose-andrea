const intro = document.querySelector("#intro");
const openButton = document.querySelector("#open-invitation");
const invitation = document.querySelector("#inicio");
const pageContent = document.querySelectorAll("body > :not(.intro):not(script)");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const countdown = document.querySelector("[data-countdown]");
const musicControls = document.querySelector("#music-controls");
const musicToggle = document.querySelector("#music-toggle");
const musicMute = document.querySelector("#music-mute");
const playSymbol = document.querySelector("#music-play-symbol");
const soundSymbol = document.querySelector("#music-sound-symbol");
let musicPlayer;
let musicPlayerReady = false;
let musicShouldPlay = false;
let musicIsPlaying = false;
let musicIsMuted = false;
let invitationOpened = false;

function updateMusicControls() {
  playSymbol.textContent = musicIsPlaying ? "Ⅱ" : "▶";
  musicToggle.setAttribute("aria-label", musicIsPlaying ? "Pausar música" : "Reproducir música");
  soundSymbol.textContent = musicIsMuted ? "×" : "♪";
  musicMute.setAttribute("aria-label", musicIsMuted ? "Activar sonido" : "Silenciar música");
}

window.onYouTubeIframeAPIReady = function () {
  musicPlayer = new YT.Player("youtube-player", {
    width: "1",
    height: "1",
    videoId: "5HcW4grRtrg",
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      loop: 1,
      playlist: "5HcW4grRtrg",
      playsinline: 1,
      rel: 0,
    },
    events: {
      onReady: () => {
        musicPlayerReady = true;
        musicPlayer.setVolume(20);
        if (invitationOpened) musicControls.hidden = false;
        if (musicShouldPlay) musicPlayer.playVideo();
        updateMusicControls();
      },
      onStateChange: (event) => {
        musicIsPlaying = event.data === YT.PlayerState.PLAYING;
        updateMusicControls();
      },
    },
  });
};

const youtubeApi = document.createElement("script");
youtubeApi.src = "https://www.youtube.com/iframe_api";
youtubeApi.async = true;
document.head.appendChild(youtubeApi);

if (window.location.hash) {
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
}

window.scrollTo(0, 0);
pageContent.forEach((element) => { element.inert = true; });
openButton.focus({ preventScroll: true });

function startPetals() {
  if (reduceMotion) return;

  const petals = document.querySelector("#hero-petals");
  const fragment = document.createDocumentFragment();
  const petalCount = window.matchMedia("(max-width: 620px)").matches ? 18 : 28;

  for (let index = 0; index < petalCount; index += 1) {
    const petal = document.createElement("span");
    petal.className = "hero__petal";
    petal.style.cssText = `
      left: ${(index + Math.random()) / petalCount * 100}%;
      --petal-size: ${9 + Math.random() * 10}px;
      --petal-duration: ${11 + Math.random() * 9}s;
      --petal-delay: ${-Math.random() * 20}s;
      --petal-drift: ${-65 + Math.random() * 130}px;
      --petal-turn: ${180 + Math.random() * 360}deg;
      --petal-sway: ${2 + Math.random() * 3}s;
    `;
    fragment.appendChild(petal);
  }

  petals.appendChild(fragment);
  const updateDistance = () => {
    petals.style.setProperty("--petal-fall-distance", `${invitation.offsetHeight + 80}px`);
  };
  updateDistance();
  new ResizeObserver(updateDistance).observe(invitation);

  let heroIsVisible = true;
  const updatePlayback = () => {
    petals.classList.toggle("is-active", heroIsVisible && !document.hidden);
  };
  new IntersectionObserver(([entry]) => {
    heroIsVisible = entry.isIntersecting;
    updatePlayback();
  }).observe(invitation);
  document.addEventListener("visibilitychange", updatePlayback);
  updatePlayback();
}

function startScrollReveal() {
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  const elements = document.querySelectorAll(`
    .hero__content > *,
    .countdown .eyebrow, .countdown .section-title, .countdown__grid > div,
    .story__image, .story__content > *,
    .place__photo, .place__card > *,
    .schedule .eyebrow, .schedule .section-title, .timeline__item,
    .details__heading > *, .detail-card,
    .rsvp__content > *, .footer > *
  `);
  const siblingDelays = new Map();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });

  elements.forEach((element) => {
    const siblingIndex = siblingDelays.get(element.parentElement) || 0;
    siblingDelays.set(element.parentElement, siblingIndex + 1);
    element.style.setProperty("--reveal-delay", `${Math.min(siblingIndex, 3) * 90}ms`);
    element.classList.add("scroll-reveal");
    observer.observe(element);
  });
}

function openInvitation() {
  if (intro.classList.contains("is-opening")) return;

  openButton.disabled = true;
  intro.classList.add("is-opening");
  musicShouldPlay = true;
  if (musicPlayerReady) musicPlayer.playVideo();

  window.setTimeout(() => {
    intro.classList.add("is-finished");
    intro.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-intro-active");
    pageContent.forEach((element) => { element.inert = false; });
    invitationOpened = true;
    startScrollReveal();
    startPetals();
    if (musicPlayerReady) musicControls.hidden = false;
    window.scrollTo(0, 0);
    invitation.focus({ preventScroll: true });
  }, reduceMotion ? 120 : 1900);
}

openButton.addEventListener("click", openInvitation);

musicToggle.addEventListener("click", () => {
  if (!musicPlayerReady) return;

  if (musicIsPlaying) {
    musicShouldPlay = false;
    musicPlayer.pauseVideo();
  } else {
    musicShouldPlay = true;
    musicPlayer.playVideo();
  }
});

musicMute.addEventListener("click", () => {
  if (!musicPlayerReady) return;

  if (musicIsMuted) {
    musicPlayer.unMute();
    musicIsMuted = false;
  } else {
    musicPlayer.mute();
    musicIsMuted = true;
  }
  updateMusicControls();
});

function updateCountdown() {
  const weddingDate = new Date(countdown.dataset.countdown).getTime();
  const distance = Math.max(0, weddingDate - Date.now());
  const values = {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance % 86400000) / 3600000),
    minutes: Math.floor((distance % 3600000) / 60000),
    seconds: Math.floor((distance % 60000) / 1000),
  };

  Object.entries(values).forEach(([unit, value]) => {
    const digits = unit === "days" ? 3 : 2;
    countdown.querySelector(`[data-unit="${unit}"]`).textContent = String(value).padStart(digits, "0");
  });
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

if (reduceMotion) {
  intro.classList.add("reduce-motion");
}
