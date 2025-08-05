const calendar = document.getElementById("calendar");
const completeButton = document.getElementById("complete-button");
const submitButton = document.getElementById("submit-button");
const goalInput = document.getElementById("goal-input");
const goalText = document.getElementById("goal-text");
const startScreen = document.getElementById("start-screen");
const mainScreen = document.getElementById("main-screen");

let totalDays = 30;
let currentDay = new Date().toDateString();
let manualMode = false;

function startChallenge(days) {
  const goal = goalInput.value.trim();
  if (!goal) return;

  totalDays = days;
  localStorage.setItem("goal", goal);
  localStorage.setItem("days", days);
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
    const img = (i + 1) % 7 === 0 ? "smile.png" : "heart.png";
    stamp.style.backgroundImage = `url('img/${img}')`;

    const mask = document.createElement("div");
    mask.className = "mask";
    mask.id = `mask-${i}`;

    square.appendChild(stamp);
    square.appendChild(mask);
    calendar.appendChild(square);
  }
}

function updateCalendarUI() {
  const record = JSON.parse(localStorage.getItem("record") || "[]");

  document.querySelectorAll(".square").forEach((el, i) => {
    const mask = el.querySelector(".mask");
    mask.classList.toggle("hidden", record.includes(i));
    const stamp = el.querySelector(".stamp");
    stamp.classList.toggle("glow", record.includes(i));
  });

  submitButton.disabled = record.length < totalDays;
  submitButton.classList.toggle("disabled", submitButton.disabled);
}

function markToday() {
  if (!canMarkToday()) return;

  const record = JSON.parse(localStorage.getItem("record") || "[]");
  const todayIndex = record.length;
  if (todayIndex < totalDays) {
    record.push(todayIndex);
    localStorage.setItem("record", JSON.stringify(record));
    localStorage.setItem("lastMarked", new Date().toDateString());
    updateCalendarUI();
    completeButton.disabled = true;
  }
}

function canMarkToday() {
  const last = localStorage.getItem("lastMarked");
  const today = new Date().toDateString();
  return !manualMode && last !== today;
}

function handleCalendarTap(event) {
  const square = event.target.closest(".square");
  if (!square) return;

  const index = parseInt(square.dataset.index);
  if (isNaN(index)) return;

  manualMode = true;
  completeButton.disabled = true;

  const record = [];
  for (let i = 0; i <= index; i++) {
    record.push(i);
  }

  localStorage.setItem("record", JSON.stringify(record));
  localStorage.setItem("lastMarked", currentDay);
  updateCalendarUI();
}

function handleGoalTap() {
  const newGoal = prompt("新しい目標を入力してください", goalText.textContent);
  if (newGoal) {
    goalText.textContent = newGoal;
    localStorage.setItem("goal", newGoal);
  }
}

// 深夜0時を超えたらモード解除＆ボタン復活
setInterval(() => {
  const now = new Date().toDateString();
  if (now !== currentDay) {
    currentDay = now;
    manualMode = false;
    completeButton.disabled = false;
    localStorage.setItem("lastMarked", "");
  }
}, 60000); // 毎分チェック
