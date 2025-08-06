const calendar = document.getElementById("calendar");
const completeButton = document.getElementById("complete-button");
const submitButton = document.getElementById("submit-button");
const goalInput = document.getElementById("goal-input");
const goalText = document.getElementById("goal-text");
const startScreen = document.getElementById("start-screen");
const mainScreen = document.getElementById("main-screen");
const successAudio = document.getElementById("success-audio");

let totalDays = 30;
let currentMode = 30;
let manualMode = false;

let goalTapTimes = [];
let dayOneTapTimes = [];
let daySevenTapTimes = [];

window.startChallenge = function (mode) {
  const goal = goalInput.value.trim();
  if (!goal) return;

  if (goal.length > 20) {
    alert("目標は20文字以内で入力してね！");
    goalInput.value = "";
    return;
  }

  currentMode = mode;
  totalDays = mode;

  localStorage.setItem("goal", goal);
  localStorage.setItem("mode", mode);
  localStorage.setItem("startDate", new Date().toDateString());

  const existingRecord = JSON.parse(localStorage.getItem("record") || "[]");
  let record = existingRecord.length > 0 ? existingRecord : [];
  localStorage.setItem("record", JSON.stringify(record));

  goalText.textContent = goal;
  startScreen.classList.add("hidden");
  mainScreen.classList.remove("hidden");

  generateCalendar();
  updateCalendarUI();

  document.getElementById("goal-text")?.addEventListener("click", handleGoalTap);
};

function generateCalendar() {
  calendar.innerHTML = "";
  for (let i = 0; i < totalDays; i++) {
    const square = document.createElement("div");
    square.className = "square";
    square.dataset.index = i;

    const base = document.createElement("div");
    base.className = "base";

    const stamp = document.createElement("div");
    stamp.className = "stamp";
    stamp.style.backgroundImage = `url('${i % 7 === 6 ? "img/smile.png" : "img/heart.png"}')`;

    const mask = document.createElement("div");
    mask.className = "mask";

    square.appendChild(base);
    square.appendChild(stamp);
    square.appendChild(mask);
    calendar.appendChild(square);

    square.addEventListener("click", () => onSquareClick(i));
    square.addEventListener("click", e => handleCalendarTap(e, i));
  }
}

function onSquareClick(index) {
  if (!manualMode) return;

  let record = JSON.parse(localStorage.getItem("record") || "[]");

  if (record.includes(index)) {
    // index以降を削除
    record = record.filter(i => i < index);
    for (let i = 0; i <= index; i++) {
      if (!record.includes(i)) {
        record.push(i);
      }
    }
  } else {
    // indexまでを追加
    record = [];
    for (let i = 0; i <= index; i++) {
      record.push(i);
    }
  }

  record = [...new Set(record)].sort((a, b) => a - b);

  localStorage.setItem("record", JSON.stringify(record));
  playSuccessSound();
  updateCalendarUI();
}

function markToday() {
  if (!canMarkToday()) return;

  let record = JSON.parse(localStorage.getItem("record") || "[]");
  const nextIndex = record.length;
  if (nextIndex >= totalDays) return;

  record.push(nextIndex);
  localStorage.setItem("record", JSON.stringify(record));
  localStorage.setItem("lastMarked", new Date().toDateString());

  playSuccessSound();
  updateCalendarUI();
}

function canMarkToday() {
  const last = localStorage.getItem("lastMarked");
  const today = new Date().toDateString();
  return last !== today && !manualMode;
}

function updateCalendarUI() {
  const record = JSON.parse(localStorage.getItem("record") || "[]");
  const latestMarked = record.length ? Math.max(...record) : -1;

  document.querySelectorAll(".square").forEach((el, i) => {
    const mask = el.querySelector(".mask");
    const stamp = el.querySelector(".stamp");
    const isMarked = record.includes(i);

    if (isMarked) {
      mask.classList.add("hidden");
      stamp.classList.add("glow");
    } else {
      stamp.classList.remove("glow");
      if (manualMode && i <= latestMarked) {
        mask.classList.add("hidden");
      } else {
        mask.classList.remove("hidden");
      }
    }
  });

  const valid = record.length >= currentMode;
  submitButton.classList.toggle("disabled", !valid);
  submitButton.disabled = !valid;

  submitButton.onclick = () => {
    const url =
      record.length >= 14
        ? (currentMode === 14 ? "https://example.com/form14" : "https://example.com/form30")
        : "#";
    window.open(url, "_blank");
  };
}

function playSuccessSound() {
  successAudio.currentTime = 0;
  successAudio.play().catch(e => {});
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
    if (manualMode) {
      localStorage.setItem("lastMarked", new Date().toDateString());
    }
    updateCalendarUI();
  }
}

function handleCalendarTap(e, index) {
  const now = Date.now();

  if (index === 0) {
    dayOneTapTimes.push(now);
    dayOneTapTimes = dayOneTapTimes.filter(t => now - t < 3000);
    if (dayOneTapTimes.length >= 5) {
      dayOneTapTimes = [];

      const record = JSON.parse(localStorage.getItem("record") || "[]");
      const reducedMode = record.length >= 14 ? 14 : 30;
      localStorage.setItem("mode", reducedMode);

      startScreen.classList.remove("hidden");
      mainScreen.classList.add("hidden");
    }
  }

  if (index === 6) {
    daySevenTapTimes.push(now);
    daySevenTapTimes = daySevenTapTimes.filter(t => now - t < 3000);
    if (daySevenTapTimes.length >= 5) {
      daySevenTapTimes = [];
      completeButton.disabled = false;
    }
  }
}

function dailyReset() {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const msUntilNextMidnight =
    ((24 - hour - 1) * 60 * 60 + (60 - minutes - 1) * 60 + (60 - seconds)) * 1000;

  setTimeout(() => {
    completeButton.disabled = false;
    if (manualMode) {
      manualMode = false;
      alert("⏰ 新しい日です！通常モードに戻りました。");
      updateCalendarUI();
    }
    dailyReset();
  }, msUntilNextMidnight);
}

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

    document.getElementById("goal-text")?.addEventListener("click", handleGoalTap);
  }

  dailyReset();
});

