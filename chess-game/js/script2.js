$(function() {
    init();
    console.log("Main Init Called");
});

function InitFilesRanksBrd() {
    var index = 0;
    var file = FILES.FILE_A;
    var rank = RANKS.RANK_1;
    var sq = SQUARES.A1;
    var sq64 = 0;

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
    console.log(FilesBrd);
    console.log(RanksBrd);
    // console.log("FilesBrd[0]: " + FilesBrd[0] + ", RanksBrd[0]: " + RanksBrd[0]);
    // console.log("FilesBrd[SQUARES.A1]: " + FilesBrd[SQUARES.A1] + ", RanksBrd[SQUARES.A1]: " + RanksBrd[SQUARES.A1]);
}


function init() {
    console.log("init() called");
    // $("#btn").click(function() {})
    $("#SetFen").click(function() {
        console.log("Button");
    });
    InitFilesRanksBrd();
}
