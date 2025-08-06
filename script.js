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

  // すべて達成したらglow追加
  if (markedDays.size === challengeLength) {
    document.querySelectorAll(".stamp").forEach((s) => s.classList.add("glow"));
  } else {
    document.querySelectorAll(".stamp").forEach((s) => s.classList.remove("glow"));
  }
}

function canMarkToday() {
  const todayIndex = markedDays.size;
  if (manualMode) return false;
  return todayIndex < challengeLength && !markedDays.has(todayIndex);
}

function markToday() {
  const button = document.getElementById("complete-button");
  if (button.disabled) return; // ボタンが非活性なら何もしない

  const todayIndex = markedDays.size;

  if (todayIndex >= challengeLength) return;

  const masks = document.querySelectorAll(".mask");
  const stamps = document.querySelectorAll(".stamp");

  const mask = masks[todayIndex];
  const stamp = stamps[todayIndex];

  if (!mask || markedDays.has(todayIndex)) return;

  mask.classList.add("hidden");
  markedDays.add(todayIndex);

  // 成功音
  const audio = document.getElementById("success-audio");
  audio.currentTime = 0;
  audio.play();

  updateSubmitButton();

  if (markedDays.size === challengeLength) {
    stamps.forEach((s) => s.classList.add("glow"));
  }
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

document.addEventListener("DOMContentLoaded", () => {
  const calendar = document.getElementById("calendar");

  calendar.addEventListener("click", (e) => {
    const masks = document.querySelectorAll(".mask");
    masks.forEach((mask, index) => {
      if (mask.contains(e.target)) {
        if (index === 6) {
          tapCount++;
          if (tapCount >= 5) {
            document.getElementById("complete-button").disabled = false;
            tapCount = 0;
          }
        }
      }
    });
  });

  document.getElementById("goal-display").addEventListener("click", () => {
    manualMode = true;
    document.getElementById("complete-button").disabled = false;
  });
});

