const goalInput = document.getElementById('goal-input');
const goalDisplay = document.getElementById('goal-display');
const startScreen = document.getElementById('start-screen');
const calendarScreen = document.getElementById('calendar-screen');
const calendar = document.getElementById('calendar');
const markTodayBtn = document.getElementById('mark-today');
const submitFormBtn = document.getElementById('submit-form');
const successSound = document.getElementById('success-sound');

// 🧪 テスト用ボタン
const reviveBtn = document.getElementById('revive-today');
const manualModeBtn = document.getElementById('manual-mode');
const disappearBtn = document.getElementById('disappear');

let challengeDays = 0;
let markedCount = 0;
let manualMode = false; // 🛠 手動モードの状態

// 🏮 記録の術：保存
function saveProgress() {
  localStorage.setItem('markedCount', markedCount);
  localStorage.setItem('lastOpenedDate', new Date().toLocaleDateString('ja-JP'));
  localStorage.setItem('goalText', goalDisplay.textContent);
  localStorage.setItem('challengeDays', challengeDays);
}

// 📜 記録の術：復元
function loadProgress() {
  const savedGoal = localStorage.getItem('goalText');
  const savedCount = parseInt(localStorage.getItem('markedCount'), 10);
  const savedDays = parseInt(localStorage.getItem('challengeDays'), 10);

  if (savedGoal && !isNaN(savedDays)) {
    goalDisplay.textContent = savedGoal;
    goalInput.value = savedGoal;
    challengeDays = savedDays;
    startScreen.classList.add('hidden');
    calendarScreen.classList.remove('hidden');
    createCalendar(challengeDays);

    markedCount = isNaN(savedCount) ? 0 : savedCount;
    updateCovers();
    updateSubmitButton();
  }
}

// 📅 日またぎ判定
function isNewDay() {
  const last = localStorage.getItem('lastOpenedDate');
  const today = new Date().toLocaleDateString('ja-JP');
  return last !== today;
}

// 🎯 ボタンの状態制御
function setMarkButtonActive(active) {
  markTodayBtn.classList.toggle('disabled', !active);
  markTodayBtn.disabled = !active;
}

// 🗡 チャレンジボタンの仕込み
function setupChallengeButtons() {
  document.getElementById('start-14').onclick = () => startChallenge(14);
  document.getElementById('start-30').onclick = () => startChallenge(30);
}

// 🎯 チャレンジ開始
function startChallenge(days) {
  const goal = goalInput.value.trim();
  if (goal.length === 0 || goal.length > 20) {
    alert('20字以内で入力してね');
    goalInput.value = '';
    return;
  }

  if (days === 14 && challengeDays === 30 && markedCount >= 14) {
    challengeDays = 14;
    markedCount = 14;
  } else {
    challengeDays = days;
  }

  goalDisplay.textContent = goal;
  startScreen.classList.add('hidden');
  calendarScreen.classList.remove('hidden');
  createCalendar(challengeDays);
  updateCovers();
  updateSubmitButton();
  saveProgress();
  setMarkButtonActive(isNewDay());
}

// 🗓 カレンダー生成＋手動モードの術
function createCalendar(days) {
  calendar.innerHTML = '';
  for (let i = 0; i < days; i++) {
    const day = document.createElement('div');
    day.classList.add('calendar-day');

    const base = document.createElement('div');
    base.classList.add('circle-base');
    day.appendChild(base);

    const stamp = document.createElement('img');
    stamp.classList.add('stamp');
    stamp.src = (i + 1) % 7 === 0 ? 'img/smile.png' : 'img/heart.png';
    day.appendChild(stamp);

    const cover = document.createElement('div');
    cover.classList.add('cover');
    day.appendChild(cover);

    // 🛠 手動モードの術：クリックで調整
    day.onclick = () => {
      if (!manualMode) return;
      markedCount = i + 1;
      updateCovers();
      updateSubmitButton();
      saveProgress();
    };

    calendar.appendChild(day);
  }
}

// 🧩 カバーの更新
function updateCovers() {
  const covers = document.querySelectorAll('.calendar-day');
  for (let i = 0; i < covers.length; i++) {
    const cover = covers[i].querySelector('.cover');
    if (i < markedCount) {
      if (cover) cover.remove();
    } else {
      if (!cover) {
        const newCover = document.createElement('div');
        newCover.classList.add('cover');
        covers[i].appendChild(newCover);
      }
    }
  }
}

// ✴ 応募ボタンの状態更新
function updateSubmitButton() {
  if (markedCount === challengeDays) {
    submitFormBtn.classList.remove('disabled');
    submitFormBtn.classList.add('sparkle');
  } else {
    submitFormBtn.classList.add('disabled');
    submitFormBtn.classList.remove('sparkle');
  }
}

// 🎯 今日の達成
markTodayBtn.onclick = () => {
  if (markTodayBtn.disabled || manualMode) return;

  const covers = document.querySelectorAll('.cover');
  if (covers.length > 0) {
    covers[0].remove();
    markedCount++;
    successSound.play();
    saveProgress();
    setMarkButtonActive(false);
    updateSubmitButton();
  }
};

// ✴ 応募フォームへ ✴
submitFormBtn.onclick = () => {
  if (!submitFormBtn.classList.contains('disabled')) {
    window.open('https://docs.google.com/forms/d/1cRD9TaL2ttqSduD3FfO4jtGHO9yhNK18Xqdk21pQEW8/viewform', '_blank');
  }
};

// 🔁 今日のチャレンジ復活の術
reviveBtn.onclick = () => {
  setMarkButtonActive(true);
  alert('本日分の達成ボタンが復活いたしましたぞ');
};

// 🛠 手動モードの術（トグル式）
manualModeBtn.onclick = () => {
  manualMode = !manualMode;
  manualModeBtn.textContent = manualMode ? '🛠 手動モード：ON' : '🛠 手動モード：OFF';
  manualModeBtn.classList.toggle('active', manualMode);
};

// 🕶 ドロンの術
disappearBtn.onclick = () => {
  goalInput.value = goalDisplay.textContent;
  startScreen.classList.remove('hidden');
  calendarScreen.classList.add('hidden');
  setupChallengeButtons();
  saveProgress();
};

// 📜 初期化
window.addEventListener('DOMContentLoaded', () => {
  loadProgress();
  setMarkButtonActive(isNewDay());
  setupChallengeButtons();
});
