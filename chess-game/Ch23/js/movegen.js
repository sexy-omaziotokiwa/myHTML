
function MOVE(from, to, captured, promoted, flag) {
	return (from | (to << 7) | (captured << 14) | (promoted << 20) | flag);
}

function GenerateMoves() {
	GameBoard.moveListStart[GameBoard.ply+1] = GameBoard.moveListStart[GameBoard.ply];
	
	var pceType;
	var pceNum;
	var sq;
	
	if(GameBoard.side == COLOURS.WHITE) {
		pceType = PIECES.wP;
		
		for(pceNum = 0; pceNum < GameBoard.pceNum[pceType]; ++pceType) {
			sq = GameBoard.pList[PCEINDEX(pceType, pceNum)];
			
			if(GameBoard.piece[sq + 10] == PIECES.EMPTY) {
				// Add Pawn Move Here
				if(RanksBrd[sq] == RANKS.RANK_2 && GameBoard.pieces[sq + 20] == PIECES.EMPTY) {
					// Add Quiet Move Here
				}
			}
			
			if(SQOFFBOARD(sq + 9) == BOOL.FALSE && PieceCol[GameBoard.pieces[sq+9]] == COLOURS.BLACK) {
				// Add Pawn Cap Move
			}
			
			if(SQOFFBOARD(sq + 11) == BOOL.FALSE && PieceCol[GameBoard.pieces[sq+11]] == COLOURS.BLACK) {
				// Add Pawn Cap Move
			}			
			
			if(GameBoard.enPas != SQUARES.NOSQ) {
				if(sq + 9 == GameBoard.enPas) {
					// Add enPas Move
				}
				
				if(sq + 11 == GameBoard.enPas) {
					// Add enPas Move
				}
			}
		}
		
		pceType = PIECE.wN;
	} else {
		pceType = PIECES.bP;
		
		for(pceNum = 0; pceNum < GameBoard.pceNum[pceType]; ++pceType) {
			sq = GameBoard.pList[PCEINDEX(pceType, pceNum)];
			
			if(GameBoard.piece[sq - 10] == PIECES.EMPTY) {
				// Add Pawn Move Here
				if(RanksBrd[sq] == RANKS.RANK_7 && GameBoard.pieces[sq - 20] == PIECES.EMPTY) {
					// Add Quiet Move Here
				}
			}
			
			if(SQOFFBOARD(sq - 9) == BOOL.FALSE && PieceCol[GameBoard.pieces[sq-9]] == COLOURS.WHITE) {
				// Add Pawn Cap Move
			}
			
			if(SQOFFBOARD(sq - 11) == BOOL.FALSE && PieceCol[GameBoard.pieces[sq-11]] == COLOURS.WHITE) {
				// Add Pawn Cap Move
			}			
			
			if(GameBoard.enPas != SQUARES.NOSQ) {
				if(sq - 9 == GameBoard.enPas) {
					// Add enPas Move
				}
				
				if(sq - 11 == GameBoard.enPas) {
					// Add enPas Move
				}
			}
		}
		
		pceType = PIECE.bN;
	}
	
}



















































