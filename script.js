const calendar = document.getElementById("calendar");
const completeButton = document.getElementById("complete-button");
const submitButton = document.getElementById("submit-button");
const goalInput = document.getElementById("goal-input");
const goalText = document.getElementById("goal-text");
const startScreen = document.getElementById("start-screen");
const mainScreen = document.getElementById("main-screen");
const modal = document.getElementById("modal");
const confirmReset = document.getElementById("confirm-reset");
const cancelReset = document.getElementById("cancel-reset");

let totalDays = 30;
let currentMode = 30;
let manualMode = false;
let goalTapTimes = [];
let dayOneTapTimes = [];
let daySevenTapTimes = [];

// -------------------- チャレンジ開始 --------------------
function startChallenge(mode) {
  const goal = goalInput.value.trim();
  if (!goal) return;
  if (goal.length > 20) {
    alert("目標は20文字以内で入力してください");
    goalInput.value = "";
    return;
  }

  currentMode = mode;
  totalDays = mode;
  localStorage.setItem("goal", goal);
  localStorage.setItem("mode", mode);
  localStorage.setItem("record", JSON.stringify([]));
  localStorage.setItem("lastMarked", "");
  localStorage.setItem("lastLoginDate", new Date().toDateString());

  goalText.textContent = goal;
  startScreen.classList.add("hidden");
  mainScreen.classList.remove("hidden");

  generateCalendar();
  updateCalendarUI();

  setTimeout(() => {
    document.getElementById("goal-text")?.addEventListener("click", handleGoalTap);
  }, 0);
}

// -------------------- カレンダー生成 --------------------
function generateCalendar() {
  calendar.innerHTML = "";
  for (let i = 0; i < totalDays; i++) {
    const square = document.createElement("div");
    square.className = "square";
    square.dataset.index = i;

    const stamp = document.createElement("div");
    stamp.className = "stamp";
    stamp.style.backgroundImage = i % 7 === 6
      ? "url('img/smile.png')"
      : "url('img/heart.png')";

    const mask = document.createElement("div");
    mask.className = "mask";

    square.appendChild(stamp);
    square.appendChild(mask);
    calendar.appendChild(square);

    square.addEventListener("click", () => onSquareClick(i));
    square.addEventListener("click", handleCalendarTap);
  }
}

// -------------------- 手動入力モードのカレンダー操作 --------------------
function onSquareClick(index) {
  if (!manualMode) return;

  let record = [];
  for (let i = 0; i <= index; i++) record.push(i);

  localStorage.setItem("record", JSON.stringify(record));
  updateCalendarUI();
}

// -------------------- 今日の達成 --------------------
function markToday() {
  if (!canMarkToday()) return;

  let record = JSON.parse(localStorage.getItem("record") || "[]");
  const todayIndex = record.length;
  if (todayIndex < totalDays) {
    record.push(todayIndex);
  }
  localStorage.setItem("record", JSON.stringify(record));
  localStorage.setItem("lastMarked", new Date().toDateString());

  playSuccessSound();
  updateCalendarUI();
}

function canMarkToday() {
  const last = localStorage.getItem("lastMarked");
  const today = new Date().toDateString();
  return last !== today;
}

// -------------------- 成功音再生 --------------------
function playSuccessSound() {
  const audio = new Audio("img/success.mp3");
  audio.play();
}

// -------------------- カレンダー更新 --------------------
function updateCalendarUI() {
  const record = JSON.parse(localStorage.getItem("record") || "[]");

  document.querySelectorAll(".square").forEach((el, i) => {
    const mask = el.querySelector(".mask");
    if (record.includes(i)) {
      mask.classList.add("hidden");
    } else {
      mask.classList.remove("hidden");
    }
  });

  const valid = record.length >= currentMode;
  submitButton.classList.toggle("disabled", !valid);
  submitButton.disabled = !valid;

  if (valid) {
    showModal();
  }
}

// -------------------- モーダル --------------------
function showModal() {
  modal.classList.remove("hidden");
}

confirmReset.addEventListener("click", () => {
  modal.classList.add("hidden");
  resetApp();
  setTimeout(() => {
    window.open(
      "https://docs.google.com/forms/d/e/1FAIpQLSc9X2GgBDBuM29HJx37j_eUykUujmIHVQpapsl2ckc26TzD8g/viewform?usp=header",
      "_blank"
    );
  }, 100); // モーダル閉じてからフォームへ
});

cancelReset.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// -------------------- リセット --------------------
function resetApp() {
  localStorage.clear();
  mainScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  goalInput.value = "";
}

// -------------------- 隠し操作 --------------------
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
  }
}

function handleCalendarTap(e) {
  const square = e.target.closest(".square");
  if (!square) return;
  const index = Number(square.dataset.index);
  const now = Date.now();

  // 1番目のマス → スタート画面に戻る
  if (index === 0) {
    dayOneTapTimes.push(now);
    dayOneTapTimes = dayOneTapTimes.filter(t => now - t < 3000);
    if (dayOneTapTimes.length >= 5) {
      dayOneTapTimes = [];
      mainScreen.classList.add("hidden");
      startScreen.classList.remove("hidden");
    }
  }

  // 7番目のマス → 今日の達成ボタンを強制活性化
  if (index === 6) {
    daySevenTapTimes.push(now);
    daySevenTapTimes = daySevenTapTimes.filter(t => now - t < 3000);
    if (daySevenTapTimes.length >= 5) {
      daySevenTapTimes = [];
      completeButton.disabled = false;
    }
  }
}

// -------------------- 0時リセット --------------------
function checkMidnightReset() {
  const lastLoginDate = localStorage.getItem("lastLoginDate");
  const today = new Date().toDateString();
  if (lastLoginDate !== today) {
    localStorage.setItem("lastLoginDate", today);
    completeButton.disabled = false;
    if (manualMode) {
      manualMode = false;
      alert("⏰ 新しい日になったので手動モードを解除しました");
    }
  }
}

// -------------------- 初期化 --------------------
window.addEventListener("load", () => {
  const savedGoal = localStorage.getItem("goal");
  const savedMode = localStorage.getItem("mode");

  checkMidnightReset();

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

