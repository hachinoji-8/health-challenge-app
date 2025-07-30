document.addEventListener("DOMContentLoaded", () => {
  const goalInput = document.getElementById("goal-input");
  const start14Btn = document.getElementById("start-14-btn");
  const start30Btn = document.getElementById("start-30-btn");
  const goalDisplay = document.getElementById("goal-display");
  const calendar = document.getElementById("calendar");
  const markButton = document.getElementById("mark-button");
  const submitBtn = document.getElementById("submit-btn");
  const startScreen = document.getElementById("start-screen");
  const mainScreen = document.getElementById("main-screen");

  let markedDays = JSON.parse(localStorage.getItem("markedDays")) || [];
  let totalDays = parseInt(localStorage.getItem("totalDays")) || 30;
  let goal = localStorage.getItem("goal") || "";
  let startDate = localStorage.getItem("startDate");

  const renderGoal = () => {
    if (goal) {
      goalDisplay.innerHTML = `<div class="goal-title">🌟 あなたの目標 🌟</div><div class="goal-text">${goal}</div>`;
    }
  };

  const renderCalendar = () => {
    calendar.innerHTML = "";
    for (let i = 1; i <= totalDays; i++) {
      const cell = document.createElement("div");
      cell.className = "calendar-cell";
      const stamp = document.createElement("div");
      stamp.className = "stamp";
      const cover = document.createElement("div");
      cover.className = "cover";
      if (markedDays.includes(i)) {
        cover.style.display = "none";
      }
      cell.appendChild(stamp);
      cell.appendChild(cover);
      calendar.appendChild(cell);
    }
  };

  const updateStorage = () => {
    localStorage.setItem("markedDays", JSON.stringify(markedDays));
  };

  const canMarkToday = () => {
    const today = new Date().toDateString();
    if (!startDate) {
      localStorage.setItem("startDate", today);
      return true;
    }
    const lastMarked = localStorage.getItem("lastMarked") || "";
    return today !== lastMarked;
  };

  const markToday = () => {
    const today = new Date().toDateString();
    const next = markedDays.length + 1;
    if (next <= totalDays) {
      markedDays.push(next);
      updateStorage();
      localStorage.setItem("lastMarked", today);
      renderCalendar();
      if (markedDays.length >= totalDays) {
        submitBtn.disabled = false;
      }
    }
  };

  markButton.addEventListener("click", () => {
    if (canMarkToday()) {
      markToday();
    } else {
      alert("今日はすでに達成済みです！");
    }
  });

  start14Btn.addEventListener("click", () => {
    const inputGoal = goalInput.value.trim();
    if (inputGoal) {
      goal = inputGoal;
      totalDays = 14;
      localStorage.setItem("goal", goal);
      localStorage.setItem("totalDays", totalDays);
      localStorage.setItem("markedDays", JSON.stringify([]));
      localStorage.removeItem("lastMarked");
      localStorage.removeItem("startDate");
      startScreen.style.display = "none";
      mainScreen.style.display = "block";
      renderGoal();
      renderCalendar();
    }
  });

  start30Btn.addEventListener("click", () => {
    const inputGoal = goalInput.value.trim();
    if (inputGoal) {
      goal = inputGoal;
      totalDays = 30;
      localStorage.setItem("goal", goal);
      localStorage.setItem("totalDays", totalDays);
      localStorage.setItem("markedDays", JSON.stringify([]));
      localStorage.removeItem("lastMarked");
      localStorage.removeItem("startDate");
      startScreen.style.display = "none";
      mainScreen.style.display = "block";
      renderGoal();
      renderCalendar();
    }
  });

  if (goal) {
    startScreen.style.display = "none";
    mainScreen.style.display = "block";
    renderGoal();
    renderCalendar();
  }
});

