"use strict";

const SVG_NS = "http://www.w3.org/2000/svg";
const LINE_LEFT = 82;
const LINE_RIGHT = 918;
const LINE_Y = 188;

const requestedGrade = new URLSearchParams(window.location.search).get("grade");
const configuredGrade = /^d[1-3]$/.test(window.NUMBER_LINE_GRADE || "")
  ? window.NUMBER_LINE_GRADE
  : (/^d[1-3]$/.test(requestedGrade || "") ? requestedGrade : null);

const gradeConfigs = {
  d1: { year: 1, max: 100, roundingBases: [10], stepChoices: [1, 2, 5, 10] },
  d2: { year: 2, max: 1000, roundingBases: [10, 100], stepChoices: [1, 5, 10, 100] },
  d3: { year: 3, max: 10000, roundingBases: [10, 100, 1000], stepChoices: [1, 10, 100] }
};

const editionDefaults = {
  d1: {
    explore: { range: 100, value: 37, step: 1 },
    compare: { a: 38, b: 64, level: 100 },
    rounding: { value: 37, base: 10 },
    pattern: { start: 20, step: 5, direction: 1, directionMode: "random", missingIndex: 3, level: 100 }
  },
  d2: {
    explore: { range: 1000, value: 537, step: 10 },
    compare: { a: 538, b: 764, level: 1000 },
    rounding: { value: 237, base: 10 },
    pattern: { start: 120, step: 5, direction: 1, directionMode: "random", missingIndex: 3, level: 1000 }
  },
  d3: {
    explore: { range: 10000, value: 5370, step: 100 },
    compare: { a: 5380, b: 7640, level: 10000 },
    rounding: { value: 2370, base: 100 },
    pattern: { start: 1200, step: 50, direction: 1, directionMode: "random", missingIndex: 3, level: 10000 }
  }
};

const fixedGrade = configuredGrade ? gradeConfigs[configuredGrade] : null;
const initialEdition = configuredGrade ? editionDefaults[configuredGrade] : null;

const ui = {
  controls: document.getElementById("controlsHost"),
  modeTitle: document.getElementById("modeTitle"),
  prompt: document.getElementById("promptText"),
  display: document.getElementById("numberDisplay"),
  line: document.getElementById("numberLine"),
  lineLayer: document.getElementById("lineLayer"),
  answer: document.getElementById("answerArea"),
  feedback: document.getElementById("feedback"),
  newQuestion: document.getElementById("newQuestionBtn"),
  speak: document.getElementById("speakBtn"),
  sound: document.getElementById("soundToggle"),
  celebration: document.getElementById("celebrationLayer"),
  gradeBadge: document.getElementById("gradeBadge"),
  levelEyebrow: document.getElementById("levelEyebrow")
};

