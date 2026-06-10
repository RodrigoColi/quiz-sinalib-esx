const WORDS = ["aprender", "faesa", "libras", "obrigado", "parabens"];
const LABELS = { faesa: "FAESA", libras: "LIBRAS", parabens: "Parabéns" };

const INTRO_SRC = "videos/intro.mp4";
const OPTIONS_PER_QUESTION = 4;
const ADVANCE_DELAY_CORRECT = 1400;   
const ADVANCE_DELAY_WRONG = 2600;     
const SCORE_RESET_SECONDS = 10;       
const IDLE_RESET_MS = 90_000;         

const $ = (id) => document.getElementById(id);
const app = $("app");
const introVideo = $("intro-video");
const quizVideo = $("quiz-video");
const videoCard = $("video-card");
const optionsEl = $("options");
const dotsEl = $("progress-dots");

let questions = [];
let current = 0;
let score = 0;
let advanceTimer = null;
let countdownTimer = null;
let idleTimer = null;

function labelFor(word) {
  return LABELS[word] ?? word.charAt(0).toUpperCase() + word.slice(1);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function show(screen) {
  app.dataset.screen = screen;
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(`screen-${screen}`).classList.add("active");

  introVideo.pause();
  if (screen !== "intro" && introVideo.hasAttribute("src")) {
    introVideo.removeAttribute("src");
    introVideo.load();
  }

  if (screen === "home") {
    clearTimeout(advanceTimer);
    clearInterval(countdownTimer);
  }
}

function pokeIdle() {
  clearTimeout(idleTimer);
  if (app.dataset.screen !== "home") {
    idleTimer = setTimeout(goHome, IDLE_RESET_MS);
  }
}
["pointerdown", "keydown"].forEach((ev) => document.addEventListener(ev, pokeIdle));

function goHome() {
  quizVideo.pause();
  show("home");
  pokeIdle();
}

function playIntro() {
  show("intro");
  introVideo.src = INTRO_SRC;
  introVideo.currentTime = 0;
  introVideo.play().catch(() => show("ready"));
}
introVideo.addEventListener("ended", () => show("ready"));

function buildQuiz() {
  return shuffle(WORDS).map((word) => {
    const distractors = shuffle(WORDS.filter((w) => w !== word))
      .slice(0, OPTIONS_PER_QUESTION - 1);
    return { word, options: shuffle([word, ...distractors]) };
  });
}

function startQuiz() {
  questions = buildQuiz();
  current = 0;
  score = 0;
  dotsEl.innerHTML = questions
    .map(() => '<span class="dot"></span>')
    .join("");
  show("quiz");
  loadQuestion();
}

function loadQuestion() {
  const q = questions[current];

  $("progress-label").textContent = `Pergunta ${current + 1} de ${questions.length}`;
  dotsEl.children[current].classList.add("current");

  videoCard.classList.remove("ended");
  quizVideo.src = `videos/${q.word}.mp4`;
  quizVideo.play().catch(() => {});

  optionsEl.classList.remove("locked");
  optionsEl.innerHTML = "";
  q.options.forEach((word) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = labelFor(word);
    btn.addEventListener("click", () => answer(word, btn));
    optionsEl.appendChild(btn);
  });
}

function answer(word, btn) {
  const q = questions[current];
  optionsEl.classList.add("locked");

  const hit = word === q.word;
  const dot = dotsEl.children[current];
  dot.classList.remove("current");
  dot.classList.add(hit ? "hit" : "miss");

  if (hit) {
    score++;
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
    [...optionsEl.children]
      .find((b) => b.textContent === labelFor(q.word))
      .classList.add("reveal");
  }

  advanceTimer = setTimeout(() => {
    current++;
    if (current < questions.length) loadQuestion();
    else showScore();
  }, hit ? ADVANCE_DELAY_CORRECT : ADVANCE_DELAY_WRONG);
}

function replay() {
  videoCard.classList.remove("ended");
  quizVideo.currentTime = 0;
  quizVideo.play().catch(() => {});
}
quizVideo.addEventListener("ended", () => videoCard.classList.add("ended"));
videoCard.addEventListener("click", replay);
$("btn-replay").addEventListener("click", replay);

function scoreMessage(s, total) {
  const ratio = s / total;
  if (ratio === 1) return "Perfeito! Você é fera em LIBRAS! 🤟";
  if (ratio >= 0.8) return "Excelente! Quase perfeito! 🎉";
  if (ratio >= 0.6) return "Muito bem! Continue praticando! 👏";
  if (ratio >= 0.4) return "Bom começo! Tente de novo! 💪";
  return "Não desanime — todo sinal conta! 💙";
}

function showScore() {
  quizVideo.pause();
  $("score-number").textContent = `${score}/${questions.length}`;
  $("score-message").textContent = scoreMessage(score, questions.length);
  show("score");

  let remaining = SCORE_RESET_SECONDS;
  const countdownEl = $("score-countdown");
  countdownEl.textContent = `Voltando ao início em ${remaining}s…`;
  countdownTimer = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(countdownTimer);
      goHome();
    } else {
      countdownEl.textContent = `Voltando ao início em ${remaining}s…`;
    }
  }, 1000);
}

$("btn-start").addEventListener("click", playIntro);
$("btn-skip").addEventListener("click", () => show("ready"));
$("btn-quiz").addEventListener("click", startQuiz);

show("home");
