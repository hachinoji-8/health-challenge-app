const goalInput = document.getElementById('goal-input');
const goalDisplay = document.getElementById('goal-display');
const startScreen = document.getElementById('start-screen');
const calendarScreen = document.getElementById('calendar-screen');
const calendar = document.getElementById('calendar');
const markTodayBtn = document.getElementById('mark-today');
const submitFormBtn = document.getElementById('submit-form');
const successSound = document.getElementById('success-sound');

const manualModeBtn = document.getElementById('manual-mode');

let challengeDays = 0;
let markedCount = 0;
let manualMode = false;
let manualModeReady = false;

// 🕶 コメント表示の術
function setupSecretCommentBox() {
  let commentBox = document.getElementById('secret-comment');
  if (!commentBox) {
    commentBox = document.createElement('div');
    commentBox.id = 'secret-comment';
    Object.assign(commentBox.style, {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '8px 16px',
      background: 'rgba(0,0,0,0.7)',
      color: '#fff',
      borderRadius: '8px',
      fontSize: '14px',
      zIndex: '9999',
      display: 'none'
    });
    document.body.appendChild(commentBox);
  }

  return function showComment(text) {
    commentBox.textContent = text;
    commentBox.style.display = 'block';
    setTimeout(() => {
      commentBox.style.display = 'none';
    }, 2000);
  };
}

// 🧙‍♂️ 隠し領域の術（ボタンに結びつけ）
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
      message: 'ドロンの術、発動！',
      action: () => {
        goalInput.value = goalDisplay.textContent;
        startScreen.classList.remove('hidden');
        calendarScreen.classList.add('hidden');
        setupChallengeButtons();
        saveProgress();
        showComment('ドロンの術、発動！');
      }
    },
    {
      element: firstDay,
      message: '復活の術、発動！',
      action: () => {
        setMarkButtonActive(true);
        showComment('復活の術、発動！');
      }
    },
    {
      element: lastDay,
      message: '手動モードの術、発動！',
      action: () => {
        manualMode = !manualMode;
        manualModeBtn.textContent = manualMode ? '🛠 手動モード：ON' : '🛠 手動モード：OFF';
        manualModeBtn.classList.toggle('active', manualMode);
        showComment(manualMode ? '手動モードON！' : '手動モード解除！');
      }
    }
  ];

  triggers.forEach(({ element, action }) => {
    let tapCount = 0;

    element.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      tapCount++;
      if (tapCount >= 10) {
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
    startScreen.classList.add('hidden');
    calendarScreen.classList.remove('hidden');
    markedCount = isNaN(savedCount) ? 0 : savedCount;
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

// 🗓 カレンダー生成＋隠し術の仕込み
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

  setupSecretTriggers(); // ← 隠し術の仕込み
}

// 🧩 カバーの更新
function updateCovers() {
  const days = document.querySelectorAll('.calendar-day');
  for (let i = 0; i < days.length; i++) {
    const existingCover = days[i].querySelector('.cover');

    if (i < markedCount) {
      if (existingCover) existingCover.remove();
    } else {
      if (!existingCover) {
        const newCover = document.createElement('div');
        newCover.classList.add('cover');
        days[i].appendChild(newCover);
      }
    }
  }
}

// ✴ 応募ボタンの状態更新
function updateSubmitButton() {
  if (markedCount >= challengeDays) {
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

// 🛠 手動モードの術（物理ボタン）
manualModeBtn.onclick = () => {
  manualMode = !manualMode;
  manualModeBtn.textContent = manualMode ? '🛠 手動モード：ON' : '🛠 手動モード：OFF';
  manualModeBtn.classList.toggle('active', manualMode);
};


// バルスの術※初期化の１行目で呼出
function checkAnnualReset() {
  const saved = new Date(localStorage.getItem('lastOpenedDate'));
  const now = new Date();
  const threshold = new Date(now.getFullYear(), 8, 15); // 9月15日

  if (saved < threshold && now >= threshold) {
    // リセット処理
    markedCount = 0;
    goalInput.value = '';
    goalDisplay.textContent = '';
    localStorage.removeItem('goalText');
    localStorage.removeItem('markedCount');
    localStorage.removeItem('challengeDays');
    startScreen.classList.remove('hidden');
    calendarScreen.classList.add('hidden');
  }
}

// 📜 初期化
window.addEventListener('DOMContentLoaded', () => {
  checkAnnualReset();
  loadProgress();
  setMarkButtonActive(isNewDay());
  setupChallengeButtons();
});
