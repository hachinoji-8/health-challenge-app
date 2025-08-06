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
body {
  font-family: sans-serif;
  background-image: url("img/background.jpg");
  background-size: cover;
  margin: 0;
  padding: 0;
  text-align: center;
  color: #333;
}

function canMarkToday() {
  const todayIndex = getTodayIndex();
  return !record.includes(todayIndex);
#calendar-container {
  padding: 20px;
}

function markToday() {
  const todayIndex = getTodayIndex();
  record.push(todayIndex);
  updateCalendarUI();
  playSuccessSound();
  updateCompleteButtonState();
  checkLinkAvailability();
.buttons {
  margin-bottom: 20px;
}

function playSuccessSound() {
  sound.currentTime = 0;
  sound.play();
button {
  padding: 10px 20px;
  margin: 5px;
  font-size: 16px;
  cursor: pointer;
}

function updateCompleteButtonState() {
  completeButton.disabled = !canMarkToday();
#calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  margin: 20px auto;
  max-width: 500px;
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
.dot {
  width: 50px;
  height: 50px;
  background-color: white;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
}

    const mask = document.createElement('div');
    mask.className = 'mask';
.smile {
  background-image: url("img/smile.png");
  background-size: cover;
}

    circle.appendChild(stamp);
    circle.appendChild(mask);
    stampContainer.appendChild(circle);
.cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  transition: opacity 0.3s;
}

    circle.addEventListener('click', () => {
      if (manualMode) {
        handleManualStamp(i);
      }
    });
  }
.cover.open {
  opacity: 0;
  pointer-events: none;
}

function updateCalendarUI() {
  const circles = document.querySelectorAll('.base-circle');
#stamp {
  margin-top: 30px;
}

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
#stamp img {
  width: 100px;
  animation: blink 1s infinite;
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
.hidden {
  display: none;
}

function checkLinkAvailability() {
  const required = [0,1,2,3,4];
  const complete = required.every(i => record.includes(i));
  linkButton.disabled = !complete;
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