const messages = {
  bm: {
    appTitle: "Jom Main Garis Nombor!",
    appSubtitle: "Lihat, tekan dan cari jawapan.",
    modeExplore: "Kenal Nombor", modeCompare: "Mana Lebih Besar?", modeRounding: "Nombor Terdekat", modePattern: "Cari Pola",
    controls: "Pilih nombor", yourTask: "Mari cuba!", newQuestion: "Cuba soalan lain",
    stepLook: "Lihat garis nombor", stepThink: "Pilih jawapan", stepAnswer: "Semak terus",
    speakAnswer: "Dengar jawapan", speakNumber: "Dengar nombor", soundOn: "Bunyi: Buka", soundOff: "Bunyi: Tutup",
    titleExplore: "Kenal nombor", titleCompare: "Mana lebih besar?", titleRounding: "Cari nombor terdekat", titlePattern: "Cari pola",
    promptExplore: "Tekan pada garis nombor untuk memilih nombor.",
    promptCompare: (a, b) => `Bandingkan ${a} dan ${b}. Ayat mana yang betul?`,
    promptRounding: (n, base) => `${n} lebih dekat kepada ${base === 10 ? "puluh" : base === 100 ? "ratus" : "ribu"} yang mana?`,
    promptPattern: "Nombor apa yang hilang?",
    range: "Julat nombor", number: "Nombor", stepSize: "Saiz langkah", firstNumber: "Nombor pertama", secondNumber: "Nombor kedua",
    level: "Tahap", easyLevel: "Mudah (0–100)", d2Level: "D2 (0–1,000)", d3Level: "D3 (0–10,000)",
    roundingTo: "Bundar kepada", nearest10: "Puluh terdekat", nearest100: "Ratus terdekat", nearest1000: "Ribu terdekat",
    start: "Nombor mula", difference: "Perbezaan", direction: "Arah pola", randomDirection: "Rawak", increasing: "Menaik", decreasing: "Menurun",
    selected: "Nombor dipilih", clickHint: "Tekan garis atau butang + dan −.",
    compareHint: "Pilih ayat perbandingan yang betul.", roundHint: "Pilih jawapan yang paling dekat.", patternHint: "Taip nombor yang hilang.",
    check: "Semak", correct: "Betul!", tryAgain: "Cuba lagi. Lihat kedudukan nombor pada garis.",
    lessThan: "lebih kecil", greaterThan: "lebih besar", differentNumbers: "Pilih dua nombor yang berlainan.",
    compareCorrect: (a, relation, b) => `Betul! ${a} ${relation} daripada ${b}.`,
    roundCorrect: (n, answer) => `Betul! ${n} dibundarkan menjadi ${answer}.`,
    roundExplain: (low, high) => `Bandingkan jarak kepada ${low} dan ${high}.`,
    patternCorrect: (answer) => `Betul! Nombor yang hilang ialah ${answer}.`,
    enterAnswer: "Masukkan jawapan", samePlace: "Kedua-dua nombor berada pada kedudukan yang sama.",
    markerA: "Nombor A", markerB: "Nombor B", midpoint: "Titik tengah", missing: "Hilang"
  },
  zh: {
    appTitle: "一起玩数轴！", appSubtitle: "看一看、点一点、找答案。",
    modeExplore: "认识数字", modeCompare: "谁比较大？", modeRounding: "找最近的数", modePattern: "找规律",
    controls: "选择数字", yourTask: "来试一试！", newQuestion: "换一题",
    stepLook: "看数轴", stepThink: "选答案", stepAnswer: "马上检查",
    speakAnswer: "听答案", speakNumber: "听数字", soundOn: "声音：开", soundOff: "声音：关",
    titleExplore: "认识数字", titleCompare: "谁比较大？", titleRounding: "找最近的数", titlePattern: "找规律",
    promptExplore: "点击数轴，选择一个数字。", promptCompare: (a, b) => `比较 ${a} 和 ${b}，哪一句是对的？`,
    promptRounding: (n, base) => `${n} 比较靠近哪一个整${base === 10 ? "十" : base === 100 ? "百" : "千"}数？`,
    promptPattern: "少了哪一个数字？",
    range: "数字范围", number: "数字", stepSize: "每次移动", firstNumber: "第一个数", secondNumber: "第二个数",
    level: "等级", easyLevel: "简单（0–100）", d2Level: "二年级（0–1,000）", d3Level: "三年级（0–10,000）",
    roundingTo: "取整单位", nearest10: "最接近的十", nearest100: "最接近的百", nearest1000: "最接近的千",
    start: "开始数字", difference: "相差", direction: "规律方向", randomDirection: "随机", increasing: "顺序（递增）", decreasing: "逆序（递减）",
    selected: "已选择", clickHint: "点击数轴，或使用 + 和 −。", compareHint: "请选择正确的比较句子。",
    roundHint: "选择最靠近的答案。", patternHint: "输入缺少的数字。", check: "检查",
    correct: "答对了！", tryAgain: "再试一次，看看数字在数轴上的位置。",
    lessThan: "小过", greaterThan: "大过", differentNumbers: "请选择两个不同的数字。",
    compareCorrect: (a, relation, b) => `答对了！${a} ${relation} ${b}。`, roundCorrect: (n, answer) => `答对了！答案是 ${answer}。`,
    roundExplain: (low, high) => `比较它到 ${low} 和 ${high} 的距离。`, patternCorrect: (answer) => `答对了！缺少的数字是 ${answer}。`,
    enterAnswer: "输入答案", samePlace: "两个数字在相同的位置。", markerA: "数字 A", markerB: "数字 B", midpoint: "中点", missing: "缺少"
  },
  en: {
    appTitle: "Number Line Fun!", appSubtitle: "Look, tap, and find the answer.",
    modeExplore: "Know Numbers", modeCompare: "Which Is Bigger?", modeRounding: "Nearest Number", modePattern: "Find the Pattern",
    controls: "Choose numbers", yourTask: "Let's try!", newQuestion: "Try another one",
    stepLook: "Look at the line", stepThink: "Choose an answer", stepAnswer: "Check it",
    speakAnswer: "Hear the answer", speakNumber: "Hear the number", soundOn: "Sound: On", soundOff: "Sound: Off",
    titleExplore: "Know numbers", titleCompare: "Which is bigger?", titleRounding: "Find the nearest number", titlePattern: "Find the pattern",
    promptExplore: "Tap the number line to choose a number.", promptCompare: (a, b) => `Compare ${a} and ${b}. Which sentence is correct?`,
    promptRounding: (n, base) => `Which multiple of ${base} is ${n} closer to?`, promptPattern: "Which number is missing?",
    range: "Number range", number: "Number", stepSize: "Step size", firstNumber: "First number", secondNumber: "Second number",
    level: "Level", easyLevel: "Easy (0–100)", d2Level: "D2 (0–1,000)", d3Level: "D3 (0–10,000)",
    roundingTo: "Round to", nearest10: "Nearest 10", nearest100: "Nearest 100", nearest1000: "Nearest 1,000",
    start: "Starting number", difference: "Difference", direction: "Pattern direction", randomDirection: "Random", increasing: "Increasing", decreasing: "Decreasing",
    selected: "Selected number", clickHint: "Tap the line, or use + and −.", compareHint: "Choose the correct comparison sentence.",
    roundHint: "Choose the nearest answer.", patternHint: "Type the missing number.", check: "Check",
    correct: "Correct!", tryAgain: "Try again. Look at the positions on the number line.",
    lessThan: "is smaller", greaterThan: "is bigger", differentNumbers: "Please choose two different numbers.",
    compareCorrect: (a, relation, b) => `Correct! ${a} ${relation} than ${b}.`, roundCorrect: (n, answer) => `Correct! The answer is ${answer}.`,
    roundExplain: (low, high) => `Compare its distance from ${low} and ${high}.`, patternCorrect: (answer) => `Correct! The missing number is ${answer}.`,
    enterAnswer: "Enter your answer", samePlace: "Both numbers are at the same position.", markerA: "Number A", markerB: "Number B", midpoint: "Midpoint", missing: "Missing"
  }
};

