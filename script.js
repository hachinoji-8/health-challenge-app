const stampGrid = document.getElementById("stampGrid");
const markButton = document.getElementById("markButton");
const submitButton = document.getElementById("submitButton");

const maxDays = 30;

// 初期化
function createGrid() {
  for (let i = 0; i < maxDays; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.id = "cell-" + i;
    stampGrid.appendChild(cell);
  }
}

// 現在の日付キーを取得（yyyy-mm-dd）
function getTodayKey() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

// スタンプを再描画
function renderStamps() {
  const data = JSON.parse(localStorage.getItem("challenge-stamps") || "[]");
  data.forEach((d, i) => {
    const cell = document.getElementById("cell-" + i);
    if (cell) {
      cell.classList.add("stamped");
      cell.textContent = "🦷";
    }
  });
  if (data.length >= maxDays) {
    enableSubmit();
  }
}

// 今日が押されたかチェック
function alreadyStampedToday() {
  const last = localStorage.getItem("last-stamped-date");
  return last === getTodayKey();
}

// 今日のスタンプ押し
function markToday() {
  if (alreadyStampedToday()) return;
  let data = JSON.parse(localStorage.getItem("challenge-stamps") || "[]");
  if (data.length >= maxDays) return;
  data.push(getTodayKey());
  localStorage.setItem("challenge-stamps", JSON.stringify(data));
  localStorage.setItem("last-stamped-date", getTodayKey());
  renderStamps();
  markButton.disabled = true;
}

// 応募ボタン有効化
function enableSubmit() {
  submitButton.classList.add("enabled");
  submitButton.removeAttribute("disabled");
}

// ボタン状態制御
function updateButtonState() {
  markButton.disabled = alreadyStampedToday();
}

// 実行
createGrid();
renderStamps();
updateButtonState();
