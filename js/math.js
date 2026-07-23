/* ==========================================================================
   MATH QUESTION ENGINE (Addition, Subtraction, Multiplication, Division)
   ========================================================================== */

const MathEngine = (function () {
  "use strict";

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Generate intelligent distractors close to answer
  function generateOptions(answer, maxNum) {
    const set = new Set([answer]);
    let offset = 1;
    while (set.size < 4 && offset <= maxNum + 10) {
      if (answer - offset >= 0) set.add(answer - offset);
      if (set.size < 4 && answer + offset <= maxNum * 2) set.add(answer + offset);
      offset++;
    }

    let arr = Array.from(set);
    if (arr.length > 4) {
      const extras = arr.filter(v => v !== answer);
      shuffle(extras);
      arr = [answer, ...extras.slice(0, 3)];
    }
    return shuffle(arr);
  }

  // Determine Operation (+, -, *, /)
  function pickOp(opMode) {
    if (opMode === 'add') return '+';
    if (opMode === 'sub') return '−';
    if (opMode === 'mul') return '×';
    if (opMode === 'div') return '÷';
    // Mixed mode
    const ops = ['+', '−'];
    if (opMode === 'all_mixed') ops.push('×', '÷');
    return ops[randInt(0, ops.length - 1)];
  }

  // Pick blank slot position
  function pickMaskPos(blankMode) {
    if (blankMode === 'first') return 'a';   // __ + 2 = 5
    if (blankMode === 'second') return 'b';  // 3 + __ = 5
    if (blankMode === 'result') return 'c';  // 3 + 2 = __
    return ['a', 'b', 'c'][randInt(0, 2)];
  }

  function generateQuestion(config) {
    const { opMode = 'both', blankMode = 'mix', maxNum = 10 } = config;
    const op = pickOp(opMode);
    let a, b, c;

    if (op === '+') {
      a = randInt(1, Math.max(1, maxNum - 1));
      c = randInt(a, Math.max(a + 1, maxNum));
      b = c - a;
    } else if (op === '−') {
      a = randInt(2, Math.max(2, maxNum));
      b = randInt(0, a);
      c = a - b;
    } else if (op === '×') {
      a = randInt(1, Math.min(10, maxNum));
      b = randInt(1, Math.min(10, Math.max(2, Math.floor(maxNum / a) || 2)));
      c = a * b;
    } else { // Division ÷
      b = randInt(1, Math.min(10, maxNum));
      c = randInt(1, Math.min(10, Math.max(2, Math.floor(maxNum / b) || 2)));
      a = b * c; // ensure integer division
    }

    const maskPos = pickMaskPos(blankMode);
    const answer = maskPos === 'a' ? a : (maskPos === 'b' ? b : c);

    return {
      a,
      b,
      c,
      op,
      maskPos,
      answer,
      options: generateOptions(answer, maxNum),
      solved: false,
      wrongTries: new Set(),
      firstAttempt: undefined
    };
  }

  function generateQuizSet(config, count = 10) {
    const questions = [];
    for (let i = 0; i < count; i++) {
      questions.push(generateQuestion(config));
    }
    return questions;
  }

  return {
    generateQuestion,
    generateQuizSet
  };
})();
