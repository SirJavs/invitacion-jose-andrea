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
const musicVideoId = "gn7HgzOEdHU";
const musicStartSeconds = 41;
const musicVolume = 3;

function updateMusicControls() {
  playSymbol.textContent = musicIsPlaying ? "Ⅱ" : "▶";
  musicToggle.setAttribute("aria-label", musicIsPlaying ? "Pausar música" : "Reproducir música");
  soundSymbol.textContent = musicIsMuted ? "×" : "♪";
  musicMute.setAttribute("aria-label", musicIsMuted ? "Activar sonido" : "Silenciar música");
}

function startMusicPlayback() {
  if (!musicPlayerReady) return;

  musicPlayer.unMute();
  musicPlayer.setVolume(musicVolume);
  musicIsMuted = false;

  const currentTime = musicPlayer.getCurrentTime();
  if (!Number.isFinite(currentTime) || currentTime < musicStartSeconds) {
    musicPlayer.seekTo(musicStartSeconds, true);
  }

  musicPlayer.playVideo();
  updateMusicControls();
}

window.onYouTubeIframeAPIReady = function () {
  musicPlayer = new YT.Player("youtube-player", {
    width: "200",
    height: "200",
    videoId: musicVideoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      start: musicStartSeconds,
      playsinline: 1,
      rel: 0,
    },
    events: {
      onReady: () => {
        musicPlayerReady = true;
        musicPlayer.unMute();
        musicPlayer.setVolume(musicVolume);
        if (invitationOpened) musicControls.hidden = false;
        if (musicShouldPlay) startMusicPlayback();
        updateMusicControls();
      },
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.ENDED && musicShouldPlay) {
          musicPlayer.seekTo(musicStartSeconds, true);
          musicPlayer.playVideo();
          return;
        }
        musicIsPlaying = event.data === YT.PlayerState.PLAYING;
        updateMusicControls();
      },
      onAutoplayBlocked: () => {
        musicIsPlaying = false;
        updateMusicControls();
      },
      onError: () => {
        musicIsPlaying = false;
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

function openInvitation() {
  if (intro.classList.contains("is-opening")) return;

  openButton.disabled = true;
  intro.classList.add("is-opening");
  musicShouldPlay = true;
  startMusicPlayback();

  window.setTimeout(() => {
    intro.classList.add("is-finished");
    intro.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-intro-active");
    pageContent.forEach((element) => { element.inert = false; });
    invitationOpened = true;
    musicControls.hidden = false;
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
    startMusicPlayback();
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
