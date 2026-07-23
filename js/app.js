/* ==========================================================================
   MAIN APPLICATION COORDINATOR (Number Jungle App Engine)
   ========================================================================== */

(function () {
  "use strict";

  // Encouraging Praise Messages (Over 100 variations)
  const PRAISE_MESSAGES = [
    "🎉 Fantastic Job!", "🌟 You're a Math Hero!", "👏 Super Smart!", "🍌 Yummy, Correct!",
    "🚀 Outstanding!", "🏆 Brilliant Thinking!", "🌈 Rainbow Explorer!", "🔥 Streak Master!",
    "⭐ Math Superstar!", "🎈 Woohoo, You Got It!", "🎉 Amazing Work!", "✨ Pure Genius!",
    "💪 Unstoppable!", "🦁 Roaring Success!", "🦄 Magic Answer!", "🦖 Dino Power!"
  ];

  const ENCOURAGE_MESSAGES = [
    "Almost there! Try again!", "Keep going, you can do it!", "Nice try! Give it another go!",
    "Don't give up, Math Hero!", "You're getting closer!"
  ];

  // Game Setup Config
  const gameConfig = {
    opMode: 'both',
    blankMode: 'mix',
    maxNum: 10,
    count: 10,
    playMode: 'practice' // 'practice' | 'timed'
  };

  // State
  let questions = [];
  let currentIndex = 0;
  let score = { correct: 0, wrong: 0 };
  let autoNextTimeout = null;
  let timerInterval = null;
  let timeLeft = 0;

  // DOM Elements
  const welcomeScreen = document.getElementById('welcomeScreen');
  const avatarScreen = document.getElementById('avatarScreen');
  const setupScreen = document.getElementById('setupScreen');
  const quizScreen = document.getElementById('quizScreen');
  const summaryScreen = document.getElementById('summaryScreen');

  const startWelcomeBtn = document.getElementById('startWelcomeBtn');
  const avatarGrid = document.getElementById('avatarGrid');
  const saveAvatarBtn = document.getElementById('saveAvatarBtn');
  const startGameBtn = document.getElementById('startGameBtn');

  const mainBuddyStage = document.getElementById('mainBuddyStage');
  const topBuddyEmoji = document.getElementById('topBuddyEmoji');
  const muteBtn = document.getElementById('muteBtn');
  const readSpeechBtn = document.getElementById('readSpeechBtn');

  const scoreCorrectEl = document.getElementById('scoreCorrect');
  const scoreWrongEl = document.getElementById('scoreWrong');
  const streakCountEl = document.getElementById('streakCount');

  const pathNodesEl = document.getElementById('pathNodes');
  const pathBuddyRig = document.getElementById('pathBuddyRig');
  const pathBuddyEmoji = document.getElementById('pathBuddyEmoji');
  const pathSpeechBubble = document.getElementById('pathSpeechBubble');

  const progressLabel = document.getElementById('progressLabel');
  const timerPill = document.getElementById('timerPill');
  const timerVal = document.getElementById('timerVal');

  const slotA = document.getElementById('slotA');
  const eqOp = document.getElementById('eqOp');
  const slotB = document.getElementById('slotB');
  const slotC = document.getElementById('slotC');
  const optionsGrid = document.getElementById('optionsGrid');
  const feedbackBanner = document.getElementById('feedbackBanner');

  const playAgainBtn = document.getElementById('playAgainBtn');
  const changeSettingsBtn = document.getElementById('changeSettingsBtn');
  const goHomeBtn = document.getElementById('goHomeBtn');

  const sumCorrect = document.getElementById('sumCorrect');
  const sumWrong = document.getElementById('sumWrong');
  const sumAccuracy = document.getElementById('sumAccuracy');
  const sumStreak = document.getElementById('sumStreak');
  const summaryTitle = document.getElementById('summaryTitle');

  function init() {
    bindEvents();
    renderAvatarGrid();
    updateBuddyDisplays();
    updateScoreboard();
    initLiveTracker();
  }

  function bindEvents() {
    document.addEventListener('pointerdown', function initAudioGesture() {
      if (SoundEngine) {
        SoundEngine.getAudioCtx();
        SoundEngine.startMusic();
      }
      document.removeEventListener('pointerdown', initAudioGesture);
    }, { once: true });

    startWelcomeBtn.addEventListener('click', () => {
      SoundEngine.startMusic();
      showScreen(avatarScreen);
    });

    saveAvatarBtn.addEventListener('click', () => {
      showScreen(setupScreen);
    });

    startGameBtn.addEventListener('click', () => {
      SoundEngine.startMusic();
      startNewGame();
    });

    muteBtn.addEventListener('click', () => {
      const active = SoundEngine.toggleSound();
      muteBtn.textContent = active ? '🔊' : '🔇';
    });

    readSpeechBtn.addEventListener('click', () => {
      const q = questions[currentIndex];
      if (q) {
        const text = `${q.a} ${q.op === '−' ? 'minus' : (q.op === '×' ? 'times' : (q.op === '÷' ? 'divided by' : 'plus'))} ${q.b} equals ${q.c}`;
        SoundEngine.speakText(text);
      }
    });

    playAgainBtn.addEventListener('click', startNewGame);
    changeSettingsBtn.addEventListener('click', () => showScreen(setupScreen));
    goHomeBtn.addEventListener('click', () => showScreen(welcomeScreen));

    // Setup chip handlers
    document.querySelectorAll('.chip-group').forEach(group => {
      group.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip-btn');
        if (!btn) return;
        group.querySelectorAll('.chip-btn').forEach(c => c.classList.remove('selected'));
        btn.classList.add('selected');

        const key = group.dataset.group;
        const value = btn.dataset.value;
        gameConfig[key] = (key === 'maxNum' || key === 'count') ? parseInt(value, 10) : value;
      });
    });
  }

  function showScreen(screenEl) {
    [welcomeScreen, avatarScreen, setupScreen, quizScreen, summaryScreen].forEach(s => {
      s.classList.add('hidden');
    });
    screenEl.classList.remove('hidden');
  }

  function renderAvatarGrid() {
    avatarGrid.innerHTML = '';
    const avatars = AvatarManager.getAvatars();
    const current = AvatarManager.getSelected();

    avatars.forEach(av => {
      const card = document.createElement('div');
      card.className = `avatar-card ${av.id === current.id ? 'selected' : ''}`;
      card.innerHTML = `
        <span class="avatar-emoji">${av.emoji}</span>
        <span class="avatar-name">${av.name}</span>
      `;
      card.addEventListener('click', () => {
        avatarGrid.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        AvatarManager.setSelectById(av.id);
        StorageEngine.setAvatar(av.id);
        updateBuddyDisplays();
      });
      avatarGrid.appendChild(card);
    });
  }

  const liveTrackerText = document.getElementById('liveTrackerText');

  function initLiveTracker() {
    if (window.PresenceEngine) {
      PresenceEngine.init((displayText) => {
        if (liveTrackerText) {
          liveTrackerText.textContent = displayText;
        }
      });
    }
  }

  function updateLiveTracker() {
    if (window.PresenceEngine) {
      PresenceEngine.sendHeartbeat();
    }
  }

  function updateBuddyDisplays() {
    const selected = AvatarManager.getSelected();
    if (mainBuddyStage) mainBuddyStage.textContent = selected.emoji;
    if (topBuddyEmoji) topBuddyEmoji.textContent = selected.emoji;
    if (pathBuddyEmoji) pathBuddyEmoji.textContent = selected.emoji;
    updateLiveTracker();
  }

  function updateScoreboard() {
    const st = StorageEngine.getState();
    scoreCorrectEl.textContent = score.correct;
    scoreWrongEl.textContent = score.wrong;
    streakCountEl.textContent = st.currentStreak;
  }

  function startNewGame() {
    questions = MathEngine.generateQuizSet(gameConfig, gameConfig.count);
    currentIndex = 0;
    score = { correct: 0, wrong: 0 };

    buildJunglePath();
    renderQuestion();
    showScreen(quizScreen);
    updateScoreboard();

    if (gameConfig.playMode === 'timed') {
      timerPill.style.display = 'flex';
      startTimer();
    } else {
      timerPill.style.display = 'none';
    }
  }

  function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 15;
    timerVal.textContent = timeLeft;
    timerInterval = setInterval(() => {
      timeLeft--;
      timerVal.textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        handleTimeOut();
      }
    }, 1000);
  }

  function handleTimeOut() {
    SoundEngine.playWrong();
    autoNextQuestion();
  }

  function buildJunglePath() {
    pathNodesEl.innerHTML = '';
    for (let i = 0; i < gameConfig.count; i++) {
      const node = document.createElement('div');
      node.className = 'path-node';
      node.textContent = '🍃';
      pathNodesEl.appendChild(node);
    }
  }

  function updateJunglePath() {
    const nodes = pathNodesEl.children;
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].className = 'path-node';
      if (i === currentIndex) nodes[i].classList.add('current');
      if (questions[i].solved) {
        nodes[i].classList.add('solved');
        nodes[i].textContent = '⭐';
      } else {
        nodes[i].textContent = '🍃';
      }
    }

    // Move Buddy Rig smoothly along path
    const pct = (currentIndex + 0.5) / gameConfig.count;
    pathBuddyRig.style.left = `${pct * 100}%`;
  }

  function setSlot(el, value, isBlank, solved) {
    el.className = 'eq-slot';
    if (isBlank) {
      el.classList.add('blank');
      if (solved) el.classList.add('solved');
      el.textContent = solved ? value : '?';
    } else {
      el.textContent = value;
    }
  }

  function renderQuestion() {
    const q = questions[currentIndex];
    eqOp.textContent = q.op;

    setSlot(slotA, q.a, q.maskPos === 'a', q.solved);
    setSlot(slotB, q.b, q.maskPos === 'b', q.solved);
    setSlot(slotC, q.c, q.maskPos === 'c', q.solved);

    optionsGrid.innerHTML = '';
    q.options.forEach(val => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = val;
      btn.setAttribute('aria-label', `Answer option ${val}`);

      if (q.solved) {
        btn.disabled = true;
        if (val === q.answer) btn.classList.add('correct');
        else if (q.wrongTries.has(val)) btn.classList.add('wrong');
      } else if (q.wrongTries.has(val)) {
        btn.disabled = true;
        btn.classList.add('wrong');
      } else {
        btn.addEventListener('click', () => handleOptionClick(val, btn));
      }
      optionsGrid.appendChild(btn);
    });

    feedbackBanner.textContent = q.solved ? getRandomMsg(PRAISE_MESSAGES) : '';
    progressLabel.textContent = `Question ${currentIndex + 1} of ${gameConfig.count}`;

    updateJunglePath();
    updateScoreboard();

    if (gameConfig.playMode === 'timed' && !q.solved) {
      startTimer();
    }
  }

  function getRandomMsg(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function showBuddySpeech(text) {
    pathSpeechBubble.textContent = text;
    pathSpeechBubble.classList.add('show');
    setTimeout(() => {
      pathSpeechBubble.classList.remove('show');
    }, 2000);
  }

  function handleOptionClick(val, btn) {
    const q = questions[currentIndex];
    if (q.solved) return;

    if (q.firstAttempt === undefined) {
      q.firstAttempt = (val === q.answer);
      if (q.firstAttempt) score.correct++;
      else score.wrong++;
    }

    if (val === q.answer) {
      q.solved = true;
      btn.classList.add('correct');

      // Disable all option buttons
      optionsGrid.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

      // Record answer state & check streaks
      const state = StorageEngine.recordAnswer(true);
      updateScoreboard();

      // Audio & Particle FX
      SoundEngine.playCorrect();
      EffectsEngine.spawnSparkles(btn.offsetLeft + btn.offsetWidth / 2, btn.offsetTop + btn.offsetHeight / 2, 35);

      const msg = getRandomMsg(PRAISE_MESSAGES);
      feedbackBanner.textContent = msg;
      showBuddySpeech("Woohoo! 🎉");

      // Check for 3-streak surprise celebration reward!
      if (state.currentStreak > 0 && state.currentStreak % 3 === 0) {
        CelebrationEngine.triggerSurprise(() => {
          autoNextQuestion();
        });
      } else {
        autoNextQuestion();
      }

    } else {
      q.wrongTries.add(val);
      btn.classList.add('wrong');
      btn.disabled = true;

      StorageEngine.recordAnswer(false);
      updateScoreboard();

      SoundEngine.playWrong();
      feedbackBanner.textContent = getRandomMsg(ENCOURAGE_MESSAGES);
      showBuddySpeech("Oops! Try again 😅");
    }
  }

  function autoNextQuestion() {
    if (autoNextTimeout) clearTimeout(autoNextTimeout);
    autoNextTimeout = setTimeout(() => {
      if (currentIndex < gameConfig.count - 1) {
        currentIndex++;
        renderQuestion();
      } else {
        finishGame();
      }
    }, 1600); // 1.6 second automatic next transition
  }

  function finishGame() {
    clearInterval(timerInterval);
    StorageEngine.recordGameEnd(score.correct, gameConfig.count);

    const accuracy = Math.round((score.correct / gameConfig.count) * 100);
    const st = StorageEngine.getState();

    sumCorrect.textContent = score.correct;
    sumWrong.textContent = score.wrong;
    sumAccuracy.textContent = `${accuracy}%`;
    sumStreak.textContent = st.bestStreak;

    if (accuracy === 100) {
      summaryTitle.textContent = "🏆 Perfect Score! You're a Math Legend!";
      EffectsEngine.spawnFireworks(80);
      SoundEngine.playStreakFanfare();
    } else if (accuracy >= 70) {
      summaryTitle.textContent = "🌟 Amazing Explorer! Great Job!";
      EffectsEngine.spawnConfetti(60);
    } else {
      summaryTitle.textContent = "💪 Nice Effort! Practice Makes Perfect!";
    }

    showScreen(summaryScreen);
  }

  // Initialize App on DOM Load
  document.addEventListener('DOMContentLoaded', init);
})();
