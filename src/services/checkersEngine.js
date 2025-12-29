const engine = {
  // 1. O'yinni boshlash uchun boshlang'ich taxta yaratish
  createInitialBoard: () => {
    const board = Array(8).fill(null).map(() => Array(8).fill(0));
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 !== 0) {
          if (r < 3) board[r][c] = 2; // Qora donalar
          if (r > 4) board[r][c] = 1; // Oq donalar
        }
      }
    }
    return board;
  },

  // 2. Yurishni tekshirish
  isValidMove: (game, from, to) => {
    const { board, turn } = game;
    const piece = board[from.r][from.c];

    // Navbatni tekshirish (1 va 3 - oq, 2 va 4 - qora)
    if (turn === 'white' && ![1, 3].includes(piece)) return false;
    if (turn === 'black' && ![2, 4].includes(piece)) return false;

    // Nishon bo'sh bo'lishi kerak
    if (board[to.r][to.c] !== 0) return false;

    const rowDiff = to.r - from.r;
    const colDiff = Math.abs(to.c - from.c);

    // Oddiy yurish (faqat oldinga, 1 qadam diagonal)
    if (colDiff === 1) {
      if (piece === 1 && rowDiff === -1) return true; // Oq tepaga
      if (piece === 2 && rowDiff === 1) return true;  // Qora pastga
      if ([3, 4].includes(piece) && Math.abs(rowDiff) === 1) return true; // Dama har qaysi tomonga
    }

    // Raqibni yeyish (2 qadam diagonal)
    if (colDiff === 2 && Math.abs(rowDiff) === 2) {
      const midR = (from.r + to.r) / 2;
      const midC = (from.c + to.c) / 2;
      const midPiece = board[midR][midC];

      if (turn === 'white' && [2, 4].includes(midPiece)) return true;
      if (turn === 'black' && [1, 3].includes(midPiece)) return true;
    }

    return false;
  },

  // 3. Yurishni amalga oshirish va holatni qaytarish
  movePiece: (board, from, to) => {
    const newBoard = board.map(row => [...row]);
    let piece = newBoard[from.r][from.c];

    // Dama bo'lishni tekshirish
    if (piece === 1 && to.r === 0) piece = 3;
    if (piece === 2 && to.r === 7) piece = 4;

    newBoard[to.r][to.c] = piece;
    newBoard[from.r][from.c] = 0;

    // Agar yegan bo'lsa, o'rtadagi donani o'chirish
    if (Math.abs(to.r - from.r) === 2) {
      const midR = (from.r + to.r) / 2;
      const midC = (from.c + to.c) / 2;
      newBoard[midR][midC] = 0;
    }

    return newBoard;
  },

  // 4. O'yin tugaganini aniqlash
  isGameOver: (board) => {
    const flatBoard = board.flat();
    const whiteExists = flatBoard.some(p => [1, 3].includes(p));
    const blackExists = flatBoard.some(p => [2, 4].includes(p));
    return !whiteExists || !blackExists;
  }
};

export default engine;