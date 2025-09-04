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
    const covers = document.querySelectorAll('.cover');
    for (let i = 0; i < markedCount && i < covers.length; i++) {
      covers[i].remove();
    }

    if (markedCount === challengeDays) {
      submitFormBtn.classList.remove('disabled');
      submitFormBtn.classList.add('sparkle');
    }
  }
}

// 📅 日またぎ判定の術
function isNewDay() {
  const last = localStorage.getItem('lastOpenedDate');
  const today = new Date().toLocaleDateString('ja-JP');
  return last !== today;
}

// 🎯 チャレンジ開始の術
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
  createCalendar(days);
  saveProgress();
}

// 🗓 カレンダー生成の術
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

    calendar.appendChild(day);
  }
}

// 🎯 今日の達成の術
markTodayBtn.onclick = () => {
  if (!isNewDay()) {
    alert('今日はすでに達成済みでござる');
    return;
  }

  const covers = document.querySelectorAll('.cover');
  if (covers.length > 0) {
    covers[0].remove();
    markedCount++;
    successSound.play();
    saveProgress();

    if (markedCount === challengeDays) {
      submitFormBtn.classList.remove('disabled');
      submitFormBtn.classList.add('sparkle');
    }
  }
};

// ✴ 応募フォームへ ✴
submitFormBtn.onclick = () => {
  if (!submitFormBtn.classList.contains('disabled')) {
    window.open('https://docs.google.com/forms/d/1cRD9TaL2ttqSduD3FfO4jtGHO9yhNK18Xqdk21pQEW8/viewform', '_blank');
  }
};

// 📜 ページ読み込み時に記録を復元
window.addEventListener('DOMContentLoaded', loadProgress);
