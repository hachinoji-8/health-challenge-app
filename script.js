// --- 定数・変数 ---
let modeDays = 14; // 14日 or 30日モード
let record = [];   // true=マスク外れ、false=マスクあり
let manualMode = false;
let clickCounts = { day1: 0, day7: 0, goal: 0 };
let clickTimers = { day1: null, day7: null, goal: null };
const formURL = "https://www.tochigihoken.or.jp/";

// --- 要素取得 ---
const startScreen = document.getElementById("start-screen");
const calendarScreen = document.getElementById("calendar-screen");
const goalInput = document.getElementById("goal-input");
const modeButtons = document.querySelectorAll(".mode-btn");
const calendar = document.getElementById("calendar");
const goalText = document.getElementById("goal-text");
const achieveBtn = document.getElementById("achieve-btn");
const formBtn = document.getElementById("form-btn");

// --- 初期化 ---
loadData();
renderCalendar();
updateFormBtn();
disableAchieveBtn(); // 初期は無効
setMidnightReset();

// --- モード選択 ---
modeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        modeDays = parseInt(btn.dataset.days);
        startScreen.style.display = "none";
        calendarScreen.style.display = "block";
        goalText.textContent = goalInput.value;
        initCalendar();
    });
});

// --- カレンダー初期化 ---
function initCalendar() {
    record = Array(modeDays).fill(false);
    saveData();
    renderCalendar();
    disableAchieveBtn();
}

// --- カレンダー描画 ---
function renderCalendar() {
    calendar.innerHTML = "";
    for (let i = 0; i < modeDays; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");

        const base = document.createElement("div");
        base.classList.add("base");

        const stamp = document.createElement("img");
        stamp.classList.add("stamp");
        stamp.src = ((i + 1) % 7 === 0) ? "img/heart.png" : "img/smile.png";

        const mask = document.createElement("div");
        mask.classList.add("mask");
        if (record[i]) mask.style.display = "none";

        // 手動モードのみ直接変更可能
        cell.addEventListener("click", () => {
            if (manualMode) {
                record[i] = !record[i];
                saveData();
                renderCalendar();
                updateFormBtn();
            }
        });

        // 裏技
        if (i === 0) cell.addEventListener("click", () => secretClick("day1"));
        if (i === 6) cell.addEventListener("click", () => secretClick("day7"));

        cell.appendChild(base);
        cell.appendChild(stamp);
        cell.appendChild(mask);
        calendar.appendChild(cell);
    }
}

// --- 今日の達成 ---
achieveBtn.addEventListener("click", () => {
    const idx = record.findIndex(v => v === false);
    if (idx !== -1) {
        record[idx] = true;
        saveData();
        renderCalendar();
        updateFormBtn();
    }
    disableAchieveBtn();
});

// --- 応募フォーム ---
formBtn.addEventListener("click", () => {
    window.open(formURL, "_blank");
});

// --- 裏技判定 ---
function secretClick(type) {
    clickCounts[type]++;
    if (!clickTimers[type]) {
        clickTimers[type] = setTimeout(() => {
            clickCounts[type] = 0;
            clickTimers[type] = null;
        }, 3000);
    }

    if (clickCounts[type] >= 5) {
        clickCounts[type] = 0;
        clearTimeout(clickTimers[type]);
        clickTimers[type] = null;

        if (type === "day1") {
            // スタート画面に戻す
            startScreen.style.display = "block";
            calendarScreen.style.display = "none";
            goalInput.value = "";
            record = [];
            saveData();
        }
        else if (type === "day7") {
            enableAchieveBtn(); // 強制有効化
        }
        else if (type === "goal") {
            // 手動モード切替
            manualMode = !manualMode;
            disableAchieveBtn(); // 切替時は必ず無効化
        }
    }
}

// --- 手動モード切替（目標5回タップ） ---
goalText.addEventListener("click", () => secretClick("goal"));

// --- 0時リセット ---
function setMidnightReset() {
    const now = new Date();
    const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
    setTimeout(() => {
        if (!manualMode) {
            enableAchieveBtn();
        }
        setMidnightReset();
    }, msToMidnight);
}

// --- ボタン制御 ---
function enableAchieveBtn() {
    achieveBtn.disabled = false;
}
function disableAchieveBtn() {
    achieveBtn.disabled = true;
}

// --- フォームボタン制御 ---
function updateFormBtn() {
    const allDone = record.every(v => v === true);
    formBtn.disabled = !allDone;
}

// --- 保存・読込 ---
function saveData() {
    localStorage.setItem("record", JSON.stringify(record));
    localStorage.setItem("modeDays", modeDays);
}
function loadData() {
    const rec = localStorage.getItem("record");
    if (rec) record = JSON.parse(rec);
    const days = localStorage.getItem("modeDays");
    if (days) modeDays = parseInt(days);
}
