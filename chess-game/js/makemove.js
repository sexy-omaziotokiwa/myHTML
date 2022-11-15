function ClearPiece(sq) {
    var pce = GameBoard.pieces[sq];
    var col = PieceCol[pce];
    var index = 0;
    var t_pceNum = -1;

    HASH_PCE(pce, sq);

    GameBoard.pieces[sq] = PIECES.EMPTY;
    GameBoard.material[col] -= PieceVal[pce];

    for (index = 0; index < GameBoard.pceNum[pce]; ++index) {
        if (GameBoard.pList[PCEINDEX(pce, index)] == sq) {
            t_pceNum = index;
            break;
        }
    }

    GameBoard.pceNum[pce]--;
    GameBoard.pList[PCEINDEX(pce, t_pceNum)] = GameBoard.pList[PCEINDEX(pce, GameBoard.pceNum[pce])]
}