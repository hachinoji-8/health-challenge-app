const screen1 = document.getElementById("screen1");
const screen2 = document.getElementById("screen2");
const goalInput = document.getElementById("goalInput");
const goalText = document.getElementById("goalText");
const calendar = document.getElementById("calendar");
const achieveBtn = document.getElementById("achieveBtn");
const formBtn = document.getElementById("formBtn");

const modal = document.getElementById("modal");
const confirmReset = document.getElementById("confirmReset");
const cancelReset = document.getElementById("cancelReset");

let challengeDays = 0;
let currentDay = 0;
let achieved = [];
let lastDate = null;

// ---------------- 初期化 ----------------
function resetApp() {
  screen1.classList.remove("hidden");
  screen2.classList.add("hidden");
  goalInput.value = "";
  calendar.innerHTML = "";
  goalText.textContent = "";
  formBtn.classList.add("hidden");
  achieved = [];
  currentDay = 0;
  challengeDays = 0;
  localStorage.clear();
}

// ---------------- カレンダー作成 ----------------
function createCalendar(days) {
  calendar.innerHTML = "";
  for (let i = 1; i <= days; i++) {
    const square = document.createElement("div");
    square.className = "square";

    const stamp = document.createElement("div");
    stamp.className = "stamp";
    stamp.style.backgroundImage = "url('stamp.png')";

    const mask = document.createElement("div");
    mask.className = "mask";
    mask.id = `mask-${i}`;

    square.appendChild(stamp);
    square.appendChild(mask);
    calendar.appendChild(square);
  }
}

// ---------------- チャレンジ開始 ----------------
document.getElementById("btn14").addEventListener("click", () => startChallenge(14));
document.getElementById("btn30").addEventListener("click", () => startChallenge(30));

function startChallenge(days) {
  if (!goalInput.value.trim()) {
    alert("目標を入力してください！");
    return;
  }
  challengeDays = days;
  goalText.textContent = goalInput.value;
  screen1.classList.add("hidden");
  screen2.classList.remove("hidden");
  createCalendar(days);

  // 初期データ保存
  lastDate = new Date().toDateString();
  localStorage.setItem("lastDate", lastDate);
  localStorage.setItem("challengeDays", challengeDays);
}

// ---------------- 今日の達成 ----------------
achieveBtn.addEventListener("click", () => {
  const today = new Date().toDateString();
　if (lastDate === today) {
  alert("今日はすでに達成済みです！");
  return;
  }
  currentDay++;
  lastDate = today;
  localStorage.setItem("lastDate", lastDate);

  const mask = document.getElementById(`mask-${currentDay}`);
  if (mask) mask.classList.add("hidden");

  if (currentDay === challengeDays) {
    // 全達成 → モーダル表示
    showModal();
  }
});

// ---------------- モーダル制御 ----------------
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
  }, 100);
});

cancelReset.addEventListener("click", () => {
  modal.classList.add("hidden");
});
