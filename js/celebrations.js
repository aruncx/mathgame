/* ==========================================================================
   SURPRISE CELEBRATION ENGINE (3-Streak Superheroes & Animals)
   ========================================================================== */

const CelebrationEngine = (function () {
  "use strict";

  const HEROES = [
    { title: '🦇 Bat-Hero!', subtitle: 'Saves the day with Math Power!', emoji: '🦇', dance: 'Fly & Spin' },
    { title: '⚡ Super-Hero!', subtitle: 'Flying high into Math Stars!', emoji: '🦸‍♂️', dance: 'Power Jump' },
    { title: '🍥 Ninja-Hero!', subtitle: 'Shadow Math Technique Unleashed!', emoji: '🥷', dance: 'Ninja Kick' },
    { title: '🕷️ Spider-Hero!', subtitle: 'Web-slinging Math Genius!', emoji: '🕷️', dance: 'Wall Bounce' },
    { title: '👑 Wonder-Hero!', subtitle: 'Golden Lasso of Truth & Numbers!', emoji: '🦸‍♀️', dance: 'Crown Shine' },
    { title: '🤖 Iron-Hero!', subtitle: 'Armor Powered by Math Energy!', emoji: '🤖', dance: 'Rocket Boost' },
    { title: '🐉 Magic Dragon!', subtitle: 'Breathing Fire of Brilliance!', emoji: '🐉', dance: 'Dragon Soar' },
    { title: '🦄 Rainbow Unicorn!', subtitle: 'Sparkling Magic Dust Everywhere!', emoji: '🦄', dance: 'Rainbow Hop' },
    { title: '🧜‍♀️ Star Mermaid!', subtitle: 'Splashing Joy & Good Vibes!', emoji: '🧜‍♀️', dance: 'Wave Spin' },
    { title: '👽 Friendly Alien!', subtitle: 'Greetings Cosmic Math Hero!', emoji: '👽', dance: 'Space Grooving' }
  ];

  const ANIMALS = [
    { title: '🦁 Mighty Lion!', subtitle: 'Roaring loud for your 3-streak!', emoji: '🦁', sound: 'lion' },
    { title: '🐘 Friendly Elephant!', subtitle: 'Trumpeting your awesome score!', emoji: '🐘', sound: 'elephant' },
    { title: '🐼 Penny Panda!', subtitle: 'Doing happy panda rolls!', emoji: '🐼', sound: 'panda' },
    { title: '🐧 Cool Penguin!', subtitle: 'Happy ice waddle dance!', emoji: '🐧', sound: 'penguin' },
    { title: '🐬 Playful Dolphin!', subtitle: 'High jump through the rainbow!', emoji: '🐬', sound: 'dolphin' },
    { title: '🦚 Royal Peacock!', subtitle: 'Spreading beautiful color feathers!', emoji: '🦚', sound: 'peacock' },
    { title: '🐢 Wise Turtle!', subtitle: 'Slow and steady, you win!', emoji: '🐢', sound: 'turtle' },
    { title: '🐝 Happy Bee!', subtitle: 'Buzzing with joy!', emoji: '🐝', sound: 'bee' }
  ];

  let activeTimeout = null;

  function triggerSurprise(callback) {
    const isHero = Math.random() < 0.6;
    const pool = isHero ? HEROES : ANIMALS;
    const celebration = pool[Math.floor(Math.random() * pool.length)];

    const overlay = document.getElementById('celebrationOverlay');
    const avatarEl = document.getElementById('heroAvatar');
    const titleEl = document.getElementById('heroTitle');
    const subtitleEl = document.getElementById('heroSubtitle');

    if (!overlay || !avatarEl || !titleEl || !subtitleEl) {
      if (callback) callback();
      return;
    }

    avatarEl.textContent = celebration.emoji;
    titleEl.textContent = celebration.title;
    subtitleEl.textContent = celebration.subtitle;

    // Play celebration audio cue & fireworks
    if (SoundEngine) {
      SoundEngine.playStreakFanfare();
      if (celebration.sound) SoundEngine.playAnimalSound(celebration.sound);
    }
    if (EffectsEngine) {
      EffectsEngine.spawnFireworks(70);
    }

    overlay.classList.add('active');

    if (activeTimeout) clearTimeout(activeTimeout);
    activeTimeout = setTimeout(() => {
      overlay.classList.remove('active');
      if (callback) callback();
    }, 3800);
  }

  return {
    triggerSurprise
  };
})();