const state = {
  lang: "bm",
  mode: "explore",
  spokenAnswer: "",
  soundEnabled: readSoundPreference(),
  explore: initialEdition ? { ...initialEdition.explore } : { range: 100, value: 37, step: 1 },
  compare: initialEdition ? { ...initialEdition.compare } : { a: 538, b: 764, level: 1000 },
  rounding: initialEdition ? { ...initialEdition.rounding } : { value: 237, base: 10 },
  pattern: initialEdition ? { ...initialEdition.pattern } : { start: 120, step: 5, direction: 1, directionMode: "random", missingIndex: 3, level: 1000 }
};

function t(key, ...args) {
  const value = messages[state.lang][key];
  return typeof value === "function" ? value(...args) : value;
}

function formatNumber(value) {
  const locale = state.lang === "zh" ? "zh-CN" : state.lang === "en" ? "en-US" : "ms-MY";
  return Number(value).toLocaleString(locale);
}

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function readSoundPreference() {
  try { return localStorage.getItem("number-line-sound") !== "off"; }
  catch { return true; }
}

function saveSoundPreference() {
  try { localStorage.setItem("number-line-sound", state.soundEnabled ? "on" : "off"); }
  catch { /* Sound still works when storage is unavailable. */ }
}

function updateSoundToggle() {
  if (!ui.sound) return;
  ui.sound.setAttribute("aria-pressed", String(state.soundEnabled));
  ui.sound.innerHTML = `<span aria-hidden="true">${state.soundEnabled ? "🔊" : "🔇"}</span><span>${t(state.soundEnabled ? "soundOn" : "soundOff")}</span>`;
}

let soundContext = null;
function getSoundContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!soundContext) soundContext = new AudioContextClass();
  if (soundContext.state === "suspended") soundContext.resume().catch(() => {});
  return soundContext;
}

function playNote(context, frequency, start, duration, volume, type = "sine") {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(.001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + .01);
  gain.gain.exponentialRampToValueAtTime(.001, start + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .02);
}

function playUiSound(type, value = 0) {
  if (!state.soundEnabled) return;
  const context = getSoundContext();
  if (!context) return;
  const now = context.currentTime;
  if (type === "click") playNote(context, 520, now, .055, .045, "sine");
  if (type === "move") playNote(context, 390 + (Math.abs(value) % 8) * 35, now, .075, .065, "sine");
  if (type === "new") {
    playNote(context, 390, now, .09, .07, "sine");
    playNote(context, 520, now + .07, .11, .075, "sine");
  }
  if (type === "correct") {
    [[523, 0], [659, .09], [784, .18]].forEach(([frequency, offset]) => playNote(context, frequency, now + offset, .16, .095, "sine"));
  }
  if (type === "wrong") {
    playNote(context, 230, now, .12, .06, "triangle");
    playNote(context, 185, now + .1, .16, .055, "triangle");
  }
}

function celebrate() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  ui.celebration.replaceChildren();
  const colors = ["#ffca4f", "#35a58c", "#3579b9", "#f06f61", "#8d63c7"];
  for (let index = 0; index < 20; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    const angle = (Math.PI * 2 * index) / 20 + Math.random() * .25;
    const distance = 110 + Math.random() * 180;
    piece.style.setProperty("--confetti-x", `${Math.cos(angle) * distance}px`);
    piece.style.setProperty("--confetti-y", `${Math.sin(angle) * distance}px`);
    piece.style.setProperty("--confetti-r", `${randomInt(-300, 300)}deg`);
    piece.style.setProperty("--confetti-color", colors[index % colors.length]);
    piece.style.animationDelay = `${Math.random() * 70}ms`;
    ui.celebration.append(piece);
  }
  window.setTimeout(() => ui.celebration.replaceChildren(), 900);
}

function svgElement(name, attributes = {}, text = "") {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  if (text !== "") element.textContent = text;
  return element;
}

function clearFeedback(message) {
  ui.feedback.className = "feedback";
  ui.feedback.textContent = message;
}

function showFeedback(message, success) {
  ui.feedback.className = `feedback ${success ? "success" : "error"}`;
  ui.feedback.textContent = message;
  playUiSound(success ? "correct" : "wrong");
  if (success) celebrate();
}

function setSpokenAnswer(text) {
  state.spokenAnswer = text;
  ui.speak.disabled = !text;
  const label = ui.speak.querySelector("span:last-child");
  if (label) label.textContent = t(state.mode === "explore" ? "speakNumber" : "speakAnswer");
}

function spokenComparison(a, relation, b) {
  const left = numberWords(a);
  const right = numberWords(b);
  if (state.lang === "zh") return `${left}${relation}${right}`;
  if (state.lang === "en") return `${left} ${relation} than ${right}`;
  return `${left} ${relation} daripada ${right}`;
}

function comparisonConnector(relation) {
  if (state.lang === "zh") return relation;
  return state.lang === "en" ? `${relation} than` : `${relation} daripada`;
}

function comparisonChoice(a, relation, b) {
  return `
    <span class="compare-choice-number first">${formatNumber(a)}</span>
    <span class="compare-choice-relation">${comparisonConnector(relation)}</span>
    <span class="compare-choice-number second">${formatNumber(b)}</span>`;
}

