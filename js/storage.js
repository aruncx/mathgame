/* ==========================================================================
   STORAGE ENGINE (Statistics, Currency, Streaks, Achievements Persistence)
   ========================================================================== */

const StorageEngine = (function () {
  "use strict";

  const KEY = 'number_jungle_save_v2';

  const defaultData = {
    avatarId: 'monkey',
    stars: 0,
    coins: 0,
    diamonds: 0,
    bananas: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    totalWrong: 0,
    gamesPlayed: 0,
    highScore: 0,
    unlockedBadges: ['jungle_hero']
  };

  let state = { ...defaultData };

  function init() {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) {
        state = { ...defaultData, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("LocalStorage access failed:", e);
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("LocalStorage save failed:", e);
    }
  }

  function getState() {
    return state;
  }

  function recordAnswer(isCorrect) {
    state.totalQuestions++;
    if (isCorrect) {
      state.totalCorrect++;
      state.currentStreak++;
      state.stars += 5;
      state.coins += 2;
      state.bananas += 1;

      if (state.currentStreak > state.bestStreak) {
        state.bestStreak = state.currentStreak;
      }
      if (state.currentStreak >= 5 && !state.unlockedBadges.includes('streak_master')) {
        state.unlockedBadges.push('streak_master');
      }
      if (state.currentStreak >= 10 && !state.unlockedBadges.includes('math_hero')) {
        state.unlockedBadges.push('math_hero');
        state.diamonds += 1;
      }
    } else {
      state.totalWrong++;
      state.currentStreak = 0;
    }
    save();
    return state;
  }

  function recordGameEnd(scoreCount, totalCount) {
    state.gamesPlayed++;
    if (scoreCount > state.highScore) {
      state.highScore = scoreCount;
    }
    if (scoreCount === totalCount && !state.unlockedBadges.includes('perfect_score')) {
      state.unlockedBadges.push('perfect_score');
      state.diamonds += 2;
    }
    save();
  }

  function setAvatar(id) {
    state.avatarId = id;
    save();
  }

  init();

  return {
    getState,
    recordAnswer,
    recordGameEnd,
    setAvatar
  };
})();
