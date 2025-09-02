/* ---- 設定 ---- */
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc9X2GgBDBuM29HJx37j_eUykUujmIHVQpapsl2ckc26TzD8g/viewform?usp=header";
const STATE_KEY = "challenge_state_v1";

/* ---- 要素 ---- */
const startScreen = document.getElementById("start-screen");
const mainScreen = document.getElementById("main-screen");
const goalInput = document.getElementById("goal-input");
const goalTextEl = document.getElementById("goal-text");
const calendarEl = document.getElementById("calendar");
const completeButton = document.getElementById("complete-button");
const submitButton = document.getElementById("submit-button");
const modal = document.getElementById("modal");
const confirmReset = document.getElementById("confirmReset");
const cancelReset = document.getElementById("cancelReset");
const successAudio = document.getElementById("success-audio");

/* ---- 状態変数 ---- */
let state = {
  goal: "",
  challengeDays: 0,
  achieved: [],      // boolean array length=challengeDays
  lastMarked: null,  // date string when user last used '今日の達成'
  manualMode: false
};

/* ---- タップ検出配列（時刻ミリ秒）---- */
let tapGoalTimes = [];
let tapFirstTimes = [];
let tapSeventhTimes = [];

/* ---------- ユーティリティ ---------- */
function todayStr(){ return new Date().toDateString(); }

