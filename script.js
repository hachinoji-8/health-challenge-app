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

  setTimeout(() => {
    document.getElementById("goal-text")?.addEventListener("click", handleGoalTap);
  }, 0);
}

function generateCalendar() {
  calendar.innerHTML = "";
  for (let i = 0; i < totalDays; i++) {
    const square = document.createElement("div");
    square.className = "square";
    square.dataset.index = i;

    const stamp = document.createElement("div");
    stamp.className = "stamp";

    const mask = document.createElement("div");
    mask.className = "mask";

    square.appendChild(stamp);
    square.appendChild(mask);
    calendar.appendChild(square);

    square.addEventListener("click", () => onSquareClick(i));
    square.addEventListener("click", handleCalendarTap);
  }
}

function onSquareClick(index) {
  if (!manualMode) return;

  let record = JSON.parse(localStorage.getItem("record") || "[]");

  if (!record.includes(index)) {
    record.push(index);
  } else {
    record = record.filter(i => i !== index);
  }

  localStorage.setItem("record", JSON.stringify(record));
  updateCalendarUI();
}

function markToday() {
  if (!canMarkToday()) return;

  let record = JSON.parse(localStorage.getItem("record") || "[]");
  const todayIndex = record.length;
  record.push(todayIndex);
  localStorage.setItem("record", JSON.stringify(record));
  localStorage.setItem("lastMarked", new Date().toDateString());

  updateCalendarUI();
}

function canMarkToday() {
  const last = localStorage.getItem("lastMarked");
  const today = new Date().toDateString();
  return last !== today;
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

      const stampPath = i % 7 === 0 ? "img/smile.png" : "img/heart.png";
      stamp.style.backgroundImage = `url('${stampPath}')`;
      stamp.classList.add("glow");
    } else {
      stamp.style.backgroundImage = "";
      stamp.classList.remove("glow");

      if (manualMode) {
        if (i <= latestMarked) {
          mask.classList.add("hidden");
        } else {
          mask.classList.remove("hidden");
        }
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
      currentMode === 14
        ? "https://example.com/form14"
        : "https://example.com/form30";
    window.open(url, "_blank");
  };
}

function handleGoalTap() {
  const now = Date.now();
  goalTapTimes.push(now);
  goalTapTimes = goalTapTimes.filter(t => now - t < 5000);

  if (goalTapTimes.length >= 10) {
    manualMode = !manualMode;
    goalTapTimes = [];

    alert(manualMode ? "🛠 手動モードに切り替えました" : "↩ 通常モードに戻しました");
    completeButton.disabled = manualMode;
    updateCalendarUI();
  }
}

function handleCalendarTap(e) {
  const square = e.target.closest(".square");
  if (!square || square.dataset.index !== "0") return;

  const now = Date.now();
  dayOneTapTimes.push(now);
  dayOneTapTimes = dayOneTapTimes.filter(t => now - t < 5000);

  if (dayOneTapTimes.length >= 10) {
    dayOneTapTimes = [];
    mainScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
  }
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

    setTimeout(() => {
      document.getElementById("goal-text")?.addEventListener("click", handleGoalTap);
    }, 0);
  }
});
