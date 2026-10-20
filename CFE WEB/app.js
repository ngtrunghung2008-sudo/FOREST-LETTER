
// =========================================================
// FOREST LETTER — ỨNG DỤNG CHÍNH
// Chứa logic thư, Spotify, âm thanh và hiệu ứng rừng.
// =========================================================

import { SETTINGS } from "./config.js";
import { getLetter } from "./storage.js";

const $ = (selector) => document.querySelector(selector);

const elements = {
  gate: $("#gate-screen"),
  enter: $("#enter-forest"),
  main: $("#site-main"),
  intro: $("#intro-panel"),
  notFound: $("#not-found-panel"),
  experience: $("#letter-experience"),
  letterTo: $("#letter-to"),
  letterBody: $("#letter-body"),
  letterFrom: $("#letter-from"),
  playlistGrid: $("#playlist-grid"),
  playlistEmpty: $("#playlist-empty"),
  footerCode: $("#footer-code"),
  nav: $("#floating-nav"),
  soundToggle: $("#sound-toggle"),
  soundStatus: $("#sound-status"),
  canvas: $("#forest-canvas")
};

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const urlParams = new URLSearchParams(window.location.search);
const rawKey = urlParams.get("k");
const key = rawKey && rawKey.length <= 64 ? rawKey : "";
const letter = getLetter(key);

// ---------- Khởi động ----------

function initialize() {
  setupGate();
  setupNavigation();
  setupAudio();
  setupForest();

  if (!key) {
    elements.intro.hidden = false;
    return;
  }

  if (!letter) {
    elements.notFound.hidden = false;
    return;
  }

  elements.experience.hidden = false;
  elements.nav.hidden = false;

  renderLetter(letter);
  renderPlaylists(letter);
  elements.footerCode.textContent = `A LITTLE WORLD · ${letter.key}`;
}

// ---------- Cổng chào ----------

function setupGate() {
  elements.enter.addEventListener("click", () => {
    // Người dùng chủ động chạm: cho phép Web Audio khởi tạo.
    elements.gate.classList.add("gate-exit");
    elements.main.hidden = false;

    window.setTimeout(() => {
      elements.gate.hidden = true;
    }, reducedMotion ? 0 : 1000);

    // Chỉ tự phát khi chưa từng lưu lựa chọn tắt.
    const savedPreference = readSoundPreference();

    if (savedPreference !== "off") {
      startAudio();
    }
  });
}

// ---------- Hiển thị lá thư ----------

function renderLetter(data) {
  elements.letterTo.textContent = data.to;
  elements.letterFrom.textContent = data.from;

  // Không có nội dung: để giấy trống, giữ hoa văn rune.
  if (!data.body) {
    elements.letterBody.textContent = "";
    return;
  }

  if (reducedMotion) {
    elements.letterBody.textContent = data.body;
    return;
  }

  // Hiệu ứng viết chữ từng đoạn ngắn.
  typeText(elements.letterBody, data.body);
}

function typeText(target, text) {
  let index = 0;
  const step = 3;
  const interval = 17;

  target.textContent = "";

  function writeNext() {
    if (document.hidden) {
      window.setTimeout(writeNext, 120);
      return;
    }

    index = Math.min(index + step, text.length);
    target.textContent = text.slice(0, index);

    if (index < text.length) {
      window.setTimeout(writeNext, interval);
    }
  }

  writeNext();
}

// ---------- Spotify ----------

function parseSpotifyUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);

    if (
      parsed.protocol !== "https:" ||
      parsed.hostname.toLowerCase() !== "open.spotify.com"
    ) {
      return null;
    }

    // Hỗ trợ /intl-xx/ và link Spotify chuẩn.
    const segments = parsed.pathname
      .split("/")
      .filter(Boolean);

    if (segments[0] && /^intl-[a-z]{2}$/i.test(segments[0])) {
      segments.shift();
    }

    const type = segments[0];
    const id = segments[1];

    if (!["playlist", "album", "track"].includes(type)) {
      return null;
    }

    // ID Spotify thường có 22 ký tự; chấp nhận ID ngắn
    // hơn để thuận tiện cho link thử nghiệm.
    if (!id || !/^[A-Za-z0-9]+$/.test(id) || id.length > 100) {
      return null;
    }

    return {
      type,
      id,
      embedUrl: `https://open.spotify.com/embed/${type}/${id}`
    };
  } catch {
    return null;
  }
}

