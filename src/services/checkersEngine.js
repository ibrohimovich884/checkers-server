const engine = {
	createInitialBoard: () => {
		const board = Array(8).fill(null).map(() => Array(8).fill(0));
		for (let r = 0; r < 3; r++) {
			for (let c = (r % 2 === 0 ? 1 : 0); c < 8; c += 2) board[r][c] = 2; // Qora
		}
		for (let r = 5; r < 8; r++) {
			for (let c = (r % 2 === 0 ? 1 : 0); c < 8; c += 2) board[r][c] = 1; // Oq
		}
		return board;
	},

	isValidMove: (game, from, to) => {
		const { board, turn } = game;
		const piece = board[from.r][from.c];
		const target = board[to.r][to.c];

		// 1. Asosiy tekshiruvlar
		if (target !== 0) return false;
		if (turn === 'white' && piece !== 1 && piece !== 3) return false;
		if (turn === 'black' && piece !== 2 && piece !== 4) return false;

		const rowDiff = to.r - from.r;
		const colDiff = to.c - from.c;
		const absRowDiff = Math.abs(rowDiff);
		const absColDiff = Math.abs(colDiff);

		// Diagonal bo'ylab harakatni tekshirish
		if (absRowDiff !== absColDiff) return false;

		const rowStep = rowDiff / absRowDiff;
		const colStep = colDiff / absColDiff;

		// --- DAMKA UCHUN MANTIQ (3 va 4) ---
		if (piece >= 3) {
			let piecesInWay = 0;
			let midPiecePos = null;

			// Yo'ldagi barcha kataklarni tekshiramiz
			for (let i = 1; i < absRowDiff; i++) {
				const r = from.r + i * rowStep;
				const c = from.c + i * colStep;
				if (board[r][c] !== 0) {
					piecesInWay++;
					midPiecePos = { r, c, val: board[r][c] };
				}
			}

			// Oddiy yurish: yo'lda hech narsa yo'q
			if (piecesInWay === 0) return true;

			// Urish: yo'lda faqat 1 ta raqib donasi bor
			if (piecesInWay === 1) {
				const isEnemy = midPiecePos.val % 2 !== piece % 2;
				if (isEnemy) return true;
			}
			return false;
		}

		// --- ODDIY DONA UCHUN MANTIQ (1 va 2) ---
		if (absRowDiff === 1) {
			if (piece === 1 && rowDiff === -1) return true;
			if (piece === 2 && rowDiff === 1) return true;
		}

		if (absRowDiff === 2) {
			const midR = from.r + rowStep;
			const midC = from.c + colStep;
			const midPiece = board[midR][midC];
			if (midPiece !== 0 && (midPiece % 2 !== piece % 2)) return true;
		}

		return false;
	},

	movePiece: (board, from, to) => {
		let piece = board[from.r][from.c];
		const rowDiff = to.r - from.r;
		const colDiff = to.c - from.c;
		const absRowDiff = Math.abs(rowDiff);
		const rowStep = rowDiff / absRowDiff;
		const colStep = colDiff / Math.abs(colDiff);

		// O'rtadagi hamma narsani tozalash (urish sodir bo'lsa)
		for (let i = 1; i < absRowDiff; i++) {
			const r = from.r + i * rowStep;
			const c = from.c + i * colStep;
			board[r][c] = 0;
		}

		// Damkaga aylantirish
		if (piece === 1 && to.r === 0) piece = 3;
		if (piece === 2 && to.r === 7) piece = 4;

		board[to.r][to.c] = piece;
		board[from.r][from.c] = 0;

		return board;
	},

	// MANA SHU FUNKSIYA SENDA YO'Q EDI:
	// checkersEngine.js ichidagi canCaptureMore funksiyasini yangila:

	canCaptureMore: (board, r, c) => {
		const piece = board[r][c];
		if (piece === 0) return false;

		const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

		for (const [dr, dc] of directions) {
			// Oddiy dona uchun (1 va 2)
			if (piece <= 2) {
				const tr = r + dr * 2;
				const tc = c + dc * 2;
				const mr = r + dr;
				const mc = c + dc;

				if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
					if (board[tr][tc] === 0 && board[mr][mc] !== 0 && board[mr][mc] % 2 !== piece % 2) {
						return true;
					}
				}
			}
			// Damka uchun (3 va 4) - diagonal bo'ylab raqibni qidiradi
			else {
				let foundEnemy = false;
				for (let i = 1; i < 8; i++) {
					const tr = r + dr * i;
					const tc = c + dc * i;
					const nextR = tr + dr;
					const nextC = tc + dc;

					if (nextR < 0 || nextR >= 8 || nextC < 0 || nextC >= 8) break;

					const current = board[tr][tc];
					const next = board[nextR][nextC];

					if (current !== 0) {
						if (current % 2 !== piece % 2) {
							// Raqibni topdik, uning orqasi bo'shligini tekshiramiz
							if (next === 0) return true;
							else break; // Raqib orqasida boshqa dona bor
						} else {
							break; // O'zimizning dona yo'lni to'sib turibdi
						}
					}
				}
			}
		}
		return false;
	},
	isGameOver: (board) => {
		let whitePieces = 0;
		let blackPieces = 0;

		for (let r = 0; r < 8; r++) {
			for (let c = 0; c < 8; c++) {
				const piece = board[r][c];
				if (piece === 1 || piece === 3) whitePieces++;
				if (piece === 2 || piece === 4) blackPieces++;
			}
		}

		// Agar birorta rangdagi donalar qolmagan bo'lsa, o'yin tugaydi
		return whitePieces === 0 || blackPieces === 0;
	},

	hasAnyJump: (game) => {
		const { board, turn } = game;
		for (let r = 0; r < 8; r++) {
			for (let c = 0; c < 8; c++) {
				const piece = board[r][c];
				// Agar katakda navbati kelgan o'yinchining donasi bo'lsa
				if (piece !== 0 && ((turn === 'white' && (piece === 1 || piece === 3)) ||
					(turn === 'black' && (piece === 2 || piece === 4)))) {
					if (engine.canCaptureMore(board, r, c)) {
						return true; // Kamida bitta dona ura oladi
					}
				}
			}
		}
		return false;
	}
};

export default engine;