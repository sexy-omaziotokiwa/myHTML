var PIECES = {
    EMPTY: 0, wP: 1, wN: 2, wB: 3, wR: 4, wQ: 5, wK:6,
    bP: 7, bN: 8, bB: 9, bR: 10, bQ: 11, bK: 12
};

var BRD_SQ_NUM = 120;

var FILES = {
    FILE_A: 0, FILE_B: 1, FILE_C: 2, FILE_D: 3,
    FILE_E: 4, FILE_F: 5, FILE_G: 6, FILE_H: 7,
    NONE: 8
};

var RANKS = {
    RANK_1: 0, RANK_2: 1, RANK_3: 2, RANK_4: 3, 
    RANK_5: 4, RANK_6: 5, RANK_7: 6, RANK_8: 7,
    NONE: 8
};

var COLOURS = {      
    WHITE: 0, BLACK: 1, BOTH: 2
};

var CASTLEBIT = {      
    WKCA: 1, WQCA: 2, BKCA: 4, BQCA: 8
    /*
        WKCA: 0001
        WQCA: 0010
        BKCA: 0100
        BQCA: 1000
    */
};

var SQUARES = {
    A1: 21, B1: 22, C1: 23, D1: 24, E1: 25, F1: 26, G1: 27, H1: 28,
    A8: 91, B8: 92, C8: 93, D8: 94, E8: 95, F8: 96, G8: 97, H8: 98,
    NO_SQ: 99, OFFBOARD: 100
};

var BOOL = {FALSE: 0, TRUE: 1};

var MAXGAMEMOVES = 2048;
var MAXPOSITIONMOVES = 256;
var MAXDEPTH = 64;

var FilesBrd = new Array(BRD_SQ_NUM);
var RanksBrd = new Array(BRD_SQ_NUM);

var START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
var PceChar = ".PNBRQKpnbrqk";
var SideChar = "wb-";
var RankChar = "12345678";
var FileChar = "abcdefgh";

function FR2SQ(f,r) {
    return (21 + f) + (r * 10);
}

function RAND_32() {
    return (Math.floor(Math.random()*255 + 1) << 23) | (Math.floor(Math.random()*255 + 1) << 16)
    | (Math.floor(Math.random()*255 + 1) << 8) | (Math.floor(Math.random()*255 + 1));
}


// function RAND_64() {
//     return (Math.floor(Math.random())) << 0;
// };


function FR2SQ(f,r) {
    return ( (21 + (f) ) + ( (r) * 10 ) );
}

var PieceBig = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE ];
var PieceMaj = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE ];
var PieceMin = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];
var PieceVal= [ 0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000  ];
var PieceCol = [ COLOURS.BOTH, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE,
    COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK ];

var PiecePawn = [ BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];	
var PieceKnight = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];
var PieceKing = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE ];
var PieceRookQueen = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE ];
var PieceBishopQueen = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE ];
var PieceSlides = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE ];

var KnDir = [ -8, -19,	-21, -12, 8, 19, 21, 12 ];
var RkDir = [ -1, -10,	1, 10 ];
var BiDir = [ -9, -11, 11, 9 ];
var KiDir = [ -1, -10,	1, 10, -9, -11, 11, 9 ];
// var KiDir = [-9, -10, -11, -1, 1, 9, 10, 11];
var DirNum = [0, 0, 8, 4, 4, 8, 8, 0, 8, 4, 4, 8, 8];
var PceDir = [0, 0, KnDir, BiDir, RkDir, KiDir, KiDir, 0, KnDir, BiDir, RkDir, KiDir, KiDir];
var LoopNonSlidePce = [PIECES.wN, PIECES.wK, 0, PIECES.bN, PIECES.bK, 0];
var LoopNonSlideIndex = [0, 3];
var LoopSlidePce = [PIECES.wB, PIECES.wR, PIECES.wQ, 0, PIECES.bB, PIECES.bR, PIECES.bQ, 0];
var LoopSlideIndex = [0, 4];

var PieceKeys = new Array(14 * 120);
var SideKey;
var CastleKeys = new Array(16);

var Sq120ToSq64 = new Array(BRD_SQ_NUM);
var Sq64ToSq120 = new Array(64);

function SQ64(sq120) {
    return Sq120ToSq64[sq120];	
}	
function SQ120(sq64) {	
    return Sq64ToSq120[sq64];	
}	 


function PCEINDEX(pce, pceNum) {
	return (pce * 10 + pceNum);
}

var Kings = [PIECES.wK, PIECES.bK];
var CastlePerm = [
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 
    15, 13, 15, 15, 15, 12, 15, 15, 14, 15, 
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 
    15,  7, 15, 15, 15,  3, 15, 15, 11, 15, 
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 
];


function FROMSQ(m) { return (m & 0x7F); }
function TOSQ(m) { return ((m >> 7) & 0x7F); }
function CAPTURED(m) { return ((m >> 14) & 0xF); }
function PROMOTED(m) { return ((m >> 20) & 0xF); }

var MFLAGEP = 0x40000; // MOVE FLAG EN PASSANT
var MFLAGPS = 0x80000; // MOVE FLAG PAWN START
var MFLAGCA = 0x100000; // MOVE FLAG CASTLING
var MFLAGPCAP = 0x7C000; // MOVE FLAG CAPTURE
var MFLAGPROM = 0xF00000; // MOVE FLAG PROMOTION  10XF00000

var NOMOVE = 0;

function SQOFFBOARD(sq) {
    if (FilesBrd[sq] == SQUARES.OFFBOARD) return BOOL.TRUE;
    return BOOL.FALSE;
}


function HASH_PCE(pce, sq) {
    GameBoard.posKey ^= PieceKeys[pce*120 + sq];
}

function HASH_CA() {  GameBoard.posKey ^= CastleKeys[GameBoard.castlePerm];  }
function HASH_SIDE() {  GameBoard.posKey ^= SideKey;  }
function HASH_EP() {  GameBoard.posKey ^= PieceKeys[GameBoard.enPas];  }


/*
0000  0
0001  1
0010  2
0011  3
0100  4
0101  5
0110  6
0111  7
1000  8
1001  9 
1010  A(10)
1011  B(11)
1100  C(12)
1101  D(13)
1110  E(14)
1111  F(15)
*/