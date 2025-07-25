const grid = document.getElementById("stampGrid");
const markButton = document.getElementById("markButton");
const submitButton = document.getElementById("submitButton");
const maxDays = 30;

function createGrid() {
  for (let i = 0; i < maxDays; i++) {
    const wrapper = document.createElement("div");
    wrapper.className = "cell-wrapper";

    const base = document.createElement("div");
    base.className = "cell-base";

    const img = document.createElement("img");
    img.src = "heart.png";  // 差し替え可能
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
  const d = new Date();
  return d.toISOString().split("T")[0];
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
  if (progress.length >= maxDays) {
    enableSubmit();
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
  if (progress.length >= maxDays) {
    enableSubmit();
  }
}

function enableSubmit() {
  submitButton.classList.add("enabled");
  submitButton.removeAttribute("disabled");
}

createGrid();
renderProgress();
updateButtonState();
markButton.addEventListener("click", markToday);
