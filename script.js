const calendar = document.getElementById("calendar");
const completeButton = document.getElementById("complete-button");
const submitButton = document.getElementById("submit-button");
const goalInput = document.getElementById("goal-input");
const goalText = document.getElementById("goal-text");
const startScreen = document.getElementById("start-screen");
const mainScreen = document.getElementById("main-screen");
const goalDisplay = document.getElementById("goal-display");

let totalDays = 30;
let manualMode = false;
let currentDay = new Date().toDateString();

// チャレンジ開始
function startChallenge(days) {
  const goal = goalInput.value.trim();
  if (!goal) return;

  totalDays = days;
  localStorage.setItem("goal", goal);
  localStorage.setItem("days", days);
  localStorage.setItem("record", JSON.stringify([]));
  localStorage.setItem("lastMarked", "");
  localStorage.setItem("startDate", new Date().toDateString());

  goalText.textContent = goal;
  startScreen.classList.add("hidden");
  mainScreen.classList.remove("hidden");

  generateCalendar();
  updateCalendarUI();
  initHiddenGestures(); // 隠し操作の初期化
}

// カレンダー生成
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

// UI更新
function updateCalendarUI() {
  const record = JSON.parse(localStorage.getItem("record") || "[]");
  document.querySelectorAll(".square").forEach((el, i) => {
    const mask = el.querySelector(".mask");
    const stamp = el.querySelector(".stamp");
    if (record.includes(i)) {
      mask.classList.add("hidden");
      stamp.classList.add("glow");
    } else {
      mask.classList.remove("hidden");
      stamp.classList.remove("glow");
    }
  });

  submitButton.disabled = record.length < totalDays;
  submitButton.classList.toggle("disabled", submitButton.disabled);
}

// 自動達成ボタン
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

// 自動達成判定
function canMarkToday() {
  const last = localStorage.getItem("lastMarked");
  const today = new Date().toDateString();
  return !manualMode && last !== today;
}

// 手動達成モード（白マスク調整）
function handleCalendarTap(event) {
  if (!manualMode) return;
  const square = event.target.closest(".square");
  if (!square) return;
  const index = parseInt(square.dataset.index);
  if (isNaN(index)) return;

  const record = [];
  for (let i = 0; i <= index; i++) {
    record.push(i);
  }
  localStorage.setItem("record", JSON.stringify(record));
  localStorage.setItem("lastMarked", currentDay);
  updateCalendarUI();
}

// 隠し操作群
function createTapDetector(element, threshold, intervalMs, onTrigger) {
  let tapCount = 0;
  let tapTimer = null;
  element.addEventListener("click", () => {
    tapCount++;
    if (tapCount === 1) {
      tapTimer = setTimeout(() => { tapCount = 0; }, intervalMs);
    }
    if (tapCount >= threshold) {
      clearTimeout(tapTimer);
      tapCount = 0;
      onTrigger();
    }
  });
}

function initHiddenGestures() {
  const square0 = document.querySelector(".square[data-index='0']");

  // 手動モード ON（5秒以内に10回タップ）
  createTapDetector(goalDisplay, 10, 5000, () => {
    manualMode = true;
    completeButton.disabled = true;
    alert("手動モードに切り替えました ✨");
  });

  // 自動モード復帰（15秒以内に10回タップ）
  createTapDetector(goalDisplay, 10, 15000, () => {
    manualMode = false;
    completeButton.disabled = false;
    alert("自動モードに戻りました 🎯");
  });

  // 画面①に戻って記録リセット（5秒以内に10回タップ）
  createTapDetector(square0, 10, 5000, () => {
    localStorage.clear();
    alert("チャレンジ初期化＆目標入力画面に戻ります 🔁");
    startScreen.classList.remove("hidden");
    mainScreen.classList.add("hidden");
  });
}