function gradeName() {
  if (!fixedGrade) return "";
  const chineseYears = { 1: "一", 2: "二", 3: "三" };
  if (state.lang === "zh") return `数学${chineseYears[fixedGrade.year]}年级`;
  if (state.lang === "en") return `Math Year ${fixedGrade.year}`;
  return `Matematik Tahun ${fixedGrade.year}`;
}

function setStaticTranslations() {
  document.documentElement.lang = state.lang === "zh" ? "zh-Hans" : state.lang === "en" ? "en" : "ms";
  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll(".language-btn").forEach(button => {
    const active = button.dataset.lang === state.lang;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  updateSoundToggle();
  if (fixedGrade) {
    const label = gradeName();
    ui.gradeBadge.hidden = false;
    ui.gradeBadge.textContent = label;
    ui.levelEyebrow.textContent = label;
    document.title = `${t("appTitle")} · ${label}`;
  } else {
    ui.gradeBadge.hidden = true;
    document.title = t("appTitle");
  }
}

function numberToEnglish(n) {
  const ones = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  if (n < 20) return ones[n];
  if (n < 100) return `${tens[Math.floor(n / 10)]}${n % 10 ? `-${ones[n % 10]}` : ""}`;
  if (n < 1000) return `${ones[Math.floor(n / 100)]} hundred${n % 100 ? ` ${numberToEnglish(n % 100)}` : ""}`;
  if (n < 10000) return `${numberToEnglish(Math.floor(n / 1000))} thousand${n % 1000 ? ` ${numberToEnglish(n % 1000)}` : ""}`;
  return n === 10000 ? "ten thousand" : String(n);
}

function numberToMalay(n) {
  const ones = ["sifar", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "lapan", "sembilan"];
  if (n < 10) return ones[n];
  if (n === 10) return "sepuluh";
  if (n === 11) return "sebelas";
  if (n < 20) return `${ones[n - 10]} belas`;
  if (n < 100) return `${ones[Math.floor(n / 10)]} puluh${n % 10 ? ` ${ones[n % 10]}` : ""}`;
  if (n < 200) return `seratus${n % 100 ? ` ${numberToMalay(n % 100)}` : ""}`;
  if (n < 1000) return `${ones[Math.floor(n / 100)]} ratus${n % 100 ? ` ${numberToMalay(n % 100)}` : ""}`;
  if (n < 2000) return `seribu${n % 1000 ? ` ${numberToMalay(n % 1000)}` : ""}`;
  if (n < 10000) return `${ones[Math.floor(n / 1000)]} ribu${n % 1000 ? ` ${numberToMalay(n % 1000)}` : ""}`;
  return n === 10000 ? "sepuluh ribu" : String(n);
}

function numberToChinese(n) {
  if (n === 0) return "零";
  if (n === 10000) return "一万";
  const digits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  const units = ["", "十", "百", "千"];
  const chars = String(n).split("").map(Number);
  let output = "";
  let zeroPending = false;
  chars.forEach((digit, index) => {
    const place = chars.length - index - 1;
    if (digit === 0) {
      if (output && chars.slice(index + 1).some(value => value !== 0)) zeroPending = true;
      return;
    }
    if (zeroPending) { output += "零"; zeroPending = false; }
    if (!(digit === 1 && place === 1 && output === "")) output += digits[digit];
    output += units[place];
  });
  return output;
}

function numberWords(n) {
  return state.lang === "zh" ? numberToChinese(n) : state.lang === "en" ? numberToEnglish(n) : numberToMalay(n);
}

function niceStep(span) {
  if (span <= 0) return 1;
  const rough = span / 8;
  const power = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / power;
  const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return factor * power;
}

function niceBounds(values) {
  const smallest = Math.min(...values);
  const largest = Math.max(...values);
  const span = Math.max(1, largest - smallest);
  const step = niceStep(span);
  let min = Math.floor((smallest - step) / step) * step;
  let max = Math.ceil((largest + step) / step) * step;
  min = Math.max(0, min);
  if (max === min) max = min + step * 2;
  return { min, max, step };
}

function xFor(value, min, max) {
  return LINE_LEFT + ((value - min) / (max - min)) * (LINE_RIGHT - LINE_LEFT);
}

function drawAxis(min, max, tickStep, midpoint = null) {
  ui.lineLayer.replaceChildren();
  ui.lineLayer.append(
    svgElement("line", { x1: LINE_LEFT, y1: LINE_Y, x2: LINE_RIGHT, y2: LINE_Y, class: "axis" }),
    svgElement("path", { d: `M ${LINE_LEFT} ${LINE_Y} l 18 -11 v 22 z`, class: "axis-arrow" }),
    svgElement("path", { d: `M ${LINE_RIGHT} ${LINE_Y} l -18 -11 v 22 z`, class: "axis-arrow" })
  );

  if (midpoint !== null) {
    const middleX = xFor(midpoint, min, max);
    ui.lineLayer.append(
      svgElement("line", { x1: middleX, y1: 78, x2: middleX, y2: 245, class: "midpoint-line" }),
      svgElement("text", { x: middleX, y: 270, class: "minor-label" }, `${t("midpoint")} ${formatNumber(midpoint)}`)
    );
  }

  const count = Math.round((max - min) / tickStep);
  const compact = window.matchMedia("(max-width: 560px)").matches;
  for (let i = 0; i <= count; i += 1) {
    const value = min + tickStep * i;
    const x = xFor(value, min, max);
    const major = i === 0 || i === count || i % Math.max(1, Math.round(count / 5)) === 0;
    ui.lineLayer.append(svgElement("line", {
      x1: x, x2: x, y1: major ? LINE_Y - 19 : LINE_Y - 12, y2: major ? LINE_Y + 19 : LINE_Y + 12,
      class: major ? "tick major" : "tick"
    }));
    if (major || (!compact && count <= 10)) {
      ui.lineLayer.append(svgElement("text", { x, y: 232, class: major ? "tick-label" : "minor-label" }, formatNumber(value)));
    }
  }
}

function drawMarker(value, min, max, options = {}) {
  const x = xFor(value, min, max);
  const y = options.y || 128;
  const color = options.color || "#176b58";
  const group = svgElement("g", { class: "marker-group" });
  group.append(
    svgElement("line", { x1: x, y1: y + 24, x2: x, y2: LINE_Y - 8, class: "marker-line", stroke: color }),
    svgElement("circle", { cx: x, cy: y, r: 22, class: options.question ? "question-marker" : "marker-circle", fill: color }),
    svgElement("text", { x, y: y + 7, fill: options.question ? "#173b35" : "#ffffff", "font-size": 22, "font-weight": 900, "text-anchor": "middle" }, options.question ? "?" : options.symbol || "●"),
    svgElement("text", { x, y: y - 35, class: "marker-label" }, options.label || formatNumber(value))
  );
  if (options.caption) group.append(svgElement("text", { x, y: y - 61, class: "marker-caption" }, options.caption));
  ui.lineLayer.append(group);
}

function controlsForExplore() {
  const ranges = fixedGrade ? [fixedGrade.max] : [100, 1000, 10000];
  const stepChoices = fixedGrade ? fixedGrade.stepChoices : [1, 5, 10, 100];
  return `
    <div class="field" ${fixedGrade ? "hidden" : ""}>
      <label for="rangeInput">${t("range")}</label>
      <select id="rangeInput">
        ${ranges.map(range => `<option value="${range}" ${state.explore.range === range ? "selected" : ""}>0–${formatNumber(range)}</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label for="exploreValue">${t("number")}</label>
      <input id="exploreValue" type="number" min="0" max="${state.explore.range}" value="${state.explore.value}">
    </div>
    <div class="field">
      <label for="stepInput">${t("stepSize")}</label>
      <div class="stepper">
        <button type="button" id="stepDown" aria-label="Decrease">−</button>
        <select id="stepInput">
          ${stepChoices.map(step => `<option value="${step}" ${state.explore.step === step ? "selected" : ""}>${formatNumber(step)}</option>`).join("")}
        </select>
        <button type="button" id="stepUp" aria-label="Increase">+</button>
      </div>
    </div>`;
}

function controlsForCompare() {
  return `
    <div class="field" ${fixedGrade ? "hidden" : ""}>
      <label for="compareLevel">${t("level")}</label>
      <select id="compareLevel">
        <option value="100" ${state.compare.level === 100 ? "selected" : ""}>${t("easyLevel")}</option>
        <option value="1000" ${state.compare.level === 1000 ? "selected" : ""}>${t("d2Level")}</option>
        <option value="10000" ${state.compare.level === 10000 ? "selected" : ""}>${t("d3Level")}</option>
      </select>
    </div>
    <div class="field-row">
      <div class="field"><label for="compareA">${t("firstNumber")}</label><input id="compareA" type="number" min="0" max="${state.compare.level}" value="${state.compare.a}"></div>
      <div class="field"><label for="compareB">${t("secondNumber")}</label><input id="compareB" type="number" min="0" max="${state.compare.level}" value="${state.compare.b}"></div>
    </div>`;
}

function controlsForRounding() {
  const roundingBases = fixedGrade ? fixedGrade.roundingBases : [10, 100, 1000];
  const roundingMaximum = fixedGrade ? fixedGrade.max : 9999;
  const roundingLabels = { 10: "nearest10", 100: "nearest100", 1000: "nearest1000" };
  return `
    <div class="field"><label for="roundValue">${t("number")}</label><input id="roundValue" type="number" min="0" max="${roundingMaximum}" value="${state.rounding.value}"></div>
    <div class="field"><label for="roundBase">${t("roundingTo")}</label>
      <select id="roundBase" ${roundingBases.length === 1 ? "disabled" : ""}>
        ${roundingBases.map(base => `<option value="${base}" ${state.rounding.base === base ? "selected" : ""}>${t(roundingLabels[base])}</option>`).join("")}
      </select>
    </div>`;
}

function controlsForPattern() {
  return `
    <div class="field" ${fixedGrade ? "hidden" : ""}>
      <label for="patternLevel">${t("level")}</label>
      <select id="patternLevel">
        <option value="100" ${state.pattern.level === 100 ? "selected" : ""}>${t("easyLevel")}</option>
        <option value="1000" ${state.pattern.level === 1000 ? "selected" : ""}>${t("d2Level")}</option>
        <option value="10000" ${state.pattern.level === 10000 ? "selected" : ""}>${t("d3Level")}</option>
      </select>
    </div>
    <div class="field">
      <label for="patternDirection">${t("direction")}</label>
      <select id="patternDirection">
        <option value="random" ${state.pattern.directionMode === "random" ? "selected" : ""}>${t("randomDirection")}</option>
        <option value="increasing" ${state.pattern.directionMode === "increasing" ? "selected" : ""}>${t("increasing")}</option>
        <option value="decreasing" ${state.pattern.directionMode === "decreasing" ? "selected" : ""}>${t("decreasing")}</option>
      </select>
    </div>`;
}

function generateCompareQuestion() {
  const { level } = state.compare;
  state.compare.a = randomInt(0, level);
  do { state.compare.b = randomInt(0, level); } while (state.compare.b === state.compare.a);
}

function generatePatternQuestion() {
  const { level, directionMode = "random" } = state.pattern;
  const stepChoices = level === 100
    ? [1, 2, 5, 10, 20]
    : level === 1000
      ? [2, 5, 10, 20, 25, 50, 100, 200]
      : [10, 25, 50, 100, 200, 250, 500, 1000, 2000];
  const step = stepChoices[randomInt(0, stepChoices.length - 1)];
  const direction = directionMode === "increasing"
    ? 1
    : directionMode === "decreasing"
      ? -1
      : Math.random() < .5 ? 1 : -1;
  const span = step * 4;
  const start = direction === 1 ? randomInt(0, level - span) : randomInt(span, level);
  state.pattern = { level, start, step, direction, directionMode, missingIndex: randomInt(1, 3) };
}

function bindControls() {
  if (state.mode === "explore") {
    const rangeInput = document.getElementById("rangeInput");
    const valueInput = document.getElementById("exploreValue");
    const stepInput = document.getElementById("stepInput");
    rangeInput.addEventListener("change", () => {
      state.explore.range = Number(rangeInput.value);
      state.explore.value = clamp(state.explore.value, 0, state.explore.range);
      renderMode();
    });
    valueInput.addEventListener("input", () => {
      if (valueInput.value === "") return;
      state.explore.value = clamp(Math.round(Number(valueInput.value)), 0, state.explore.range);
      playUiSound("move", state.explore.value);
      renderActivity();
    });
    stepInput.addEventListener("change", () => { state.explore.step = Number(stepInput.value); });
    document.getElementById("stepDown").addEventListener("click", () => {
      state.explore.value = clamp(state.explore.value - state.explore.step, 0, state.explore.range);
      valueInput.value = state.explore.value;
      playUiSound("move", state.explore.value);
      renderActivity();
    });
    document.getElementById("stepUp").addEventListener("click", () => {
      state.explore.value = clamp(state.explore.value + state.explore.step, 0, state.explore.range);
      valueInput.value = state.explore.value;
      playUiSound("move", state.explore.value);
      renderActivity();
    });
  }

  if (state.mode === "compare") {
    const levelInput = document.getElementById("compareLevel");
    levelInput.addEventListener("change", () => {
      state.compare.level = Number(levelInput.value);
      generateCompareQuestion();
      renderMode();
    });
    ["A", "B"].forEach(letter => {
      const input = document.getElementById(`compare${letter}`);
      input.addEventListener("input", () => {
        if (input.value === "") return;
        state.compare[letter.toLowerCase()] = clamp(Math.round(Number(input.value)), 0, state.compare.level);
        input.value = state.compare[letter.toLowerCase()];
        renderActivity();
      });
    });
  }

  if (state.mode === "rounding") {
    const valueInput = document.getElementById("roundValue");
    const baseInput = document.getElementById("roundBase");
    valueInput.addEventListener("input", () => {
      if (valueInput.value === "") return;
      state.rounding.value = clamp(Math.round(Number(valueInput.value)), 0, fixedGrade ? fixedGrade.max : 9999);
      valueInput.value = state.rounding.value;
      renderActivity();
    });
    baseInput.addEventListener("change", () => { state.rounding.base = Number(baseInput.value); renderActivity(); });
  }

  if (state.mode === "pattern") {
    document.getElementById("patternLevel").addEventListener("change", event => {
      state.pattern.level = Number(event.target.value);
      generatePatternQuestion();
      renderMode();
    });
    document.getElementById("patternDirection").addEventListener("change", event => {
      state.pattern.directionMode = event.target.value;
      generatePatternQuestion();
      renderMode();
    });
  }
}

function renderMode() {
  const titleKeys = { explore: "titleExplore", compare: "titleCompare", rounding: "titleRounding", pattern: "titlePattern" };
  const controls = { explore: controlsForExplore, compare: controlsForCompare, rounding: controlsForRounding, pattern: controlsForPattern };
  ui.modeTitle.textContent = t(titleKeys[state.mode]);
  ui.controls.innerHTML = controls[state.mode]();
  ui.line.classList.toggle("explore-line", state.mode === "explore");
  bindControls();
  renderActivity();
}

function renderExplore() {
  const { range, value } = state.explore;
  ui.prompt.textContent = t("promptExplore");
  ui.display.innerHTML = `<span class="big-number">${formatNumber(value)}</span><span class="number-words">${numberWords(value)}</span>`;
  drawAxis(0, range, range / 10);
  drawMarker(value, 0, range, { label: formatNumber(value) });
  ui.answer.innerHTML = "";
  setSpokenAnswer(numberWords(value));
  clearFeedback(t("clickHint"));
}

function renderCompare() {
  const { a, b } = state.compare;
  const bounds = niceBounds([a, b]);
  ui.prompt.textContent = t("promptCompare", formatNumber(a), formatNumber(b));
  const joinWord = state.lang === "zh" ? "和" : state.lang === "en" ? "and" : "dan";
  ui.display.innerHTML = `<span class="big-number">${formatNumber(a)}</span><span class="number-words">${joinWord}</span><span class="big-number">${formatNumber(b)}</span>`;
  drawAxis(bounds.min, bounds.max, bounds.step);
  const same = a === b;
  drawMarker(a, bounds.min, bounds.max, { color: "#176b58", label: formatNumber(a), y: same ? 105 : 128 });
  drawMarker(b, bounds.min, bounds.max, { color: "#3579b9", label: formatNumber(b), y: same ? 270 : 128 });
  setSpokenAnswer("");
  if (same) {
    ui.answer.innerHTML = "";
    clearFeedback(t("differentNumbers"));
    return;
  }
  ui.answer.innerHTML = [
    { value: "<", label: t("lessThan") },
    { value: ">", label: t("greaterThan") }
  ].map(choice => `<button class="choice-btn word-choice" type="button" data-answer="${choice.value}">${comparisonChoice(a, choice.label, b)}</button>`).join("");
  ui.answer.querySelectorAll("[data-answer]").forEach(button => button.addEventListener("click", () => checkCompare(button.dataset.answer)));
  clearFeedback(t("compareHint"));
}

function checkCompare(answer) {
  const { a, b } = state.compare;
  const correctAnswer = a < b ? "<" : ">";
  const relation = correctAnswer === "<" ? t("lessThan") : t("greaterThan");
  const isCorrect = answer === correctAnswer;
  showFeedback(isCorrect ? t("compareCorrect", formatNumber(a), relation, formatNumber(b)) : t("tryAgain"), isCorrect);
  setSpokenAnswer(isCorrect ? spokenComparison(a, relation, b) : "");
}

function roundingDetails() {
  const { value, base } = state.rounding;
  if (value % base === 0) return { lower: Math.max(0, value - base), upper: value + base, midpoint: null, correct: value, exact: true };
  const lower = Math.floor(value / base) * base;
  const upper = lower + base;
  return { lower, upper, midpoint: lower + base / 2, correct: Math.round(value / base) * base, exact: false };
}

function renderRounding() {
  const { value, base } = state.rounding;
  const details = roundingDetails();
  ui.prompt.textContent = t("promptRounding", formatNumber(value), base);
  ui.display.innerHTML = `<span class="big-number">${formatNumber(value)} → ?</span>`;
  const tickStep = details.exact ? base / 5 : base / 10;
  drawAxis(details.lower, details.upper, tickStep, details.midpoint);
  drawMarker(value, details.lower, details.upper, { color: "#d48512", label: formatNumber(value), symbol: "●" });
  const choices = details.exact ? [details.lower, value, details.upper] : [details.lower, details.upper];
  ui.answer.innerHTML = choices.map(choice => `<button class="choice-btn" type="button" data-answer="${choice}">${formatNumber(choice)}</button>`).join("");
  ui.answer.querySelectorAll("[data-answer]").forEach(button => button.addEventListener("click", () => checkRounding(Number(button.dataset.answer))));
  setSpokenAnswer("");
  clearFeedback(t("roundHint"));
}

function checkRounding(answer) {
  const details = roundingDetails();
  const correct = answer === details.correct;
  const message = correct
    ? t("roundCorrect", formatNumber(state.rounding.value), formatNumber(details.correct))
    : `${t("tryAgain")} ${t("roundExplain", formatNumber(details.lower), formatNumber(details.upper))}`;
  showFeedback(message, correct);
  setSpokenAnswer(correct ? numberWords(details.correct) : "");
}

function patternValues() {
  const { start, step, direction } = state.pattern;
  return Array.from({ length: 5 }, (_, index) => start + step * direction * index);
}

function drawPatternTrack(values, missingIndex, reveal = false) {
  const positions = [100, 300, 500, 700, 900];
  const y = 165;
  ui.lineLayer.replaceChildren();

  positions.slice(0, -1).forEach((x, index) => {
    const nextX = positions[index + 1];
    ui.lineLayer.append(
      svgElement("line", { x1: x + 75, y1: y, x2: nextX - 84, y2: y, class: "sequence-connector" }),
      svgElement("path", { d: `M ${nextX - 84} ${y - 10} L ${nextX - 68} ${y} L ${nextX - 84} ${y + 10} Z`, class: "sequence-arrow" })
    );
  });

  values.forEach((value, index) => {
    const hidden = index === missingIndex && !reveal;
    const group = svgElement("g", { class: `sequence-card${hidden ? " is-missing" : ""}${index === missingIndex && reveal ? " is-revealed" : ""}` });
    group.append(
      svgElement("rect", { x: positions[index] - 65, y: y - 49, width: 130, height: 98, rx: 24, class: "sequence-card-bg" }),
      svgElement("circle", { cx: positions[index], cy: y - 67, r: 17, class: "sequence-dot" }),
      svgElement("text", { x: positions[index], y: y + 10, class: "sequence-value" }, hidden ? "?" : formatNumber(value))
    );
    ui.lineLayer.append(group);
  });
}

function renderPattern() {
  const values = patternValues();
  const answer = values[state.pattern.missingIndex];
  ui.prompt.textContent = t("promptPattern");
  ui.display.innerHTML = values.map((value, index) => `<span class="pattern-chip${index === state.pattern.missingIndex ? " is-missing" : ""}">${index === state.pattern.missingIndex ? "?" : formatNumber(value)}</span>`).join("");
  drawPatternTrack(values, state.pattern.missingIndex);
  ui.answer.innerHTML = `<input class="answer-input" id="patternAnswer" type="number" aria-label="${t("enterAnswer")}" placeholder="${t("enterAnswer")}"><button class="primary-btn" id="checkPattern" type="button">${t("check")}</button>`;
  const answerInput = document.getElementById("patternAnswer");
  const check = () => {
    if (answerInput.value === "") return;
    const correct = Number(answerInput.value) === answer;
    showFeedback(correct ? t("patternCorrect", formatNumber(answer)) : t("tryAgain"), correct);
    setSpokenAnswer(correct ? numberWords(answer) : "");
    if (correct) {
      drawPatternTrack(values, state.pattern.missingIndex, true);
      ui.display.querySelector(".is-missing").textContent = formatNumber(answer);
      ui.display.querySelector(".is-missing").classList.add("is-revealed");
    }
  };
  document.getElementById("checkPattern").addEventListener("click", check);
  answerInput.addEventListener("keydown", event => { if (event.key === "Enter") check(); });
  setSpokenAnswer("");
  clearFeedback(t("patternHint"));
}

function renderActivity() {
  ({ explore: renderExplore, compare: renderCompare, rounding: renderRounding, pattern: renderPattern })[state.mode]();
}

function makeNewQuestion() {
  playUiSound("new");
  if (state.mode === "explore") {
    state.explore.value = randomInt(0, state.explore.range);
  } else if (state.mode === "compare") {
    generateCompareQuestion();
  } else if (state.mode === "rounding") {
    const bases = fixedGrade ? fixedGrade.roundingBases : [10, 100, 1000];
    const base = bases[randomInt(0, bases.length - 1)];
    const maximum = fixedGrade ? fixedGrade.max : (base === 1000 ? 9999 : base * 20);
    const ceiling = Math.max(1, maximum - 1);
    let value = randomInt(1, ceiling);
    if (value % base === 0) value = Math.min(ceiling, value + 1);
    state.rounding = { value, base };
  } else {
    generatePatternQuestion();
  }
  renderMode();
}

document.querySelectorAll(".mode-tab").forEach(button => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    document.querySelectorAll(".mode-tab").forEach(tab => {
      const active = tab === button;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-pressed", String(active));
    });
    renderMode();
  });
});

document.querySelectorAll(".language-btn").forEach(button => {
  button.addEventListener("click", () => {
    state.lang = button.dataset.lang;
    setStaticTranslations();
    renderMode();
  });
});

ui.line.addEventListener("pointerdown", event => {
  if (state.mode !== "explore") return;
  const rectangle = ui.line.getBoundingClientRect();
  const viewX = ((event.clientX - rectangle.left) / rectangle.width) * 1000;
  const ratio = clamp((viewX - LINE_LEFT) / (LINE_RIGHT - LINE_LEFT), 0, 1);
  state.explore.value = clamp(Math.round((ratio * state.explore.range) / state.explore.step) * state.explore.step, 0, state.explore.range);
  const input = document.getElementById("exploreValue");
  if (input) input.value = state.explore.value;
  playUiSound("move", state.explore.value);
  renderActivity();
});

ui.newQuestion.addEventListener("click", makeNewQuestion);
ui.sound.addEventListener("click", () => {
  state.soundEnabled = !state.soundEnabled;
  saveSoundPreference();
  updateSoundToggle();
  if (state.soundEnabled) playUiSound("click");
});

document.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;
  const excludedIds = ["soundToggle", "newQuestionBtn", "stepDown", "stepUp", "speakBtn", "checkPattern"];
  if (excludedIds.includes(button.id) || button.hasAttribute("data-answer")) return;
  playUiSound("click");
});

document.addEventListener("change", event => {
  if (event.target.matches("select")) playUiSound("click");
});

let speechVoices = [];
function refreshSpeechVoices() {
  speechVoices = "speechSynthesis" in window ? window.speechSynthesis.getVoices() : [];
}

function chooseSpeechVoice() {
  if (!speechVoices.length) refreshSpeechVoices();
  if (state.lang === "en") {
    const englishVoices = speechVoices.filter(voice => voice.lang.toLowerCase().startsWith("en"));
    const preferredFemaleNames = ["jenny", "aria", "zira", "samantha", "ava", "emma", "libby", "hazel", "susan", "female"];
    for (const name of preferredFemaleNames) {
      const match = englishVoices.find(voice => voice.name.toLowerCase().includes(name));
      if (match) return match;
    }
    return englishVoices[0] || null;
  }
  const languageCode = state.lang === "zh" ? "zh" : "ms";
  return speechVoices.find(voice => voice.lang.toLowerCase().startsWith(languageCode)) || null;
}

refreshSpeechVoices();
if ("speechSynthesis" in window) window.speechSynthesis.addEventListener("voiceschanged", refreshSpeechVoices);
ui.speak.addEventListener("click", () => {
  if (!("speechSynthesis" in window) || !state.spokenAnswer) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(state.spokenAnswer);
  const voice = chooseSpeechVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang || (state.lang === "zh" ? "zh-CN" : state.lang === "en" ? "en-US" : "ms-MY");
  utterance.rate = .9;
  utterance.pitch = state.lang === "en" ? 1.05 : 1;
  window.speechSynthesis.speak(utterance);
});

setStaticTranslations();
renderMode();
