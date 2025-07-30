
const goalInput = document.getElementById("goalInput");
const setGoalButton = document.getElementById("setGoalButton");
const goalScreen = document.getElementById("goalScreen");
const calendarScreen = document.getElementById("calendarScreen");
const userGoal = document.getElementById("userGoal");

const markButton = document.getElementById("markButton");
const submitButton14 = document.getElementById("submitButton14");
const submitButton30 = document.getElementById("submitButton30");
const grid = document.getElementById("stampGrid");
const maxDays = 30;

function createGrid() {
  for (let i = 0; i < maxDays; i++) {
    const wrapper = document.createElement("div");
    wrapper.className = "cell-wrapper";

    const base = document.createElement("div");
    base.className = "cell-base";

    const img = document.createElement("img");
    img.src = "heart.png";
    img.alt = "スタンプ";
    base.appendChild(img);

    const cover = document.createElement("div");
    cover.className = "cell-cover";
    cover.id = "cover-" + i;

    wrapper.appendChild(base);
    wrapper.appendChild(cover);
    grid.appendChild(wrapper);
  }
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getProgress() {
  return JSON.parse(localStorage.getItem("challenge-progress") || "[]");
}

function renderProgress() {
  const progress = getProgress();
  progress.forEach((_, i) => {
    const cover = document.getElementById("cover-" + i);
    if (cover) {
      cover.classList.add("removed");
    }
  });
  if (progress.length >= 14) {
    enableSubmit(submitButton14);
  }
  if (progress.length >= 30) {
    enableSubmit(submitButton30);
  }
}

function alreadyStampedToday() {
  return localStorage.getItem("last-stamped-date") === getTodayKey();
}

function updateButtonState() {
  markButton.disabled = alreadyStampedToday();
}

function markToday() {
  if (alreadyStampedToday()) return;
  let progress = getProgress();
  if (progress.length >= maxDays) return;

  const today = getTodayKey();
  progress.push(today);
  localStorage.setItem("challenge-progress", JSON.stringify(progress));
  localStorage.setItem("last-stamped-date", today);

  const cover = document.getElementById("cover-" + (progress.length - 1));
  if (cover) cover.classList.add("removed");

  updateButtonState();
  if (progress.length >= 14) {
    enableSubmit(submitButton14);
  }
  if (progress.length >= 30) {
    enableSubmit(submitButton30);
  }
}

function enableSubmit(button) {
  button.classList.remove("disabled");
  button.classList.add("enabled");
  button.removeAttribute("disabled");
}

function setGoal() {
  const goalText = goalInput.value.trim();
  if (goalText) {
    localStorage.setItem("user-goal", goalText);
    goalScreen.classList.add("hidden");
    calendarScreen.classList.remove("hidden");
    userGoal.textContent = "🌟 あなたの目標: " + goalText;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const savedGoal = localStorage.getItem("user-goal");
  if (savedGoal) {
    goalScreen.classList.add("hidden");
    calendarScreen.classList.remove("hidden");
    userGoal.textContent = "🌟 あなたの目標: " + savedGoal;
  }
  createGrid();
  renderProgress();
  updateButtonState();
  markButton.addEventListener("click", markToday);
  setGoalButton.addEventListener("click", setGoal);
});
