const calendar = document.getElementById("calendar");
const completeButton = document.getElementById("complete-button");
const submitButton = document.getElementById("submit-button");
const goalInput = document.getElementById("goal-input");
const goalText = document.getElementById("goal-text");
const startScreen = document.getElementById("start-screen");
const mainScreen = document.getElementById("main-screen");

let totalDays = 30;
let currentMode = 30;
let manualMode = false;

let goalTapTimes = [];
let dayOneTapTimes = [];

function playSuccessSound() {
  const sound = new Audio("img/success.mp3");
  sound.currentTime = 0;
  sound.play();
}

function startChallenge(mode) {
  const goal = goalInput.value.trim();
  if (!goal) return;

  currentMode = mode;
  totalDays = mode;
  localStorage.setItem("goal", goal);
  localStorage.setItem("mode", mode);
  localStorage.setItem("startDate", new Date().toDateString());
  localStorage.setItem("record", JSON.stringify([]));

  goalText.textContent = goal;
  startScreen.classList.add("hidden");
  mainScreen.classList.remove("hidden");

  generateCalendar();
  updateCalendarUI();
}

function generateCalendar() {
  calendar.innerHTML = "";
  for (let i = 0; i < totalDays; i++) {
    const square = document.createElement("div");
    square.className = "square";
    square.dataset.index = i;

    const stamp = document.createElement("div");
    stamp.className = "stamp";

    // 7の倍数はsmile.png、それ以外はheart.png（初期は全部設置）
    const imgName = (i + 1) % 7 === 0 ? "smile.png" : "heart.png";
    stamp.style.backgroundImage = `url('img/${imgName}')`;

    const mask = document.createElement("div");
    mask.className = "mask";
    mask.id = `mask-${i}`; // 識別用

    square.appendChild(stamp);
    square.appendChild(mask);
    calendar.appendChild(square);

    square.addEventListener("click", () => onSquareClick(i));
  }
}

function onSquareClick(index) {
  if (!manualMode) return;

  const record = [];
  for (let i = 0; i <= index; i++) {
    record.push(i);
  }
  localStorage.setItem("record", JSON.stringify(record));
  playSuccessSound();
  updateCalendarUI();
}

function markToday() {
  if (!canMarkToday()) return;

  let record = JSON.parse(localStorage.getItem("record") || "[]");
  const todayIndex = record.length;
  if (todayIndex < currentMode) {
    record.push(todayIndex);
    localStorage.setItem("record", JSON.stringify(record));
    localStorage.setItem("lastMarked", new Date().toDateString());
    playSuccessSound();
    updateCalendarUI();
  }
}

function canMarkToday() {
  const last = localStorage.getItem("lastMarked");
  const today = new Date().toDateString();
  return last !== today;
}

function updateCalendarUI() {
  const record = JSON.parse(localStorage.getItem("record") || "[]");
  const lastIndex = record.length - 1;
  const allCompleted = record.length >= currentMode;

  document.querySelectorAll(".square").forEach((el, i) => {
    const mask = el.querySelector(".mask");
    const stamp = el.query
