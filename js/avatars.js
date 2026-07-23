/* ==========================================================================
   AVATARS & LEARNING BUDDY CONFIGURATION
   ========================================================================== */

const AvatarManager = (function () {
  "use strict";

  const AVATARS = [
    { id: 'monkey', emoji: '🐵', name: 'Milo Monkey', sound: 'monkey', title: 'Jungle Explorer' },
    { id: 'lion', emoji: '🦁', name: 'Leo Lion', sound: 'lion', title: 'King of Math' },
    { id: 'tiger', emoji: '🐯', name: 'Toby Tiger', sound: 'tiger', title: 'Striped Genius' },
    { id: 'panda', emoji: '🐼', name: 'Penny Panda', sound: 'panda', title: 'Bamboo Master' },
    { id: 'rabbit', emoji: '🐰', name: 'Rosie Rabbit', sound: 'rabbit', title: 'Speedy Hopper' },
    { id: 'frog', emoji: '🐸', name: 'Frankie Frog', sound: 'frog', title: 'Leaping Wizard' },
    { id: 'fox', emoji: '🦊', name: 'Fiona Fox', sound: 'fox', title: 'Clever Thinker' },
    { id: 'koala', emoji: '🐨', name: 'Koko Koala', sound: 'koala', title: 'Cozy Champion' },
    { id: 'unicorn', emoji: '🦄', name: 'Una Unicorn', sound: 'unicorn', title: 'Magic Sparkle' },
    { id: 'dino', emoji: '🦖', name: 'Dino Rex', sound: 'dino', title: 'Mighty Solver' }
  ];

  let selectedAvatar = AVATARS[0];

  function getAvatars() {
    return AVATARS;
  }

  function getSelected() {
    return selectedAvatar;
  }

  function setSelectById(id) {
    const found = AVATARS.find(a => a.id === id);
    if (found) {
      selectedAvatar = found;
    }
    return selectedAvatar;
  }

  return {
    getAvatars,
    getSelected,
    setSelectById
  };
})();
