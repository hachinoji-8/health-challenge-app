const calendarSize = 35;
let record = [];
let manualMode = false;

const completeButton = document.querySelector('.complete-button');
const manualToggle = document.querySelector('.manual-toggle');
const stampContainer = document.querySelector('.stamp-container');
const linkButton = document.querySelector('.link-button');
const sound = new Audio('success.mp3');

// 初期化
generateCalendar();
updateCalendarUI();
updateCompleteButtonState();

completeButton.addEventListener('click', () => {
  if (canMarkToday()) {
    markToday();
  }
});

manualToggle.addEventListener('click', () => {
  manualMode = !manualMode;
  manualToggle.classList.toggle('active', manualMode);
});

function getTodayIndex() {
  const today = new Date();
  return today.getDate() % calendarSize;
}

function canMarkToday() {
  const todayIndex = getTodayIndex();
  return !record.includes(todayIndex);
}

function markToday() {
  const todayIndex = getTodayIndex();
  record.push(todayIndex);
  updateCalendarUI();
  playSuccessSound();
  updateCompleteButtonState();
  checkLinkAvailability();
}

function playSuccessSound() {
  sound.currentTime = 0;
  sound.play();
}

function updateCompleteButtonState() {
  completeButton.disabled = !canMarkToday();
}

function generateCalendar() {
  stampContainer.innerHTML = '';

  for (let i = 0; i < calendarSize; i++) {
    const circle = document.createElement('div');
    circle.className = 'base-circle';
    circle.dataset.index = i;

    const stamp = document.createElement('img');
    stamp.className = 'stamp';
    stamp.src = i % 7 === 0 ? 'smile.png' : 'heart.png';
    stamp.style.opacity = '0.2';

    const mask = document.createElement('div');
    mask.className = 'mask';

    circle.appendChild(stamp);
    circle.appendChild(mask);
    stampContainer.appendChild(circle);

    circle.addEventListener('click', () => {
      if (manualMode) {
        handleManualStamp(i);
      }
    });
  }
}

function updateCalendarUI() {
  const circles = document.querySelectorAll('.base-circle');

  circles.forEach((circle, i) => {
    const stamp = circle.querySelector('.stamp');
    const mask = circle.querySelector('.mask');
    if (record.includes(i)) {
      stamp.style.opacity = '1';
      mask.style.display = 'none';
    } else {
      stamp.style.opacity = '0.2';
      mask.style.display = 'block';
    }
  });
}

function handleManualStamp(index) {
  const newRecord = [];
  for (let i = 0; i < calendarSize; i++) {
    if (i <= index) {
      newRecord.push(i);
    }
  }
  record = newRecord;
  updateCalendarUI();
  checkLinkAvailability();
}

function checkLinkAvailability() {
  const required = [0,1,2,3,4];
  const complete = required.every(i => record.includes(i));
  linkButton.disabled = !complete;
}
