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

// 裏技用タップ記録
let goalTapTimes = [];
let dayOneTapTimes = [];
let daySevenTapTimes = [];

// チャレンジ開始
function startChallenge(mode) {
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

goalText.textContent = goal;
startScreen.classList.add("hidden");
mainScreen.classList.remove("hidden");

generateCalendar();
updateCalendarUI();

// 裏技用リスナー（目標タップで手動モード切替）
goalText.addEventListener("click", handleGoalTap);
}

// カレンダー生成
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

square.addEventListener("click", () => handleCalendarTap(null, i));
}
}

// 今日のチャレンジ達成（履歴記録なし）
function markToday() {
if (manualMode || completeButton.disabled) return;
playSuccessSound();
completeButton.disabled = true;
updateCalendarUI();
}

// UI更新（現状は全マスク表示）
function updateCalendarUI() {
document.querySelectorAll(".square").forEach((el) => {
const mask = el.querySelector(".mask");
const stamp = el.querySelector(".stamp");
mask.classList.remove("hidden");
stamp.classList.remove("glow");
});

submitButton.classList.add("disabled");
submitButton.disabled = true;
}

// 成功音
function playSuccessSound() {
successAudio.currentTime = 0;
successAudio.play().catch(() => {});
}

// 裏技：目標5連打で手動モード切替
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

// 裏技：1日目 or 7日目5連打
function handleCalendarTap(e, index) {
const now = Date.now();

// 1日目5連打でスタート画面へ
if (index === 0) {
dayOneTapTimes.push(now);
dayOneTapTimes = dayOneTapTimes.filter(t => now - t < 3000);
if (dayOneTapTimes.length >= 5) {
dayOneTapTimes = [];
startScreen.classList.remove("hidden");
mainScreen.classList.add("hidden");
}
}

// 7日目5連打でボタン復活
if (index === 6) {
daySevenTapTimes.push(now);
daySevenTapTimes = daySevenTapTimes.filter(t => now - t < 3000);
if (daySevenTapTimes.length >= 5) {
daySevenTapTimes = [];
completeButton.disabled = false;
}
}
}

// 毎日0時に自動復活
function dailyReset() {
const now = new Date();
const hour = now.getHours();
const minutes = now.getMinutes();
const seconds = now.getSeconds();

const msUntilNextMidnight =
((24 - hour - 1) * 60 * 60 + (60 - minutes - 1) * 60 + (60 - seconds)) * 1000;

setTimeout(() => {
if (!manualMode) {
completeButton.disabled = false;
}
dailyReset();
}, msUntilNextMidnight);
}

// ページ読み込み時
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

goalText.addEventListener("click", handleGoalTap);
}

dailyReset();
});

// HTML onclick 対応用にグローバル公開
window.startChallenge = function(mode) {
  const goal = goalInput.value.trim();
  if (!goal) return;

  if (goal.length > 20) {
    alert("目標は20文字以内で入力してね！");
    goalInput.value = "";
    return;
  }

  currentMode = mode;
  totalDays = mode;

  goalText.textContent = goal;
  startScreen.classList.add("hidden");
  mainScreen.classList.remove("hidden");

  generateCalendar();
  updateCalendarUI();
};
window.markToday = markToday;

