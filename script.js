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
let manualMode = false;
let goalTapTimes = [];
let dayOneTapTimes = [];
let daySevenTapTimes = [];

const reportURL = "https://example.com/form"; // ←ここ変えるだけでリンク切り替え可能！

function playSuccessSound() {
  new Audio("img/success.mp3").play();
}

function startChallenge(mode) {
  const goal = goalInput.value.trim();
  if (!goal) return;

  if (goal.length > 20) {
    alert("20文字以内で入力してね✨");
    goalInput.value = "";
    return;
  }

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
}

function markToday() {
  if (!canMarkToday() || manualMode) return;

  let record = JSON.parse(localStorage.getItem("record") || "[]");
  const todayIndex = record.length;

  if (todayIndex >= totalDays) return;

  record.push(todayIndex);
  localStorage.setItem("record", JSON.stringify(record));
  localStorage.setItem("lastMarked", new Date().toDateString());

  updateCalendarUI();
  playSuccessSound();
}

function canMarkToday() {
  const last = localStorage.getItem("lastMarked");
  const today = new Date().toDateString();
  return last !== today;
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

function handleCalendarTap(e) {
  const square = e.target.closest(".square");
  if (!square || square.dataset.index !== "0") return;

  const now = Date.now();
  dayOneTapTimes.push(now);
  dayOneTapTimes = dayOneTapTimes.filter(t => now - t < 3000);

  if (dayOneTapTimes.length >= 5) {
    dayOneTapTimes = [];
    startScreen.classList.remove("hidden");
    mainScreen.classList.add("hidden");

    let record = JSON.parse(localStorage.getItem("record") || "[]");
    if (record.length >= 14 && currentMode === 30) {
      currentMode = 14;
      totalDays = 14;
      localStorage.setItem("mode", "14");
    }
  }
}

function handleSevenTap(e) {
  const square = e.target.closest(".square");
  if (!square || square.dataset.index !== "6") return;

  const now = Date.now();
  daySevenTapTimes.push(now);
  daySevenTapTimes = daySevenTapTimes.filter(t => now - t < 3000);

  if (daySevenTapTimes.length >= 5) {
    daySevenTapTimes = [];
    completeButton.disabled = false;
  }
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
    }
  }
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
