let challengeLength = 14;
let markedDays = new Set();
let manualMode = false;
let tapCount = 0;
let lastMarkedDate = null;

function startChallenge(days) {
  challengeLength = days;
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("main-screen").classList.remove("hidden");

  const goalText = document.getElementById("goal-input").value.trim();
  document.getElementById("goal-text").textContent = goalText || "（目標未設定）";

  renderCalendar();
  updateButtonState();
}

function renderCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  for (let i = 0; i < challengeLength; i++) {
    const square = document.createElement("div");
    square.className = "square";

    const base = document.createElement("div");
    base.className = "base";

    const stamp = document.createElement("div");
    stamp.className = "stamp";
    stamp.style.backgroundImage = "url('img/smile.png')";

    const mask = document.createElement("div");
    mask.className = "mask";
    mask.addEventListener("click", () => handleMaskClick(i, mask, stamp));

    square.appendChild(base);
    square.appendChild(stamp);
    square.appendChild(mask);
    calendar.appendChild(square);
  }
}

function handleMaskClick(index, mask, stamp) {
  if (!manualMode) return;

  if (markedDays.has(index)) {
    // 後ろの日を消す
    [...document.querySelectorAll(".mask")].forEach((el, i) => {
      if (i > index) {
        el.classList.remove("hidden");
        markedDays.delete(i);
      }
    });
  }

  mask.classList.add("hidden");
  markedDays.add(index);
  updateSubmitButton();
  checkGlow();
}

function markToday() {
  const button = document.getElementById("complete-button");
  if (button.disabled) return;

  const todayIndex = markedDays.size;
  if (todayIndex >= challengeLength) return;

  const masks = document.querySelectorAll(".mask");
  const stamps = document.querySelectorAll(".stamp");

  const mask = masks[todayIndex];
  const stamp = stamps[todayIndex];

  if (!mask || markedDays.has(todayIndex)) return;

  mask.classList.add("hidden");
  markedDays.add(todayIndex);

  // 記録
  lastMarkedDate = new Date().toDateString();

  // 音声
  const audio = document.getElementById("success-audio");
  audio.currentTime = 0;
  audio.play();

  updateSubmitButton();
  checkGlow();

  button.disabled = true;
}

function updateSubmitButton() {
  const submitButton = document.getElementById("submit-button");
  if (markedDays.size >= challengeLength) {
    submitButton.classList.remove("disabled");
    submitButton.disabled = false;
  } else {
    submitButton.classList.add("disabled");
    submitButton.disabled = true;
  }
}

function checkGlow() {
  const stamps = document.querySelectorAll(".stamp");
  if (markedDays.size === challengeLength) {
    stamps.forEach(s => s.classList.add("glow"));
  } else {
    stamps.forEach(s => s.classList.remove("glow"));
  }
}

function updateButtonState() {
  const button = document.getElementById("complete-button");

  if (manualMode) {
    button.disabled = true;
    return;
  }

  const today = new Date().toDateString();

  if (lastMarkedDate !== today) {
    button.disabled = false;
  } else {
    button.disabled = true;
  }
}

// 0時を監視して毎日ボタンをリセット
function monitorMidnight() {
  setInterval(() => {
    updateButtonState();
  }, 1000 * 60); // 毎分チェック
}

document.addEventListener("DOMContentLoaded", () => {
  const calendar = document.getElementById("calendar");

  // 裏ワザ：7番目を5回連打でボタン活性化
  calendar.addEventListener("click", (e) => {
    const masks = document.querySelectorAll(".mask");
    masks.forEach((mask, index) => {
      if (mask.contains(e.target) && index === 6) {
        tapCount++;
        if (tapCount >= 5) {
          document.getElementById("complete-button").disabled = false;
          tapCount = 0;
        }
      }
    });
  });

  // 手動モード切替
  document.getElementById("goal-display").addEventListener("click", () => {
    manualMode = true;
    document.getElementById("complete-button").disabled = true;
  });

  monitorMidnight();
});
