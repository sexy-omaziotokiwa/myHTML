$(function() {
    init();
    ParseFEN(START_FEN);
    //ParseFEN("r1bqkb1r/pp1ppp1p/2n2np1/2p5/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 1");
    PrintBoard();
    GenerateMoves();
    PrintMoveList();
    PrintPieceLists();
    CheckBoard();
});

function InitFilesRanksBrd() {
    var index = 0;
    var file = FILES.FILE_A;
    var rank = RANKS.RANK_1;
    var sq = SQUARES.A1;

    for (index = 0; index < BRD_SQ_NUM; ++index) {
        FilesBrd[index] = SQUARES.OFFBOARD;
        RanksBrd[index] = SQUARES.OFFBOARD;
    }
    
    for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
        for (file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
            sq = FR2SQ(file, rank);
            FilesBrd[sq] = file;
            RanksBrd[sq] = rank;
        }
    }
}

function InitHashKeys() {
    var index = 0;
    for (index = 0; index < 14*120; ++index) {
        PieceKeys[index] = RAND_32()
    }
    SideKey = RAND_32();
    for (index = 0; index < 16; ++index) {
        CastleKeys[index] = RAND_32()
    }
}

function InitSq120ToSq64() {
    var index = 0;
    var file = FILES.FILE_A;
    var rank = RANKS.RANK_1;
    var sq = SQUARES.A1;
    var sq64 = 0;
    for (index = 0; index < BRD_SQ_NUM; ++index) {
        Sq120ToSq64[index] = 65;
    }
    for (index = 0; index < 64; ++index) {
        Sq64ToSq120[index] = 120;
    }
    for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
        for (file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
            sq = FR2SQ(file, rank);
            Sq64ToSq120[sq64] = sq;
            Sq120ToSq64[sq] = sq64;
            sq64++;
        }
    }
}

function InitBoardVars() {
    var index = 0;
    for (index = 0; index < MAXGAMEMOVES; ++index) {
        GameBoard.history.push( {
            move : NOMOVE,
            castlePerm : 0,
            enPas : 0,
            fiftyMove : 0,
            posKey : 0
        } );
    }
    for (index = 0; index < PVENTRIES; ++index) {
        GameBoard.PvTable.push({
            move : NOMOVE,
            posKey : 0
        });
    }
}

// function InitFilesRanks{
//     var index = 0;
//     var file = FILES.FILE_A;
//     var rank = RANKS.RANK_1;
//     var sq = SQUARES.A1
// }



function init() {
    console.log("init() called");
    InitFilesRanksBrd();
    InitHashKeys();
    InitSq120ToSq64();
    //InitBoardVars();
}



    /*
    var piece1 = RAND_32();
    var piece2 = RAND_32();
    var piece3 = RAND_32();
    var piece4 = RAND_32();

    var key = 0;
    key ^= piece1;
    key ^= piece2;
    key ^= piece3;
    key ^= piece4;
    console.log("key: " + key.toString(16));

    key ^= piece1;
    console.log("piece1 out key: " + key.toString(16));

    key = 0;
    key ^= piece2;
    key ^= piece3;
    key ^= piece4;
    console.log("build no piece 1 key: " + key.toString(16));

    InitSq120ToSq64();
    */