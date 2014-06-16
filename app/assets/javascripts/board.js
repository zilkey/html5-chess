window.Board = {
  currentTurn: "white",
  letters: ["a", "b", "c", "d", "e", "f", "g", "h", "i"],
  cells: {},
  cellsByID: {},
  cellsByPieceID: {},
  pieces: {},
  piecesByCellID: {},
  moves: [],

  initialize: function ($element, gameID, pusherKey, playsWhitePieces) {
    $(document).on('dragover', this.didDragOver.bind(this));
    $(document).on('dragend', this.didDragEnd.bind(this));
    $(document).on("cell:dragenter", this.didDragEnterCell.bind(this));
    $(document).on("cell:dragleave", this.didDragLeaveCell.bind(this));
    $(document).on("cell:drop", this.didDropOntoCell.bind(this));
    $(document).on("piece:dragstart", this.didDragStartPiece.bind(this));

    this.playsWhitePieces = playsWhitePieces;
    this.pusherKey = pusherKey;
    this.gameID = gameID;
    this.$element = $element;
    this.setupPusher();
    this.render();
  },

  setupPusher: function () {
    this.pusher = new Pusher(this.pusherKey);
    this.channel = this.pusher.subscribe('private-chess-' + this.gameID);
    this.channel.bind('client-piece-moved', function (data) {
      var fromCell = this.cellsByID[data.fromCellID];
      var toCell = this.cellsByID[data.toCellID];
      var piece = this.pieces[data.pieceID];
      this.performMove(piece, fromCell, toCell);
    }.bind(this));
  },

  render: function () {
    var $table = $("<table>"), $tr;
    this.$tableCaption = $("<caption>").text(this.getCaptionText());
    $table.append(this.$tableCaption);
    var $tbody = $("<tbody>");
    var vertical, horizontal;

    $tbody.append(this.letterRow());

    for (vertical = 8; vertical > 0; vertical--) {
      $tr = $("<tr>");
      $tr.append("<th>" + vertical + "</th>");

      for (horizontal = 1; horizontal < 9; horizontal++) {
        var className;
        if (vertical % 2 == 0) {
          className = horizontal % 2 == 0 ? "white" : "black";
        } else {
          className = horizontal % 2 == 0 ? "black" : "white";
        }
        var letter = this.letters[horizontal - 1];
        var $td = $("<td>").addClass(className);
        var cell = new Cell($td, vertical, horizontal, letter);
        this.cells[vertical] = this.cells[vertical] || {};
        this.cells[vertical][horizontal] = cell;
        this.cells[vertical][letter] = cell; // you can easily access by letter if you want to
        this.cellsByID[cell.id] = cell;

        $tr.append($td);
      }

      $tr.append("<th>" + vertical + "</th>");
      $tbody.append($tr);
    }

    $tbody.append(this.letterRow());

    $table.append($tbody);
    this.setInitialPieces();
    this.$element.append($table);
  },

  getCaptionText: function(){
    var captionText = "You are " + (this.playsWhitePieces ? "white" : "black") + ".  ";
    return captionText + "It is " + this.currentTurn + "'s turn";
  },

  didDragStartPiece: function (e, dataTransfer, piece) {
    this.pieceBeingDragged = piece;
    dataTransfer.effectAllowed = 'move';
    dataTransfer.setData('id', piece.id);
    piece.$element.css({opacity: '0.4'});
  },

  didDragLeaveCell: function (e, cell) {
    cell.$element.removeClass('over');
  },

  didDragEnterCell: function (e, dataTransfer, cell) {
    var pieceInDropZone = this.piecesByCellID[cell.id];
    var isCorrectColor = this.pieceBeingDragged.color == this.currentTurn;

    var isCorrectPlayer = (this.pieceBeingDragged.color == "white" && this.playsWhitePieces)
      || (this.pieceBeingDragged.color == "black" && !this.playsWhitePieces);

    if (isCorrectColor && isCorrectPlayer && (!pieceInDropZone || (this.pieceBeingDragged.color != pieceInDropZone.color))) {
      cell.$element.addClass('over');
    }
  },

  didDropOntoCell: function (e, dataTransfer, toCell) {
    var id = dataTransfer.getData('id');
    var piece = this.pieces[id];
    var fromCell = this.cellsByPieceID[piece.id];

    if (this.isValidMove(piece, fromCell, toCell)) {
      this.performMove(piece, fromCell, toCell);

      this.channel.trigger("client-piece-moved", {
        fromCellID: fromCell.id,
        toCellID: toCell.id,
        pieceID: piece.id
      })
    }
  },

  didDragOver: function (e) {
    e.preventDefault();
    e.originalEvent.dataTransfer.dropEffect = 'move';
    return false;
  },

  didDragEnd: function (e) {
    e.target.style.opacity = 1;
    $('.over').removeClass('over');
  },

  performMove: function (piece, fromCell, toCell) {
    this.moves.push(new Move(piece, fromCell, toCell));
    piece.moves.push(new Move(piece, fromCell, toCell));
    var $el = piece.$element.detach();
    toCell.$element.append($el);

    var pieceInDopZone = this.piecesByCellID[toCell.id];
    if (pieceInDopZone) {
      pieceInDopZone.$element.removeAttr("draggable").prop("draggable", false);
      var html = pieceInDopZone.$element.get(0).outerHTML;
      html.draggable = false;
      $("[data-cemetery=" + pieceInDopZone.color + "]").append(html);
      pieceInDopZone.$element.remove();
    }

    this.piecesByCellID[fromCell.id] = null;
    this.piecesByCellID[toCell.id] = piece;
    this.cellsByPieceID[piece.id] = toCell;
    this.pieceBeingDragged = null;
    this.currentTurn = this.currentTurn == "white" ? "black" : "white";
    this.$tableCaption.text(this.getCaptionText());
  },

  isValidMove: function (piece, sourceCell, destinationCell) {
    if (piece.color != this.currentTurn) {
      return false;
    }
    if ((piece.color == "white" && !this.playsWhitePieces) || (piece.color == "black" && this.playsWhitePieces)) {
      return false;
    }

    var yDiff = sourceCell.y - destinationCell.y;
    var xDiff = sourceCell.x - destinationCell.x;
    var pieceInDropZone = this.piecesByCellID[destinationCell.id];

    return Move.validators[piece.type](piece, xDiff, yDiff, pieceInDropZone, sourceCell, destinationCell, this);
  },

  placePiece: function (piece, vertical, horizontal) {
    var cell = this.cells[vertical][horizontal];
    this.pieces[piece.id] = piece;
    this.piecesByCellID[cell.id] = piece;
    this.cellsByPieceID[piece.id] = cell;
    cell.$element.html(piece.$element);
  },

  letterRow: function () {
    var $tr = $("<tr>");
    $tr.append("<th>");
    for (var x = 0; x < 8; x++) {
      $tr.append('<th class="letters">' + this.letters[x] + '</th>');
    }
    return $tr;
  },

  setInitialPieces: function () {
    var id = 0;

    this.initialPieces.forEach(function (element) {
      var char = $('<div>').html(element.code).addClass("piece").prop("draggable", true);
      var piece = new Piece(id++, $(char), element.color, element.type);
      this.placePiece(piece, element.y, element.x);
    }.bind(this));
  },

  initialPieces: [
    {code: '&#9814;', y: 1, x: 'a', color: 'white', type: 'rook'},
    {code: '&#9816;', y: 1, x: 'b', color: 'white', type: 'knight'},
    {code: '&#9815;', y: 1, x: 'c', color: 'white', type: 'bishop'},
    {code: '&#9813;', y: 1, x: 'd', color: 'white', type: 'queen'},
    {code: '&#9812;', y: 1, x: 'e', color: 'white', type: 'king'},
    {code: '&#9815;', y: 1, x: 'f', color: 'white', type: 'bishop'},
    {code: '&#9816;', y: 1, x: 'g', color: 'white', type: 'knight'},
    {code: '&#9814;', y: 1, x: 'h', color: 'white', type: 'rook'},

    {code: '&#9817;', y: 2, x: 'a', color: 'white', type: 'pawn'},
    {code: '&#9817;', y: 2, x: 'b', color: 'white', type: 'pawn'},
    {code: '&#9817;', y: 2, x: 'c', color: 'white', type: 'pawn'},
    {code: '&#9817;', y: 2, x: 'd', color: 'white', type: 'pawn'},
    {code: '&#9817;', y: 2, x: 'e', color: 'white', type: 'pawn'},
    {code: '&#9817;', y: 2, x: 'f', color: 'white', type: 'pawn'},
    {code: '&#9817;', y: 2, x: 'g', color: 'white', type: 'pawn'},
    {code: '&#9817;', y: 2, x: 'h', color: 'white', type: 'pawn'},

    {code: '&#9820;', y: 8, x: 'a', color: 'black', type: 'rook'},
    {code: '&#9822;', y: 8, x: 'b', color: 'black', type: 'knight'},
    {code: '&#9821;', y: 8, x: 'c', color: 'black', type: 'bishop'},
    {code: '&#9819;', y: 8, x: 'd', color: 'black', type: 'queen'},
    {code: '&#9818;', y: 8, x: 'e', color: 'black', type: 'king'},
    {code: '&#9821;', y: 8, x: 'f', color: 'black', type: 'bishop'},
    {code: '&#9822;', y: 8, x: 'g', color: 'black', type: 'knight'},
    {code: '&#9820;', y: 8, x: 'h', color: 'black', type: 'rook'},

    {code: '&#9823;', y: 7, x: 'a', color: 'black', type: 'pawn'},
    {code: '&#9823;', y: 7, x: 'b', color: 'black', type: 'pawn'},
    {code: '&#9823;', y: 7, x: 'c', color: 'black', type: 'pawn'},
    {code: '&#9823;', y: 7, x: 'd', color: 'black', type: 'pawn'},
    {code: '&#9823;', y: 7, x: 'e', color: 'black', type: 'pawn'},
    {code: '&#9823;', y: 7, x: 'f', color: 'black', type: 'pawn'},
    {code: '&#9823;', y: 7, x: 'g', color: 'black', type: 'pawn'},
    {code: '&#9823;', y: 7, x: 'h', color: 'black', type: 'pawn'}
  ]

};