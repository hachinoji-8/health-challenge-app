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
let currentDay = new Date().toDateString();

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
  localStorage.setItem("lastMarked", "");

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
    const imgName = (i + 1) % 7 === 0 ? "smile.png" : "heart.png";
    stamp.style.backgroundImage = `url('img/${imgName}')`;

    const mask = document.createElement("div");
    mask.className = "mask";
    mask.id = `mask-${i}`;

    square.appendChild(stamp);
    square.appendChild(mask);
    calendar.appendChild(square);

    square.addEventListener("click", () => onSquareClick(i));
  }
}

function onSquareClick(index) {
  manualMode = true;
  completeButton.disabled = true;

  const record = [];
  for (let i = 0; i <= index; i++) {
    record.push(i);
  }
  localStorage.setItem("record", JSON.stringify(record));
  updateCalendarUI();
  playSuccessSound();
}

function markToday() {
  if (!canMarkToday()) return;

  const record = JSON.parse(localStorage.getItem("record") || "[]");
  const todayIndex = record.length;
  if (todayIndex < currentMode) {
    record.push(todayIndex);
    localStorage.setItem("record", JSON.stringify(record));
    localStorage.setItem("lastMarked", new Date().toDateString());
    updateCalendarUI();
    playSuccessSound();
    completeButton.disabled = true;
  }
}

function canMarkToday() {
  const last = localStorage.getItem("lastMarked");
  const today = new Date().toDateString();
  return !manualMode && last !== today;
}

function updateCalendarUI() {
  const record = JSON.parse(localStorage.getItem("record") || "[]");
  const lastIndex = record.length - 1;

  document.querySelectorAll(".square").forEach((el, i) => {
    const mask = el.querySelector(".mask");
    if (record.includes(i)) {
      mask.classList.remove("mask");
    } else {
      mask.classList.add("mask");
    }
  });

  // すべて達成済みなら応募ボタンを有効化
  if (record.length >= currentMode) {
    submitButton.disabled = false;
  }
}

// 日付が変わったらモードを自動に戻す＆ボタン再有効化
setInterval(() => {
  const today = new Date().toDateString();
  if (today !== currentDay) {
    currentDay = today;
    manualMode = false;
    completeButton.disabled = false;
    localStorage.setItem("lastMarked", ""); // リセット
  }
}, 60000); // 毎分チェック

    
