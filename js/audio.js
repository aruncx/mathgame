/* ==========================================================================
   AUDIO SYNTHESIZER & SOUND ENGINE (Web Audio API + Web Speech API)
   ========================================================================== */

const SoundEngine = (function () {
  "use strict";

  let audioCtx = null;
  let soundOn = true;
  let speechOn = true;
  let bgMusicPlaying = false;
  let bgMusicTimeout = null;
  let musicStep = 0;

  // Initialize or resume audio context on user interaction
  function getAudioCtx() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function toggleSound(enable) {
    if (enable !== undefined) soundOn = enable;
    else soundOn = !soundOn;
    if (!soundOn) stopMusic();
    else startMusic();
    return soundOn;
  }

  function isMuted() {
    return !soundOn;
  }

  // Play a synthesized tone with envelope
  function playTone(freq, duration, type = 'sine', gainVal = 0.2, delay = 0) {
    if (!soundOn) return;
    const ctx = getAudioCtx();
    if (!ctx) return;

    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(gainVal, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  // Play cheerful victory chord sequence
  function playCorrect() {
    if (!soundOn) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      playTone(freq, 0.25, 'triangle', 0.25, idx * 0.08);
    });
  }

  // Play gentle encouraging wrong answer sound
  function playWrong() {
    if (!soundOn) return;
    playTone(329.63, 0.2, 'sine', 0.2, 0);   // E4
    playTone(261.63, 0.35, 'sine', 0.2, 0.15); // C4
  }

  // Play streak reward fan fare
  function playStreakFanfare() {
    if (!soundOn) return;
    const melody = [
      { f: 523.25, d: 0.15, delay: 0 },
      { f: 659.25, d: 0.15, delay: 0.15 },
      { f: 783.99, d: 0.15, delay: 0.30 },
      { f: 1046.50, d: 0.50, delay: 0.45 }
    ];
    melody.forEach(n => playTone(n.f, n.d, 'triangle', 0.3, n.delay));
  }

  // Synthesize realistic Animal Audio Cues
  function playAnimalSound(type) {
    if (!soundOn) return;
    const ctx = getAudioCtx();
    if (!ctx) return;

    const t = type ? type.toLowerCase() : '';
    if (t.includes('lion') || t.includes('tiger')) {
      // Deep roar rumble
      for (let i = 0; i < 3; i++) {
        playTone(110 - i * 15, 0.4, 'sawtooth', 0.3, i * 0.12);
      }
    } else if (t.includes('monkey')) {
      // Ooh ooh ah ah high chirps
      playTone(600, 0.1, 'sine', 0.25, 0);
      playTone(750, 0.12, 'sine', 0.3, 0.12);
      playTone(900, 0.15, 'sine', 0.3, 0.28);
    } else if (t.includes('dino') || t.includes('dragon')) {
      // Heavy stomp & low rumble
      playTone(70, 0.6, 'sawtooth', 0.4, 0);
      playTone(90, 0.4, 'square', 0.2, 0.1);
    } else if (t.includes('cat') || t.includes('fox')) {
      // High meow sweep
      playTone(880, 0.3, 'sine', 0.2, 0);
      playTone(700, 0.2, 'sine', 0.15, 0.2);
    } else if (t.includes('dog')) {
      // Woof bark
      playTone(300, 0.1, 'square', 0.3, 0);
      playTone(220, 0.12, 'square', 0.2, 0.08);
    } else {
      // Default cute animal chirp
      playTone(659.25, 0.12, 'sine', 0.2, 0);
      playTone(880.00, 0.2, 'sine', 0.25, 0.1);
    }
  }

  // Synthesized Background Jungle Music Loop (Pentatonic playful)
  const LEAD_NOTES = [523.25, null, 659.25, 783.99, null, 659.25, 587.33, null, 523.25, null, 587.33, 659.25, null, 783.99, 659.25, null];
  const BASS_NOTES = [130.81, null, null, null, 196.00, null, null, null, 220.00, null, null, null, 196.00, null, null, null];
  const STEP_MS = 320;

  function musicTick() {
    if (!bgMusicPlaying) return;
    if (soundOn) {
      const note = LEAD_NOTES[musicStep % LEAD_NOTES.length];
      const bass = BASS_NOTES[musicStep % BASS_NOTES.length];
      if (note) playTone(note, 0.22, 'triangle', 0.12, 0);
      if (bass) playTone(bass, 0.38, 'sine', 0.15, 0);
    }
    musicStep++;
    bgMusicTimeout = setTimeout(musicTick, STEP_MS);
  }

  function startMusic() {
    if (bgMusicPlaying || !soundOn) return;
    bgMusicPlaying = true;
    musicStep = 0;
    musicTick();
  }

  function stopMusic() {
    bgMusicPlaying = false;
    if (bgMusicTimeout) clearTimeout(bgMusicTimeout);
  }

  // Web Speech API for reading questions aloud
  function speakText(text) {
    if (!speechOn || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.2; // Kid-friendly cheerful pitch
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  }

  return {
    getAudioCtx,
    toggleSound,
    isMuted,
    playCorrect,
    playWrong,
    playStreakFanfare,
    playAnimalSound,
    startMusic,
    stopMusic,
    speakText
  };
})();
