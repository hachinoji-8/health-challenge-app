// script.js

// --- 定数・変数 ---
const FORM_URL = "https://www.tochigihoken.or.jp/";
const MAX_TAPS = 5;
const TAP_WINDOW_MS = 3000;

let modeDays = 30; // 初期は30（ボタンで14 or 30を選択）
let record = [];   // boolean配列: true = mask外れ(達成), false = maskあり(未達成)
let manualMode = false;

// 裏ワザカウント（個別管理）
let taps = {
  goal: [],   // goal text taps
  day1: [],   // 1st cell taps
  day7: []    // 7th cell taps (index 6)
};

// --- DOM 要素 ---
const calendar = document.getElementById("calendar");
const completeButton = document.getElementById("complete-button");
const submitButton = document.getElementById("submit-button");
const goalInput = document.getElementById("goal-input");
const goalText = document.getElementById("goal-text");
const startScreen = document.getElementById("start-screen");
const mainScreen = document.getElementById("main-screen");
const successAudio = document.getElementById("success-audio");

// --- 初期ロード ---
loadState();
renderInitialScreenState();
generateCalendar();
updateCalendarUI();
disableCompleteButton();
setMidnightReset();

// --- グローバル関数（HTML onclick と互換） ---
function startChallenge(mode) {
  const goal = goalInput.value.trim();
  if (!goal) return;

  if (goal.length > 20) {
    alert("目標は20文字以内で入力してね！");
    goalInput.value = "";
    return;
  }

  modeDays = mode;
  record = Array(modeDays).fill(false); // すべて未達成で初期化
  saveState();

  goalText.textContent = goal;
  startScreen.classList.add("hidden");
  mainScreen.classList.remove("hidden");

  generateCalendar();
  updateCalendarUI();
  disableCompleteButton(); // スタート時は無効
}

function markToday() {
  // 今日の達成ボタン（completeButton）押下で一番左の未達成を達成にする
  if (completeButton.disabled) return;

  const idx = record.findIndex(v => v === false);
  if (idx === -1) return;

  // 1つ進める（mask外し）
  record[idx] = true;
  playSuccessSound();
  saveState();
  updateCalendarUI();

  // ボタンは押したら無効化（同日2回不可）
  disableCompleteButton();
}

// --- カレンダー生成 ---
function generateCalendar() {
  calendar.innerHTML = "";
  for (let i = 0; i < modeDays; i++) {
    const square = document.createElement("div");
    square.className = "square";
    square.dataset.index = i;

    // base（常に動かない白丸）
    const base = document.createElement("div");
    base.className = "base";

    // stamp（png）: 7の倍数には heart, それ以外は heart? — per final request: 7の倍数に heart, others smile
    const stamp = document.createElement("div");
    stamp.className = "stamp";
    const isSevenMultiple = ((i + 1) % 7 === 0);
    const imgPath = isSevenMultiple ? "img/smile.png" : "img/heart.png";
    // NOTE: user said "7の倍数の〇にだけheartを配置" and earlier they sometimes swapped; keep as:
    // we'll put heart on 7の倍数, smile elsewhere — (if you prefer inverse, swap the paths)
    stamp.style.backgroundImage = `url('${isSevenMultiple ? "img/heart.png" : "img/smile.png"}')`;

    // mask（カバー） — visible when not achieved
    const mask = document.createElement("div");
    mask.className = "mask";
    if (record[i]) mask.classList.add("hidden");

    // クリック処理
    square.addEventListener("click", (e) => {
      const idx = Number(square.dataset.index);

      // 裏ワザ検出
      if (idx === 0) handleTapSequence("day1");
      if (idx === 6) handleTapSequence("day7");

      // 手動モードでの直接操作（仕様：クリックしたインデックスまでを達成、以降を未達成に）
      if (manualMode) {
        applyManualIndex(idx);
        saveState();
        updateCalendarUI();
      }
    });

    // goalText のタップは別で handle（登録は下）
    square.appendChild(base);
    square.appendChild(stamp);
    square.appendChild(mask);
    calendar.appendChild(square);
  }
}

// --- 手動でインデックス適用 ---
function applyManualIndex(index) {
  // indexまで true、indexより先は false
  for (let i = 0; i < modeDays; i++) {
    record[i] = (i <= index);
  }
  // 再生音が「maskが外れたタイミング」で鳴るため、判定して鳴らす
  playSuccessIfNewlyUnlocked();
}

// --- 再生成のためのヘルパー ---
function updateCalendarUI() {
  // update squares
  const squares = calendar.querySelectorAll(".square");
  squares.forEach((sq, i) => {
    const mask = sq.querySelector(".mask");
    const stamp = sq.querySelector(".stamp");
    if (record[i]) {
      mask.classList.add("hidden");
      stamp.classList.add("glow");
    } else {
      mask.classList.remove("hidden");
      stamp.classList.remove("glow");
    }
  });

  // フォームボタン制御（全マスク外れたら有効）
  const allDone = record.length > 0 && record.every(v => v === true);
  submitButton.classList.toggle("disabled", !allDone);
  submitButton.disabled = !allDone;
  // submit ボタンのクリック先
  submitButton.onclick = () => {
    if (!submitButton.disabled) window.open(FORM_URL, "_blank");
  };
}

