const stampGrid = document.querySelector(".stamp-grid");
const submitBtn = document.getElementById("submitBtn");
const sound = document.getElementById("soundEffect");
let currentMode = 30;

// 🪄 スタンプ初期生成
for (let i = 0; i < currentMode; i++) {
  const stamp = document.createElement("div");
  stamp.classList.add("stamp");
  stamp.dataset.index = i;
  stamp.addEventListener("click", () => updateProgress(i));

  if ((i + 1) % 7 === 0) {
    stamp.classList.add("highlighted");
  }

  stampGrid.appendChild(stamp);
}

// 🎬 画面遷移処理
function goToCalendar() {
  showPage("calendarPage");
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('visible'));
  document.getElementById(id).classList.add('visible');
}

// 🔘 白丸制御ロジック
function updateProgress(tappedIndex) {
  const stamps = document.querySelectorAll(".stamp");
  stamps.forEach((stamp, i) => {
    stamp.classList.remove("reached", "unreached", "glow");

    if (i < tappedIndex) {
      stamp.classList.add("reached");
    } else {
      stamp.classList.add("unreached");
    }
  });

  // 🌟 全達成判定
  if (tappedIndex === currentMode - 1) {
    stamps.forEach(s => s.classList.add("glow"));
    submitBtn.disabled = false;
    sound.play(); // 音声再生
  } else {
    submitBtn.disabled = true;
  }
}

// 📨 応募フォーム遷移
function submitChallenge() {
  const url = document.getElementById("urlInput").value;
  if (url) window.open(url, "_blank");
}
