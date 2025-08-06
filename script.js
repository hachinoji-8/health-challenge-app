let challengeLength = 14;
let markedDays = new Set();
let manualMode = false;
let tapCount = 0;

function startChallenge(days) {
  challengeLength = days;
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("main-screen").classList.remove("hidden");

  const goalText = document.getElementById("goal-input").value.trim();
  document.getElementById("goal-text").textContent = goalText || "（目標未設定）";

  renderCalendar();
  resetState();
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

    // 🧠 裏ワザの処理をここで設定（7番目：index 6）
    mask.addEventListener("click", () => {
      if (i === 6 && !manualMode) {
        tapCount++;
        if (tapCount >= 5) {
          document.getElementById("complete-button").disabled = false;
          tapCount = 0;
        }
      }
    });

    square.appendChild(base);
    square.appendChild(stamp);
    square.appendChild(mask);
    calendar.appendChild(square);
  }
}

function resetState() {
  markedDays.clear();
  manualMode = false;
  tapCount = 0;
  const completeButton = document.getElementById("complete-button");
  completeButton.disabled = false;
  updateSubmitButton();
}

function handleMaskClick(index, mask, stamp) {
  if (!manualMode) return;

  if (markedDays.has(index)) {
    // 後ろを消す
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
  updateGlow();
}

function markToday() {
  const button = document.getElementById("complete-button");
  if (button.disabled) return;

  const todayIndex = markedDays.size;
  if (todayIndex >= challengeLength || markedDays.has(todayIndex)) return;

  const masks = document.querySelectorAll(".mask");
  const stamps = document.querySelectorAll(".stamp");

  const mask = masks[todayIndex];
  const stamp = stamps[todayIndex];

  if (!mask) return;

  mask.classList.add("hidden");
  markedDays.add(todayIndex);

  // 成功音
  const audio = document.getElementById("success-audio");
  audio.currentTime = 0;
  audio.play();

  updateSubmitButton();
  updateGlow();

  // ✅ ボタンを非活性にする（連打防止）
  button.disabled = true;
  button.classList.add("disabled");
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

function updateGlow() {
  const stamps = document.querySelectorAll(".stamp");
  if (markedDays.size === challengeLength) {
    stamps.forEach((s) => s.classList.add("glow"));
  } else {
    stamps.forEach((s) => s.classList.remove("glow"));
  }
}

// 手動モード切替
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("goal-display").addEventListener("click", () => {
    manualMode = true;
    document.getElementById("complete-button").disabled = false;
  });
});

