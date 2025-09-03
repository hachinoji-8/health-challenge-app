const startScreen = document.getElementById("start-screen");
const calendarScreen = document.getElementById("calendar-screen");
const goalInput = document.getElementById("goal-input");
const goalText = document.getElementById("goal-text");
const dailyButton = document.getElementById("daily-button");
const formButton = document.getElementById("form-button");
const calendar = document.getElementById("calendar");
const modal = document.getElementById("modal");
const confirmReset = document.getElementById("confirm-reset");
const cancelReset = document.getElementById("cancel-reset");
const successSound = document.getElementById("success-sound");

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc9X2GgBDBuM29HJx37j_eUykUujmIHVQpapsl2ckc26TzD8g/viewform?usp=header";

let state = {
  goal: "",
  days: 0,
  progress: 0,
  lastMarked: "",
};

function saveState() {
  localStorage.setItem("challengeState", JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem("challengeState");
  if (saved) state = JSON.parse(saved);
}

function resetApp() {
  localStorage.removeItem("challengeState");
  state = { goal: "", days: 0, progress: 0, lastMarked: "" };
  showScreen(startScreen);
}

function showScreen(screen) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  screen.classList.add("active");
}

function buildCalendar() {
  calendar.innerHTML = "";
  for (let i = 0; i < state.days; i++) {
    const day = document.createElement("div");
    day.className = "day";

    const icon = document.createElement("img");
    icon.src = (i+1) % 7 === 0 ? "img/smile.png" : "img/heart.png";
    icon.className = "icon";

    const cover = document.createElement("div");
    cover.className = "cover";
    if (i < state.progress) cover.style.display = "none";

    day.appendChild(icon);
    day.appendChild(cover);
    calendar.appendChild(day);
  }
}

function markDay() {
  const today = new Date().toDateString();
  if (state.lastMarked === today) return; // 1日1回制限

  if (state.progress < state.days) {
    state.progress++;
    state.lastMarked = today;
    saveState();
    buildCalendar();
    successSound.play();

    if (state.progress === state.days) {
      document.querySelectorAll(".icon").forEach(i => i.classList.add("sparkle"));
      modal.classList.remove("hidden");
      formButton.classList.remove("hidden");
    }
  }
}

document.getElementById("start-14").addEventListener("click", () => {
  if (!goalInput.value.trim()) return alert("目標を入力してください");
  state.goal = goalInput.value.trim();
  state.days = 14;
  state.progress = 0;
  state.lastMarked = "";
  saveState();
  goalText.textContent = state.goal;
  buildCalendar();
  showScreen(calendarScreen);
});

document.getElementById("start-30").addEventListener("click", () => {
  if (!goalInput.value.trim()) return alert("目標を入力してください");
  state.goal = goalInput.value.trim();
  state.days = 30;
  state.progress = 0;
  state.lastMarked = "";
  saveState();
  goalText.textContent = state.goal;
  buildCalendar();
  showScreen(calendarScreen);
});

dailyButton.addEventListener("click", markDay);

formButton.addEventListener("click", () => {
  window.open(FORM_URL, "_blank");
});

confirmReset.addEventListener("click", () => {
  modal.classList.add("hidden");
  resetApp();
  setTimeout(() => window.open(FORM_URL, "_blank"), 200);
});

cancelReset.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// 初期ロード
loadState();
if (state.goal && state.days > 0) {
  goalText.textContent = state.goal;
  buildCalendar();
  showScreen(calendarScreen);
} else {
  showScreen(startScreen);
}


