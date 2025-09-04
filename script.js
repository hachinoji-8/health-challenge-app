const goalInput = document.getElementById('goal-input');
const goalDisplay = document.getElementById('goal-display');
const startScreen = document.getElementById('start-screen');
const calendarScreen = document.getElementById('calendar-screen');
const calendar = document.getElementById('calendar');
const markTodayBtn = document.getElementById('mark-today');
const submitFormBtn = document.getElementById('submit-form');
const successSound = document.getElementById('success-sound');

let challengeDays = 0;
let markedCount = 0;
let manualMode = false;
let manualModeReady = false;

// 🕶 コメント表示の術
function setupSecretCommentBox() {
  let commentBox = document.getElementById('secret-comment');
  return function showComment(text) {
    commentBox.textContent = text;
    commentBox.style.display = 'block';
    setTimeout(() => {
      commentBox.style.display = 'none';
    }, 2000);
  };
}

// 🧙‍♂️ 隠し領域の術（機能割り付け）
function setupSecretTriggers() {
  const showComment = setupSecretCommentBox();
  const calendarDays = document.querySelectorAll('.calendar-day');
  const goalEl = document.getElementById('goal-display');
  const firstDay = calendarDays[0];
  const lastDay = calendarDays[calendarDays.length - 1];
  if (!goalEl || !firstDay || !lastDay) return;

  const triggers = [
    {
      element: goalEl,
      message: 'リセットの術、発動！',
      action: () => {
        markedCount = 0;
        updateCovers();
        updateSubmitButton();
        saveProgress();
      }
    },
    {
      element: firstDay,
      message: '復活の術、発動！',
      action: () => {
        setMarkButtonActive(true);
      }
    },
    {
      element: lastDay,
      message: '手動モードの術、発動！',
      action: () => {
        manualMode = !manualMode;
        showComment(manualMode ? '手動モード：ON' : '手動モード：OFF');
      }
    }
  ];

  triggers.forEach(({ element, message, action }) => {
    let tapCount = 0;
    element.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      tapCount++;
      if (tapCount >= 10) {
        showComment(message);
        if (typeof action === 'function') action();
        tapCount = 0;
      }
    });
    document.body.addEventListener('pointerdown', (e) => {
      if (!element.contains(e.target)) {
        tapCount = 0;
      }
    });
  });
}

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
    markedCount = isNaN(savedCount) ? 0 : savedCount;
    startScreen.classList.add('hidden');
    calendarScreen.classList.remove('hidden');
    createCalendar(challengeDays);
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
  challengeDays = days;
  goalDisplay.textContent = goal;
  startScreen.classList.add('hidden');
  calendarScreen.classList.remove('hidden');
  createCalendar(challengeDays);
  updateCovers();
  updateSubmitButton();
  saveProgress();
  setMarkButtonActive(isNewDay());
}

// 🗓 カレンダー生成
function createCalendar(days) {
  calendar.innerHTML = '';
  manualModeReady = true;
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

    day.onclick = () => {
      if (!manualMode) return;
      markedCount = i + 1;
      updateCovers();
      updateSubmitButton();
      saveProgress();
    };

    calendar.appendChild(day);
  }

  setupSecretTriggers(); // 隠し術の仕込み
}

window.addEventListener('DOMContentLoaded', () => {
  loadProgress();
  setMarkButtonActive(isNewDay());
  setupChallengeButtons();
});
