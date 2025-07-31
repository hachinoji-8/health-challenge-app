const calendar = document.getElementById("calendar");
const completeButton = document.getElementById("complete-button");
const submitButton = document.getElementById("submit-button");
const goalInput = document.getElementById("goal-input");
const goalText = document.getElementById("goal-text");
const startScreen = document.getElementById("start-screen");
const mainScreen = document.getElementById("main-screen");

let totalDays = 30;
let completedDays = 0;
let currentMode = 30; // default mode
let manualMode = false;
let clickCountMap = {};

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
document.querySelectorAll(".square").forEach((el, i) => {
const mask = el.querySelector(".mask");
mask.classList.toggle("hidden", record.includes(i));
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

// 隠しコマンド：マス内の角クリックで回数カウント
calendar.addEventListener("click", (e) => {
const square = e.target.closest(".square");
if (!square) return;

const rect = square.getBoundingClientRect();
const x = e.clientX - rect.left;
const y = e.clientY - rect.top;

const key = getCornerKey(x, y, rect.width, rect.height);
if (!key) return;

clickCountMap[key] = (clickCountMap[key] || 0) + 1;

if (key === "bottomRight" && clickCountMap[key] === 15) {
manualMode = true;
alert("🛠 マニュアル記録モードに切り替えました");
}
if (key === "topLeft" && clickCountMap[key] === 15) {
manualMode = false;
alert("↩ 通常モードに戻しました");
}
if (key === "topRight" && clickCountMap[key] === 15) {
localStorage.removeItem("goal");
localStorage.removeItem("record");
localStorage.removeItem("startDate");
localStorage.removeItem("lastMarked");
localStorage.removeItem("mode");
location.reload();
}
});

function getCornerKey(x, y, width, height) {
const zone = 0.3;
const cornerSize = Math.min(width, height) * zone;

if (x < cornerSize && y < cornerSize) return "topLeft";
if (x > width - cornerSize && y < cornerSize) return "topRight";
if (x > width - cornerSize && y > height - cornerSize) return "bottomRight";
return null;
}

// 初期化
window.onload = () => {
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
}
};
