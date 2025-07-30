
let clickCountTopRight = 0;
let clickCountBottomRight = 0;
let clickCountManual = 0;
let clickCountResetManual = 0;
let manualMarking = false;

const goalInputContainer = document.getElementById("goalInputContainer");
const app = document.getElementById("app");
const goalInput = document.getElementById("goalInput");
const goalText = document.getElementById("goalText");
const calendar = document.getElementById("calendar");
const markButton = document.getElementById("markButton");
const submitBtn = document.getElementById("submitBtn");

function startChallenge(days) {
  const goal = goalInput.value.trim();
  if (!goal) return alert("目標を入力してください");

  localStorage.setItem("goal", goal);
  localStorage.setItem("startDate", new Date().toDateString());
  localStorage.setItem("totalDays", days);
  localStorage.setItem("markedDays", JSON.stringify([]));

  showApp();
}

function showApp() {
  goalInputContainer.style.display = "none";
  app.style.display = "block";
  goalText.textContent = localStorage.getItem("goal");

  generateCalendar();
}

function generateCalendar() {
  calendar.innerHTML = "";
  const totalDays = parseInt(localStorage.getItem("totalDays") || "30");
  const markedDays = JSON.parse(localStorage.getItem("markedDays") || "[]");

  for (let i = 0; i < totalDays; i++) {
    const cell = document.createElement("div");
    cell.className = "day";
    if (markedDays.includes(i)) cell.classList.add("checked");

    const stamp = document.createElement("img");
    stamp.src = "heart.png";
    stamp.className = "stamp";
    stamp.style.width = "60%";
    cell.appendChild(stamp);

    cell.addEventListener("click", (e) => {
      const rect = cell.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      if (offsetX > rect.width * 0.75 && offsetY < rect.height * 0.25) {
        clickCountTopRight++;
        if (clickCountTopRight >= 15) {
          localStorage.clear();
          alert("目標をリセットしました");
          location.reload();
        }
      } else if (offsetX > rect.width * 0.75 && offsetY > rect.height * 0.75) {
        clickCountBottomRight++;
        if (clickCountBottomRight >= 15) {
          localStorage.removeItem("markedDays");
          localStorage.removeItem("startDate");
          alert("記録をリセットしました");
          location.reload();
        }
      } else if (offsetX < rect.width * 0.25 && offsetY > rect.height * 0.75) {
        clickCountManual++;
        if (clickCountManual >= 15) {
          manualMarking = true;
          alert("マニュアル記録モードになりました。マスをタップして記録できます。");
        }
      } else if (offsetX < rect.width * 0.25 && offsetY < rect.height * 0.25) {
        clickCountResetManual++;
        if (clickCountResetManual >= 15) {
          manualMarking = false;
          alert("通常モードに戻りました");
        }
      } else if (manualMarking && !cell.classList.contains("checked")) {
        cell.classList.add("checked");
        let markedDays = JSON.parse(localStorage.getItem("markedDays") || "[]");
        if (!markedDays.includes(i)) {
          markedDays.push(i);
          localStorage.setItem("markedDays", JSON.stringify(markedDays));
          generateCalendar();
        }
      }
    });

    calendar.appendChild(cell);
  }

  const markedDaysCount = JSON.parse(localStorage.getItem("markedDays") || "[]").length;
  const totalDays = parseInt(localStorage.getItem("totalDays") || "30");
  submitBtn.disabled = markedDaysCount < totalDays;
}

markButton.addEventListener("click", () => {
  const startDate = new Date(localStorage.getItem("startDate"));
  const today = new Date();
  const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  const markedDays = JSON.parse(localStorage.getItem("markedDays") || "[]");

  if (!markedDays.includes(daysSinceStart)) {
    markedDays.push(daysSinceStart);
    localStorage.setItem("markedDays", JSON.stringify(markedDays));
    generateCalendar();
  } else {
    alert("今日はすでに記録済みです");
  }
});

submitBtn.addEventListener("click", () => {
  window.open("https://www.tochigi-kenko.org", "_blank");
});

// 初期化
if (localStorage.getItem("goal")) showApp();

