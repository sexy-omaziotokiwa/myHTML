$('#SetFen').click(function() {
    var fenStr = $("#fenIn").val();
    ParseFEN(fenStr);
    PrintBoard();
})