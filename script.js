const goalInput = document.getElementById('goal-input');
const goalDisplay = document.getElementById('goal-display');
const startScreen = document.getElementById('start-screen');
const calendarScreen = document.getElementById('calendar-screen');
const calendar = document.getElementById('calendar');
const markTodayBtn = document.getElementById('mark-today');
const submitFormBtn = document.getElementById('submit-form');
const successSound = document.getElementById('success-sound');

const reviveBtn = document.getElementById('revive-today');
const manualModeBtn = document.getElementById('manual-mode');
const disappearBtn = document.getElementById('disappear');

let challengeDays = 0;
let markedCount = 0;
let manualMode = false;
let manualModeReady = false;

// 🕶 コメント表示用の術
function setupSecretCommentBox() {
  const commentBox = document.createElement('div');
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

  return function showComment(text) {
    commentBox.textContent = text;
    commentBox.style.display = 'block';
    setTimeout(() => {
      commentBox.style.display = 'none';
    }, 2000);
  };
}

// 🧙‍♂️ 隠し領域の術の仕込み
function setupSecretTriggers() {
  const showComment = setupSecretCommentBox();

  const calendarDays = document.querySelectorAll('.calendar-day');
  const goalEl = document.getElementById('goal-display');
  const firstDay = calendarDays[0];
  const lastDay = calendarDays[calendarDays.length - 1];

  console.log('🔍 隠し領域の術：初期化開始');
  console.log('📌 calendarDays:', calendarDays.length);
  console.log('📌 goal-display:', !!goalEl);
  console.log('📌 firstDay:', !!firstDay);
  console.log('📌 lastDay:', !!lastDay);

  if (!goalEl || !firstDay || !lastDay) {
    console.warn('⚠️ 隠し領域のいずれかが見つかりませぬ');
    return;
  }

  const triggers = [
    {
      name: 'リセットの術',
      element: goalEl,
      action: () => {
        localStorage.clear();
        showComment('リセットの術、発動！');
        console.log('✅ リセットの術、発動');
      }
    },
    {
      name: '復活の術',
      element: firstDay,
      action: () => {
        setMarkButtonActive(true);
        showComment('復活の術、発動！');
        console.log('✅ 復活の術、発動');
      }
    },
    {
      name: '手動モードの術',
      element: lastDay,
      action: () => {
        if (!manualModeReady) {
          console.warn('⚠️ 手動モードの術はまだ仕込まれておりませぬ');
          return;
        }
        manualMode = !manualMode;
        manualModeBtn.textContent = manualMode ? '🛠 手動モード：ON' : '🛠 手動モード：OFF';
        manualModeBtn.classList.toggle('active', manualMode);
        showComment('手動モードの術、発動！');
        console.log('✅ 手動モードの術、発動');
      }
    }
  ];

  triggers.forEach(({ name, element, action }) => {
    let tapCount = 0;

    element.addEventListener('click', (e) => {
      e.stopPropagation();
      tapCount++;
      console.log(`🌀 ${name} タップ数: ${tapCount}`);
      if (tapCount >= 10) {
        console.log(`✨ ${name} 発動条件達成`);
        action();
        tapCount = 0;
      }
    });

    document.body.addEventListener('click', (e) => {
      if (!element.contains(e.target)) {
        if (tapCount > 0) {
          console.log(`🔄 ${name} カウントリセット`);
        }
        tapCount = 0;
      }
    });
  });

  console.log('✅ 隠し領域の術：仕込み完了');
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

  setupSecretTriggers(); // ← ここで隠し術を仕込む
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

// 🔁 今日のチャレンジ復活の術（物理ボタン）
reviveBtn.onclick = () => {
  setMarkButtonActive(true);
  alert('本日分の達成ボタンが復活いたしましたぞ');
};

// 🛠 手動モードの術（物理ボタン）
manualModeBtn.onclick = () => {
  manualMode = !manualMode;
  manualModeBtn.textContent = manualMode ? '🛠 手動モード：ON' : '🛠 手動モード：OFF';
  manualModeBtn.classList.toggle('active', manualMode);
};

// 🕶 ドロンの術（物理ボタン）
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
     
