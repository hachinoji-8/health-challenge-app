const calendar = document.getElementById("calendar");
const completeButton = document.getElementById("complete-button");
const submitButton = document.getElementById("submit-button");
const goalInput = document.getElementById("goal-input");
const goalText = document.getElementById("goal-text");
const startScreen = document.getElementById("start-screen");
const mainScreen = document.getElementById("main-screen");

let totalDays = 30;
let completedDays = 0;
let currentMode = 30;
const calendarSize = 35;
let record = [];
let manualMode = false;
let goalTapTimes = [];
let dayOneTapTimes = [];
let daySevenTapTimes = [];

const reportURL = "https://example.com/form"; // ←ここ変えるだけでリンク切り替え可能！
const completeButton = document.querySelector('.complete-button');
const manualToggle = document.querySelector('.manual-toggle');
const stampContainer = document.querySelector('.stamp-container');
const linkButton = document.querySelector('.link-button');
const sound = new Audio('success.mp3');

function playSuccessSound() {
  new Audio("img/success.mp3").play();
}
// 初期化
generateCalendar();
updateCalendarUI();
updateCompleteButtonState();

function startChallenge(mode) {
  const goal = goalInput.value.trim();
  if (!goal) return;

  if (goal.length > 20) {
    alert("20文字以内で入力してね✨");
    goalInput.value = "";
    return;
completeButton.addEventListener('click', () => {
  if (canMarkToday()) {
    markToday();
  }
});

  currentMode = mode;
  totalDays = mode;
  localStorage.setItem("goal", goal);
  localStorage.setItem("mode", mode);
  localStorage.setItem("startDate", new Date().toDateString());
  localStorage.setItem("record", JSON.stringify([]));
  localStorage.removeItem("lastMarked");

  goalText.textContent = goal;
  startScreen.classList.add("hidden");
  mainScreen.classList.remove("hidden");

  generateCalendar();
  updateCalendarUI();

  setTimeout(() => {
    goalText.addEventListener("click", handleGoalTap);
  }, 0);
}
manualToggle.addEventListener('click', () => {
  manualMode = !manualMode;
  manualToggle.classList.toggle('active', manualMode);
});

function generateCalendar() {
  calendar.innerHTML = "";
  for (let i = 0; i < totalDays; i++) {
    const square = document.createElement("div");
    square.className = "square";
    square.dataset.index = i;

    const base = document.createElement("div");
    base.className = "base-circle";

    const stamp = document.createElement("div");
    stamp.className = "stamp";

    const mask = document.createElement("div");
    mask.className = "mask";

    square.appendChild(base);
    square.appendChild(stamp);
    square.appendChild(mask);
    calendar.appendChild(square);

    square.addEventListener("click", () => onSquareClick(i));
    square.addEventListener("click", e => {
      handleCalendarTap(e);
      handleSevenTap(e);
    });
  }
function getTodayIndex() {
  const today = new Date();
  return today.getDate() % calendarSize;
}

function onSquareClick(index) {
  if (!manualMode) return;

  const record = [];
  for (let i = 0; i <= index; i++) {
    record.push(i);
  }

  localStorage.setItem("record", JSON.stringify(record));
  localStorage.setItem("lastMarked", new Date().toDateString());
  completeButton.disabled = true;

  updateCalendarUI();
  playSuccessSound();
function canMarkToday() {
  const todayIndex = getTodayIndex();
  return !record.includes(todayIndex);
}

function markToday() {
  if (!canMarkToday() || manualMode) return;

  let record = JSON.parse(localStorage.getItem("record") || "[]");
  const todayIndex = record.length;

  if (todayIndex >= totalDays) return;

  const todayIndex = getTodayIndex();
  record.push(todayIndex);
  localStorage.setItem("record", JSON.stringify(record));
  localStorage.setItem("lastMarked", new Date().toDateString());

  updateCalendarUI();
  playSuccessSound();
  updateCompleteButtonState();
  checkLinkAvailability();
}

function canMarkToday() {
  const last = localStorage.getItem("lastMarked");
  const today = new Date().toDateString();
  return last !== today;
function playSuccessSound() {
  sound.currentTime = 0;
  sound.play();
}

function updateCalendarUI() {
  const record = JSON.parse(localStorage.getItem("record") || "[]");

  document.querySelectorAll(".square").forEach((el, i) => {
    const mask = el.querySelector(".mask");
    const stamp = el.querySelector(".stamp");

    const stampPath = i % 7 === 0 ? "img/smile.png" : "img/heart.png";
    stamp.style.backgroundImage = record.includes(i)
      ? `url('${stampPath}')`
      : "";
    stamp.classList.toggle("glow", record.length >= totalDays);

    if (record.includes(i)) {
      mask.classList.add("hidden");
    } else {
      if (manualMode) {
        const latest = Math.max(...record);
        if (i <= latest) {
          mask.classList.add("hidden");
        } else {
          mask.classList.remove("hidden");
        }
      } else {
        mask.classList.remove("hidden");
      }
    }
  });

  const allComplete = record.length >= totalDays;
  submitButton.classList.toggle("disabled", !allComplete);
  submitButton.disabled = !allComplete;
  submitButton.onclick = () => {
    window.open(reportURL, "_blank");
  };
function updateCompleteButtonState() {
  completeButton.disabled = !canMarkToday();
}

function handleGoalTap() {
  const now = Date.now();
  goalTapTimes.push(now);
  goalTapTimes = goalTapTimes.filter(t => now - t < 3000);

  if (goalTapTimes.length >= 5) {
    manualMode = !manualMode;
    goalTapTimes = [];
    alert(manualMode ? "🛠 手動モードに切り替えました" : "↩ 通常モードに戻しました");
    completeButton.disabled = manualMode;
    updateCalendarUI();
    if (manualMode) {
      localStorage.setItem("lastMarked", new Date().toDateString());
    }
  }
}
function generateCalendar() {
  stampContainer.innerHTML = '';

function handleCalendarTap(e) {
  const square = e.target.closest(".square");
  if (!square || square.dataset.index !== "0") return;
  for (let i = 0; i < calendarSize; i++) {
    const circle = document.createElement('div');
    circle.className = 'base-circle';
    circle.dataset.index = i;

  const now = Date.now();
  dayOneTapTimes.push(now);
  dayOneTapTimes = dayOneTapTimes.filter(t => now - t < 3000);
    const stamp = document.createElement('img');
    stamp.className = 'stamp';
    stamp.src = i % 7 === 0 ? 'smile.png' : 'heart.png';
    stamp.style.opacity = '0.2';

  if (dayOneTapTimes.length >= 5) {
    dayOneTapTimes = [];
    startScreen.classList.remove("hidden");
    mainScreen.classList.add("hidden");
    const mask = document.createElement('div');
    mask.className = 'mask';

    let record = JSON.parse(localStorage.getItem("record") || "[]");
    if (record.length >= 14 && currentMode === 30) {
      currentMode = 14;
      totalDays = 14;
      localStorage.setItem("mode", "14");
    }
    circle.appendChild(stamp);
    circle.appendChild(mask);
    stampContainer.appendChild(circle);

    circle.addEventListener('click', () => {
      if (manualMode) {
        handleManualStamp(i);
      }
    });
  }
}

function handleSevenTap(e) {
  const square = e.target.closest(".square");
  if (!square || square.dataset.index !== "6") return;

  const now = Date.now();
  daySevenTapTimes.push(now);
  daySevenTapTimes = daySevenTapTimes.filter(t => now - t < 3000);
function updateCalendarUI() {
  const circles = document.querySelectorAll('.base-circle');

  if (daySevenTapTimes.length >= 5) {
    daySevenTapTimes = [];
    completeButton.disabled = false;
  }
  circles.forEach((circle, i) => {
    const stamp = circle.querySelector('.stamp');
    const mask = circle.querySelector('.mask');
    if (record.includes(i)) {
      stamp.style.opacity = '1';
      mask.style.display = 'none';
    } else {
      stamp.style.opacity = '0.2';
      mask.style.display = 'block';
    }
  });
}

function dailyReset() {
  const now = new Date();
  const target = new Date();
  target.setHours(0, 0, 0, 0);
  if (now > target) {
    completeButton.disabled = false;
    if (manualMode) {
      manualMode = false;
      alert("⏰ 手動モードが解除されました");
      updateCalendarUI();
function handleManualStamp(index) {
  const newRecord = [];
  for (let i = 0; i < calendarSize; i++) {
    if (i <= index) {
      newRecord.push(i);
    }
  }
  record = newRecord;
  updateCalendarUI();
  checkLinkAvailability();
}

setInterval(() => {
  dailyReset();
}, 60000); // 60秒ごとにリセット確認

window.addEventListener("load", () => {
  const savedGoal = localStorage.getItem("goal");
  const savedMode = localStorage.getItem("mode");

  if (savedGoal && savedMode) {
    goalText.textContent = savedGoal;
    currentMode = Number(savedMode);
    totalDays = currentMode;

    startScreen.classList.add("hidden");
    mainScreen.classList.remove("hidden");

    generateCalendar();
    updateCalendarUI();

    setTimeout(() => {
      goalText.addEventListener("click", handleGoalTap);
    }, 0);
  }
});
function checkLinkAvailability() {
  const required = [0,1,2,3,4];
  const complete = required.every(i => record.includes(i));
  linkButton.disabled = !complete;
}