function renderPlaylists(data) {
  elements.playlistGrid.replaceChildren();

  const validItems = [];
  const errors = [];

  for (const rawUrl of data.playlists.slice(0, SETTINGS.maxPlaylists)) {
    const parsed = parseSpotifyUrl(rawUrl);

    if (parsed) {
      validItems.push(parsed);
    } else {
      errors.push(rawUrl);
    }
  }

  validItems.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "playlist-card";

    const frame = document.createElement("div");
    frame.className = "crystal-frame";

    const iframe = document.createElement("iframe");
    iframe.src = item.embedUrl;
    iframe.title = `Spotify ${item.type === "track" ? "track" : item.type === "album" ? "album" : "playlist"} ${index + 1}`;
    iframe.loading = "lazy";
    iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.height = item.type === "track" ? "152" : "352";

    frame.append(iframe);

    const label = document.createElement("p");
    label.className = "playlist-card-label";

    const star = document.createElement("span");
    star.textContent = "✧";

    const title = document.createElement("span");
    title.textContent = `Giai điệu ${String(index + 1).padStart(2, "0")}`;

    label.append(star, title);
    card.append(frame, label);
    elements.playlistGrid.append(card);
  });

  elements.playlistEmpty.hidden = validItems.length > 0;

  // Link lỗi chỉ được ghi vào console, không hiển thị URL khách gửi.
  if (errors.length > 0) {
    console.warn(
      `${errors.length} link Spotify không hợp lệ đã được bỏ qua.`
    );
  }

  // Không có playlist: ẩn hẳn phần giai điệu khi xem thư.
  const playlistSection = $("#melody");
  const divider = $(".vine-divider");

  if (validItems.length === 0) {
    playlistSection.hidden = true;
    divider.hidden = true;
    elements.nav.querySelector('[data-nav="melody"]').hidden = true;
  } else {
    playlistSection.hidden = false;
    divider.hidden = false;
    elements.nav.querySelector('[data-nav="melody"]').hidden = false;
  }
}

// ---------- Thanh điều hướng ----------

function setupNavigation() {
  const navItems = [...document.querySelectorAll(".nav-item")];

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navItems.forEach((item) => {
        const active = item.dataset.nav === visible.target.id;
        item.classList.toggle("nav-active", active);
      });
    },
    {
      rootMargin: "-20% 0px -55% 0px",
      threshold: [0, 0.15, 0.4, 0.7]
    }
  );

  const letterSection = $("#letter");
  const melodySection = $("#melody");

  if (letterSection) observer.observe(letterSection);
  if (melodySection) observer.observe(melodySection);
}

// ---------- Âm thanh Web Audio API ----------

let audioContext = null;
let masterGain = null;
let audioEnabled = false;
let audioNodes = [];
let pluckTimer = null;
let audioGeneration = 0;

function readSoundPreference() {
  try {
    return localStorage.getItem("forest-letter-sound");
  } catch {
    return null;
  }
}

function saveSoundPreference(value) {
  try {
    localStorage.setItem("forest-letter-sound", value);
  } catch {
    // Chế độ riêng tư có thể chặn localStorage.
  }
}

function setupAudio() {
  const saved = readSoundPreference();

  audioEnabled = saved === "on";

  updateSoundButton();

  elements.soundToggle.addEventListener("click", async () => {
    if (audioEnabled) {
      stopAudio();
      saveSoundPreference("off");
    } else {
      await startAudio();
      saveSoundPreference("on");
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (!audioContext) return;

    if (document.hidden) {
      audioContext.suspend().catch(() => {});
      clearTimeout(pluckTimer);
    } else if (audioEnabled) {
      audioContext.resume().catch(() => {});
      schedulePluck();
    }
  });
}

function updateSoundButton() {
  elements.soundToggle.setAttribute(
    "aria-pressed",
    String(audioEnabled)
  );

  elements.soundToggle.setAttribute(
    "aria-label",
    audioEnabled ? "Tắt âm thanh khu rừng" : "Bật âm thanh khu rừng"
  );

  elements.soundStatus.textContent = audioEnabled
    ? "Âm thanh: bật"
    : "Âm thanh: tắt";
}

async function startAudio() {
  if (audioEnabled && audioContext?.state === "running") {
    return;
  }

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    elements.soundStatus.textContent = "Trình duyệt không hỗ trợ âm thanh";
    return;
  }

  try {
    if (!audioContext) {
      audioContext = new AudioContextClass();

      masterGain = audioContext.createGain();
      masterGain.gain.value = 0;

      const compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.value = -26;
      compressor.knee.value = 18;
      compressor.ratio.value = 3;
      compressor.attack.value = 0.04;
      compressor.release.value = 0.3;

      masterGain.connect(compressor);
      compressor.connect(audioContext.destination);

      createReverb();
      createAmbientPad();
    }

    await audioContext.resume();

    audioEnabled = true;
    audioGeneration++;

    const now = audioContext.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setTargetAtTime(0.25, now, 1.2);

    updateSoundButton();
    schedulePluck();
  } catch (error) {
    audioEnabled = false;
    updateSoundButton();
    console.warn("Không thể khởi tạo âm thanh.", error);
  }
}