function saveState(){
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function loadState(){
  const raw = localStorage.getItem(STATE_KEY);
  if (!raw) return false;
  try {
    const s = JSON.parse(raw);
    // 単純なバリデーション
    if (!s || typeof s.challengeDays !== "number") return false;
    state = s;
    return true;
  } catch(e){
    console.error("state parse error", e);
    return false;
  }
}

/* ---------- カレンダー生成 / UI 更新 ---------- */
function createCalendar(days){
  calendarEl.innerHTML = "";
  for (let i = 1; i <= days; i++){
    const square = document.createElement("div");
    square.className = "square";
    square.dataset.index = i - 1;

    const stamp = document.createElement("div");
    stamp.className = "stamp";
    // 1始まりで7の倍数に smile.png
    stamp.style.backgroundImage = (i % 7 === 0) ? "url('img/smile.png')" : "url('img/heart.png')";

    const mask = document.createElement("div");
    mask.className = "mask";
    mask.id = `mask-${i-1}`;

    square.appendChild(stamp);
    square.appendChild(mask);
    calendarEl.appendChild(square);

    // クリック（タップ）処理（共通）
    square.addEventListener("click", (e) => {
      const idx = Number(square.dataset.index);
      handleCalendarTap(idx, e);
    });
  }
  updateCalendarUI();
}

function updateCalendarUI(){
  // masks according to state.achieved (bool array)
  const masks = calendarEl.querySelectorAll(".mask");
  for (let i=0; i<masks.length; i++){
    if (state.achieved[i]) masks[i].classList.add("hidden");
    else masks[i].classList.remove("hidden");
  }

  // 今日の達成ボタンの状態
  const today = todayStr();
  if (state.manualMode) {
    completeButton.disabled = true;
  } else {
    completeButton.disabled = (state.lastMarked === today);
  }

  // submit ボタンの活性化
  const achievedCount = state.achieved.filter(Boolean).length;
  const allDone = state.challengeDays > 0 && achievedCount >= state.challengeDays;
  if (allDone) {
    submitButton.classList.remove("disabled");
    submitButton.disabled = false;
    // sparkle: add glow to all stamps
    const stamps = calendarEl.querySelectorAll(".stamp");
    stamps.forEach(s => s.classList.add("glow"));
  } else {
    submitButton.classList.add("disabled");
    submitButton.disabled = true;
    const stamps = calendarEl.querySelectorAll(".stamp");
    stamps.forEach(s => s.classList.remove("glow"));
  }

  // 表示のゴールテキスト
  goalTextEl.textContent = state.goal || "";

  saveState();
}

/* ---------- 操作: チャレンジ開始 ---------- */
document.getElementById("btn14").addEventListener("click", () => startChallenge(14));
document.getElementById("btn30").addEventListener("click", () => startChallenge(30));

function startChallenge(days){
  const g = goalInput.value.trim();
  if (!g) { alert("目標を入力してください"); return; }
  if (g.length > 20) { alert("20文字以内で入力してください"); goalInput.value = ""; return; }

  state.goal = g;
  state.challengeDays = days;
  state.achieved = Array(days).fill(false);
  state.lastMarked = null;
  state.manualMode = false;

  createCalendar(days);
  startScreen.classList.add("hidden");
  mainScreen.classList.remove("hidden");
  updateCalendarUI();
}

/* ---------- 操作: 今日の達成 ---------- */
completeButton.addEventListener("click", () => {
  if (state.manualMode) { alert("手動モード中は今日の達成ボタンは使えません"); return; }
  const today = todayStr();
  if (state.lastMarked === today) { alert("今日はすでに達成済みです"); return; }

  // 次の未達成マスを1つ外す（trueにする）
  const nextIdx = state.achieved.findIndex(v => !v);
  if (nextIdx === -1) return; // 既に全部
  state.achieved[nextIdx] = true;
  state.lastMarked = today;

  // 再描画
  playSuccessSound();
  updateCalendarUI();
});

/* ---------- 再生音 ---------- */
function playSuccessSound(){
  if (!successAudio) return;
  // 再生の失敗は無視（モバイルブラウザの制限など）
  successAudio.currentTime = 0;
  successAudio.play().catch(()=>{ /* ignore */ });
}

/* ---------- 手動モード（隠し）: 目標テキスト5回 */ 
goalTextEl.addEventListener("click", () => {
  const now = Date.now();
  tapGoalTimes = tapGoalTimes.filter(t => now - t < 3000);
  tapGoalTimes.push(now);
  if (tapGoalTimes.length >= 5) {
    tapGoalTimes = [];
    state.manualMode = !state.manualMode;
    // 手動モードONにすると「今日の達成は押された扱い（非活性）」にする
    if (state.manualMode) {
      state.lastMarked = todayStr();
      alert("🛠 手動モードに切り替えました（今日の達成は押した扱い）");
    } else {
      alert("↩ 通常モードに戻しました");
    }
    updateCalendarUI();
  }
});

/* ---------- カレンダーの特殊タップ（1番目・7番目） & 手動クリック処理 ---------- */
function handleCalendarTap(idx, e){
  // カレンダーの1番目（index 0）を5回で画面①へ戻る
  if (idx === 0) {
    const now = Date.now();
    tapFirstTimes = tapFirstTimes.filter(t => now - t < 3000);
    tapFirstTimes.push(now);
    if (tapFirstTimes.length >= 5) {
      tapFirstTimes = [];
      // 画面1に戻す（達成状況は保持）
      startScreen.classList.remove("hidden");
      mainScreen.classList.add("hidden");
      // モード変更のルール: 30日で14以上達成しているなら14に切り替えて達成扱い
      const achievedCount = state.achieved.filter(Boolean).length;
      if (state.challengeDays === 30 && achievedCount >= 14){
        state.challengeDays = 14;
        // 短くするので achieved 配列をトリム
        state.achieved = state.achieved.slice(0, 14);
        alert("30日チャレンジで14日以上達成しているため、14日チャレンジとして扱います。");
      }
      saveState();
      return;
    }
  }

  // カレンダーの7番目（index 6）を5回で今日ボタン強制活性化
  if (idx === 6) {
    const now = Date.now();
    tapSeventhTimes = tapSeventhTimes.filter(t => now - t < 3000);
    tapSeventhTimes.push(now);
    if (tapSeventhTimes.length >= 5) {
      tapSeventhTimes = [];
      state.lastMarked = null; // 強制的に今日未達成扱いにする
      completeButton.disabled = false;
      saveState();
      alert("🎯 今日の達成ボタンを強制的に有効化しました");
      return;
    }
  }

  // 手動モードでのカレンダータップ（任意のマスを押すとそれ以前は解除、以降はカバー）
  if (state.manualMode) {
    const idxInt = Number(idx);
    const old = state.achieved.slice();
    for (let i=0;i<state.challengeDays;i++){
      state.achieved[i] = (i <= idxInt);
    }
    // 再生判定: カバーが外れた（false->true）タイミングが1つでもあれば鳴らす
    let anyNew = false;
    for (let i=0;i<state.challengeDays;i++){
      if (!old[i] && state.achieved[i]) { anyNew = true; break; }
    }
    if (anyNew) playSuccessSound();
    // 手動モードON時は「今日の達成は押された扱い」なのでローカル上もセット
    state.lastMarked = todayStr();
    updateCalendarUI();
    return;
  }

  // 非手動モードでのカレンダータップは無視（仕様通り）
}

/* ---------- モーダル（応募フォーム遷移） ---------- */
document.getElementById("submit-button").addEventListener("click", () => {
  // submitは常に disabled 管理しているのでここは呼ばれないはずだが念のため
  modal.classList.remove("hidden");
});

confirmReset.addEventListener("click", () => {
  // 閉じてから処理（モーダル残存を防ぐ）
  modal.classList.add("hidden");
  // reset では必要な state キーのみ削除してUI崩れを回避
  localStorage.removeItem(STATE_KEY);
  // 初期画面へ戻す（アプリ内部リセット）
  state = { goal: "", challengeDays: 0, achieved: [], lastMarked: null, manualMode: false };
  startScreen.classList.remove("hidden");
  mainScreen.classList.add("hidden");
  calendarEl.innerHTML = "";
  // 100ms 待ってフォームを開く
  setTimeout(() => {
    window.open(FORM_URL, "_blank");
  }, 100);
});

cancelReset.addEventListener("click", () => {
  modal.classList.add("hidden");
});

/* ---------- 起動時: ロード / 復元 / 日跨ぎチェック ---------- */
window.addEventListener("load", () => {
  const restored = loadState();
  if (restored && state.challengeDays > 0) {
    // 復元
    createCalendar(state.challengeDays);
    // ensure achieved array length correct
    if (!Array.isArray(state.achieved) || state.achieved.length !== state.challengeDays) {
      state.achieved = Array(state.challengeDays).fill(false);
    }
    // 日付チェック：ローカルで最後に達成した date と現在の date が等しければ今日ボタンは無効のまま、
    // 等しくなければ有効にする（ただし manualMode は優先的に無効にする）
    if (state.manualMode) {
      // 手動モードは0時で解除する仕様。ここで日跨ぎなら解除する
      const last = state.lastMarked;
      if (!last || last !== todayStr()) {
        // 新しい日なら解除
        state.manualMode = false;
        state.lastMarked = null;
      }
    } else {
      // 非手動モード: 特に日跨ぎ処理は lastMarked のチェックで扱う
      // nothing
    }
    startScreen.classList.add("hidden");
    mainScreen.classList.remove("hidden");
    updateCalendarUI();
  } else {
    // 初回 or no saved
    startScreen.classList.remove("hidden");
    mainScreen.classList.add("hidden");
  }
});

