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
const successSound = document.getElementById("successSound");

let challengeDays = 0;
let currentDay = 0;
let achieved = [];
let lastDate = null;
let manualMode = false;
let clickCount = 0;
let clickTimer = null;

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
  manualMode = false;
  localStorage.clear();
}

// ---------------- カレンダー作成 ----------------
function createCalendar(days) {
  calendar.innerHTML = "";
  for (let i = 1; i <= days; i++) {
    const square = document.createElement("div");
    square.className = "square";
    square.dataset.index = i;

    const stamp = document.createElement("div");
    stamp.className = "stamp";
    stamp.style.backgroundImage =
      i % 7 === 0 ? "url('smile.png')" : "url('heart.png')";

    const mask = document.createElement("div");
    mask.className = "mask";
    mask.id = `mask-${i}`;

    square.appendChild(stamp);
    square.appendChild(mask);
    calendar.appendChild(square);

    // 手動モード用クリックイベント
    square.addEventListener("click", () => {
      if (!manualMode) return;
      updateManualProgress(i);
    });

    // 特殊操作：1番目の〇で画面①に戻る
    if (i === 1) {
      square.addEventListener("click", () => {
        handleSpecialClick(() => {
          screen1.classList.remove("hidden");
          screen2.classList.add("hidden");
          goalInput.value = goalText.textContent;
        });
      });
    }

    // 特殊操作：7番目の〇で達成ボタン活性化
    if (i === 7) {
      square.addEventListener("click", () => {
        handleSpecialClick(() => {
          achieveBtn.disabled = false;
        });
      });
    }
  }
}

// ---------------- チャレンジ開始 ----------------
document.getElementById("btn14").addEventListener("click", () => startChallenge(14));
document.getElementById("btn30").addEventListener("click", () => startChallenge(30));

function startChallenge(days) {
  const goal = goalInput.value.trim();
  if (!goal) {
    alert("目標を入力してください！");
    return;
  }
  if (goal.length > 20) {
    alert("20文字以内で入力してください！");
    goalInput.value = "";
    return;
  }

  challengeDays = days;
  goalText.textContent = goal;
  screen1.classList.add("hidden");
  screen2.classList.remove("hidden");
  createCalendar(days);

  lastDate = new Date().toDateString();
  localStorage.setItem("lastDate", lastDate);
  localStorage.setItem("challengeDays", challengeDays);
  localStorage.setItem("goalText", goal);
  localStorage.setItem("currentDay", currentDay);
}

// ---------------- 今日の達成 ----------------
achieveBtn.addEventListener("click", () => {
  const today = new Date().toDateString();
  const storedDate = localStorage.getItem("lastDate");

  if (storedDate === today) {
    alert("今日はすでに達成済みです！");
    return;
  }

  currentDay++;
  lastDate = today;
  localStorage.setItem("lastDate", lastDate);
  localStorage.setItem("currentDay", currentDay);

  const mask = document.getElementById(`mask-${currentDay}`);
  if (mask) mask.classList.add("hidden");

  successSound.play();

  checkCompletion();
});

// ---------------- 達成判定 ----------------
function checkCompletion() {
  let allCleared = true;
  for (let i = 1; i <= challengeDays; i++) {
    const mask = document.getElementById(`mask-${i}`);
    if (mask && !mask.classList.contains("hidden")) {
      allCleared = false;
      break;
    }
  }

  if (allCleared) {
    for (let i = 1; i <= challengeDays; i++) {
      const stamp = calendar.querySelector(`.square:nth-child(${i}) .stamp`);
      if (stamp) stamp.classList.add("glow");
    }
    formBtn.classList.remove("hidden");
    showModal();
  }
}

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

// ---------------- 手動モード切替 ----------------
goalText.addEventListener("click", () => {
  handleSpecialClick(() => {
    manualMode = !manualMode;
    achieveBtn.disabled = manualMode;
  });
});

function updateManualProgress(index) {
  currentDay = index;
  for (let i = 1; i <= challengeDays; i++) {
    const mask = document.getElementById(`mask-${i}`);
    if (mask) {
      if (i <= index) {
        mask.classList.add("hidden");
      } else {
        mask.classList.remove("hidden");
      }
    }
  }
  successSound.play();
  checkCompletion();
}

// ---------------- 特殊クリック判定 ----------------
function handleSpecialClick(callback) {
  clickCount++;
  if (clickCount === 1) {
    clickTimer = setTimeout(() => {
      clickCount = 0;
    }, 3000);
  }
  if (clickCount >= 5) {
    clearTimeout(clickTimer);
    clickCount = 0;
    callback();
  }
}

// ---------------- ページ読み込み時の復元 ----------------
window.addEventListener("load", () => {
  const savedGoal = localStorage.getItem("goalText");
  const savedDays = parseInt(localStorage.getItem("challengeDays"), 10);
  const savedCurrent = parseInt(localStorage.getItem("currentDay"), 10);
  const savedDate = localStorage.getItem("lastDate");

  if (savedGoal && savedDays) {
    challengeDays = savedDays;
    currentDay = savedCurrent || 0;
    lastDate = savedDate || null;

    goalText.textContent = savedGoal;
    screen1.classList.add("hidden");
    screen2.classList.remove("hidden");
    createCalendar(challengeDays);

    for (let i = 1; i <= currentDay; i++) {
      const mask = document.getElementById(`mask-${i}`);
      if (mask) mask.classList.add("hidden");
    }

    checkCompletion();

    const today = new Date().toDateString();
    if (lastDate !== today) {
      achieveBtn.disabled = false;
      manualMode = false;
    } else {
      achieveBtn.disabled = true;
    }
  }
});