function createReverb() {
  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * 2;
  const impulse = audioContext.createBuffer(2, length, sampleRate);

  // Tạo impulse noise ngắn để tạo không gian vang.
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);

    for (let i = 0; i < length; i++) {
      const decay = Math.pow(1 - i / length, 3);
      data[i] = (Math.random() * 2 - 1) * decay;
    }
  }

  const convolver = audioContext.createConvolver();
  convolver.buffer = impulse;
  convolver.connect(masterGain);
  audioNodes.push(convolver);

  return convolver;
}

function createAmbientPad() {
  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 550;
  filter.Q.value = 0.5;

  const padGain = audioContext.createGain();
  padGain.gain.value = 0.12;

  const reverb = audioNodes.find(
    (node) => node instanceof ConvolverNode
  );

  filter.connect(padGain);
  padGain.connect(masterGain);

  if (reverb) {
    padGain.connect(reverb);
  }

  // Re trưởng: D3 và A3, lệch nhẹ để tạo pad ấm.
  [146.83, 220, 293.66].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const voiceGain = audioContext.createGain();

    oscillator.type = index === 1 ? "sine" : "triangle";
    oscillator.frequency.value = frequency;
    oscillator.detune.value = index === 2 ? 4 : -3;
    voiceGain.gain.value = index === 0 ? 0.26 : 0.12;

    oscillator.connect(voiceGain);
    voiceGain.connect(filter);
    oscillator.start();

    audioNodes.push(oscillator, voiceGain);
  });

  // LFO chậm điều khiển tần số lọc.
  const lfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();

  lfo.frequency.value = 0.08;
  lfoGain.gain.value = 130;

  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();

  audioNodes.push(filter, padGain, lfo, lfoGain);
}

function schedulePluck() {
  clearTimeout(pluckTimer);

  if (!audioEnabled || document.hidden || !audioContext) return;

  const generation = audioGeneration;

  // Ngũ cung Re trưởng: dịu, ít tạo cảm giác căng thẳng.
  const notes = [293.66, 349.23, 440, 523.25, 659.25, 440, 349.23];
  const frequency = notes[Math.floor(Math.random() * notes.length)];

  playPluck(frequency);

  // Thời gian ngẫu nhiên để tránh vòng lặp quá máy móc.
  const delay = 600 + Math.random() * 1250;

  pluckTimer = window.setTimeout(() => {
    if (generation === audioGeneration) schedulePluck();
  }, delay);
}

function playPluck(frequency) {
  if (!audioContext || !masterGain) return;

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const pan = audioContext.createStereoPanner();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

  pan.pan.setValueAtTime((Math.random() - 0.5) * 0.6, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.11, now + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

  oscillator.connect(gain);
  gain.connect(pan);
  pan.connect(masterGain);

  const reverb = audioNodes.find(
    (node) => node instanceof ConvolverNode
  );

  if (reverb) pan.connect(reverb);

  oscillator.start(now);
  oscillator.stop(now + 1.5);

  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
    pan.disconnect();
  };
}

function playBell() {
  if (!audioContext || !audioEnabled) return;

  playPluck(880);
}

function stopAudio() {
  if (!audioContext || !masterGain) {
    audioEnabled = false;
    updateSoundButton();
    return;
  }

  audioEnabled = false;
  audioGeneration++;
  clearTimeout(pluckTimer);

  const now = audioContext.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setTargetAtTime(0, now, 0.25);

  window.setTimeout(() => {
    if (!audioEnabled && audioContext?.state === "running") {
      audioContext.suspend().catch(() => {});
    }
  }, 1200);

  updateSoundButton();
}

// ---------- Rừng: đom đóm, lá rơi, parallax ----------