// --- 裏ワザタップ処理 ---
function handleTapSequence(type) {
  const now = Date.now();
  taps[type].push(now);
  // 3秒以内のタップのみカウント
  taps[type] = taps[type].filter(t => now - t <= TAP_WINDOW_MS);

  if (taps[type].length >= MAX_TAPS) {
    taps[type] = []; // reset
    if (type === "day1") {
      // スタート画面に戻す。目標テキスト＆日数はリセット
      goalInput.value = "";
      goalText.textContent = "";
      modeDays = 30;
      record = [];
      saveState();
      mainScreen.classList.add("hidden");
      startScreen.classList.remove("hidden");
    } else if (type === "day7") {
      // 強制有効化（モード問わず）
      enableCompleteButton();
    }
  }
}

// --- goalText のタップ（手動モード切替用） ---
goalText.addEventListener("click", () => {
  const now = Date.now();
  taps.goal.push(now);
  taps.goal = taps.goal.filter(t => now - t <= TAP_WINDOW_MS);

  if (taps.goal.length >= MAX_TAPS) {
    taps.goal = [];
    // 切替
    manualMode = !manualMode;
    if (manualMode) {
      // 入ったら必ず完了ボタンは無効化
      disableCompleteButton();
      // 視覚的に分かるならここで何か表示しても良い（今回は alert を控える）
    } else {
      // 手動解除したら即有効化はしない（0時待ち or day7で有効化）
      // ただし仕様上、解除時は何もしない
    }
  }
});

// --- 今日の達成ボタン（外から呼ばれるグローバル関数） ---
window.markToday = function() {
  markToday();
};

// --- enable / disable complete button ---
function enableCompleteButton() {
  completeButton.disabled = false;
  // 見た目のクラス等を触りたければここで
}
function disableCompleteButton() {
  completeButton.disabled = true;
}

// --- success sound ---
function playSuccessSound() {
  if (!successAudio) return;
  try {
    successAudio.currentTime = 0;
    successAudio.play();
  } catch (e) {
    // 自動再生制限など無視
  }
}

// --- 判定して必要なら音を鳴らす（manual操作で複数が一気に外れる場合） ---
function playSuccessIfNewlyUnlocked() {
  // 再生条件：直前の保存状態と比較して新しく true になったマスがあれば再生
  const prev = JSON.parse(localStorage.getItem("record") || "[]");
  let newly = false;
  if (prev.length === record.length) {
    for (let i = 0; i < record.length; i++) {
      if (!prev[i] && record[i]) { newly = true; break; }
    }
  } else {
    // 長さ違う -> 何か変わった -> 再生
    newly = record.some(v => v === true);
  }
  if (newly) playSuccessSound();
}

// --- 0時リセット（必ず有効化 + 手動モード解除） ---
function setMidnightReset() {
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const ms = nextMidnight - now;
  setTimeout(() => {
    // 0時になったら manualMode を解除し、完了ボタンを有効化（仕様どおり）
    manualMode = false;
    enableCompleteButton();
    setMidnightReset(); // 再帰
  }, ms + 50); // 少し余裕を持たせる
}

// --- 保存・読込 ---
function saveState() {
  try {
    localStorage.setItem("record", JSON.stringify(record));
    localStorage.setItem("modeDays", String(modeDays));
    localStorage.setItem("goalText", goalText.textContent || goalInput.value || "");
  } catch (e) {
    // ignore
  }
}

function loadState() {
  try {
    const rec = localStorage.getItem("record");
    if (rec) {
      const parsed = JSON.parse(rec);
      record = Array.isArray(parsed) ? parsed : [];
    }
    const md = localStorage.getItem("modeDays");
    if (md) modeDays = parseInt(md, 10);
    const gt = localStorage.getItem("goalText");
    if (gt) {
      // restore goal text if available
      goalText.textContent = gt;
      goalInput.value = gt;
      // if record existed, show main screen
      if (record.length && record.length === modeDays) {
        startScreen.classList.add("hidden");
        mainScreen.classList.remove("hidden");
      }
    }
  } catch (e) {
    record = [];
  }

  // If nothing loaded, default blank record if modeDays defined
  if (!record || !record.length) {
    record = Array(modeDays).fill(false);
  }
}

// shorthand to align with earlier names
function saveStateAlias() { saveState(); }
function loadStateAlias() { loadState(); }

// Compatibility functions used in other parts
function saveStateWrap() { saveState(); }
function loadStateWrap() { loadState(); }

// Exports used by HTML onclicks
window.startChallenge = startChallenge;
window.markToday = markToday;
window.saveState = saveState;

// --- helper: initial render depending on saved state ---
function renderInitialScreenState() {
  // if user had a goal text and record saved, show main; else show start
  const gt = localStorage.getItem("goalText");
  if (gt && gt.trim() !== "") {
    goalText.textContent = gt;
    startScreen.classList.add("hidden");
    mainScreen.classList.remove("hidden");
  } else {
    startScreen.classList.remove("hidden");
    mainScreen.classList.add("hidden");
  }
}

// on load, re-render calendar visuals
window.addEventListener("load", () => {
  generateCalendar();
  updateCalendarUI();
});