function setupForest() {
  const canvas = elements.canvas;
  const context = canvas.getContext("2d");

  if (!context) return;

  let width = 0;
  let height = 0;
  let animationFrame = 0;
  let particles = [];
  let lastTime = 0;
  let pageVisible = !document.hidden;

  const fireflyCount = reducedMotion
    ? 0
    : Math.min(48, Math.max(12, Math.floor(window.innerWidth / 22)));

  const leafCount = reducedMotion
    ? 0
    : Math.min(9, Math.max(3, Math.floor(window.innerWidth / 150)));

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    particles = [];

    for (let i = 0; i < fireflyCount; i++) {
      particles.push({
        type: "firefly",
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.7 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.12 + Math.random() * 0.32,
        drift: (Math.random() - 0.5) * 0.25
      });
    }

    for (let i = 0; i < leafCount; i++) {
      particles.push({
        type: "leaf",
        x: Math.random() * width,
        y: Math.random() * height,
        size: 3 + Math.random() * 5,
        speed: 0.12 + Math.random() * 0.3,
        sway: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.35,
        rotation: Math.random() * Math.PI * 2
      });
    }
  }

  function drawParticle(particle, time) {
    if (particle.type === "firefly") {
      const pulse = (Math.sin(time * particle.speed + particle.phase) + 1) / 2;
      const alpha = 0.12 + pulse * 0.5;

      context.beginPath();
      context.arc(
        particle.x,
        particle.y,
        particle.radius * (0.7 + pulse),
        0,
        Math.PI * 2
      );

      context.fillStyle = `rgba(190, 226, 155, ${alpha})`;
      context.shadowBlur = 8 + pulse * 8;
      context.shadowColor = "rgba(163, 220, 145, .55)";
      context.fill();
      context.shadowBlur = 0;

      particle.x += particle.drift;
      particle.y -= particle.speed * 0.12;

      if (particle.y < -10) particle.y = height + 10;
      if (particle.x < -10) particle.x = width + 10;
      if (particle.x > width + 10) particle.x = -10;

      return;
    }

    // Lá cây nhỏ xoay và trôi chậm.
    context.save();
    context.translate(particle.x, particle.y);
    context.rotate(particle.rotation + Math.sin(time * 0.0004) * 0.3);
    context.beginPath();
    context.ellipse(0, 0, particle.size, particle.size * 0.48, 0, 0, Math.PI * 2);
    context.fillStyle = "rgba(119, 151, 102, .34)";
    context.fill();
    context.restore();

    particle.x += particle.drift + Math.sin(particle.sway) * 0.12;
    particle.y += particle.speed;
    particle.sway += 0.008;
    particle.rotation += 0.002;

    if (particle.y > height + 10) {
      particle.y = -10;
      particle.x = Math.random() * width;
    }
  }

  function draw(time) {
    if (!pageVisible) return;

    animationFrame = requestAnimationFrame(draw);

    // Hạn chế công việc khi khung hình bị gián đoạn.
    if (time - lastTime < 28) return;
    lastTime = time;

    context.clearRect(0, 0, width, height);

    particles.forEach((particle) => drawParticle(particle, time));
  }

  function start() {
    cancelAnimationFrame(animationFrame);

    if (pageVisible && !reducedMotion) {
      animationFrame = requestAnimationFrame(draw);
    }
  }

  resize();
  start();

  window.addEventListener("resize", resize, { passive: true });

  document.addEventListener("visibilitychange", () => {
    pageVisible = !document.hidden;

    if (pageVisible) {
      start();
    } else {
      cancelAnimationFrame(animationFrame);
      context.clearRect(0, 0, width, height);
    }
  });

  // Parallax nhẹ theo vị trí cuộn.
  let scrollPending = false;

  window.addEventListener("scroll", () => {
    if (reducedMotion || scrollPending) return;

    scrollPending = true;

    requestAnimationFrame(() => {
      const offset = window.scrollY;

      $(".forest-layer-back").style.transform =
        `translate3d(0, ${offset * 0.025}px, 0)`;

      $(".forest-layer-middle").style.transform =
        `translate3d(0, ${offset * 0.045}px, 0)`;

      $(".forest-layer-front").style.transform =
        `translate3d(0, ${offset * 0.075}px, 0)`;

      scrollPending = false;
    });
  }, { passive: true });
}

// ---------- Chạy ứng dụng ----------

initialize();
