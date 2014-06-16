window.Move = function (piece, sourceCell, destinationCell) {
  this.piece = piece;
  this.sourceCell = sourceCell;
  this.destinationCell = destinationCell;
};

Move.validators = {

  pawn: function (piece, xDiff, yDiff, pieceInDropZone, sourceCell, destinationCell, board) {
    var validPlaces = [];

    if (piece.color == "white") {
      if (xDiff == 0 && yDiff == -1 && !pieceInDropZone) {
        validPlaces.push([0, -1]);
      }

      if (xDiff == -1 && yDiff == -1 && pieceInDropZone && pieceInDropZone.color != piece.color) {
        validPlaces.push([-1, -1]);
      }

      if (xDiff == 1 && yDiff == -1 && pieceInDropZone && pieceInDropZone.color != piece.color) {
        validPlaces.push([1, -1]);
      }

      if (xDiff == 0 && yDiff == -2 && piece.moves.length == 0 && !pieceInDropZone) {
        validPlaces.push([0, -2]);
      }
    }

    if (piece.color == "black") {
      if (xDiff == 0 && yDiff == 1 && !pieceInDropZone) {
        validPlaces.push([0, 1]);
      }

      if (xDiff == -1 && yDiff == 1 && pieceInDropZone && pieceInDropZone.color != piece.color) {
        validPlaces.push([-1, 1]);
      }

      if (xDiff == 1 && yDiff == 1 && pieceInDropZone && pieceInDropZone.color != piece.color) {
        validPlaces.push([1, 1]);
      }

      if (xDiff == 0 && yDiff == 2 && piece.moves.length == 0 && !pieceInDropZone) {
        validPlaces.push([0, 2]);
      }
    }

    return this.moveIsInBounds(validPlaces, xDiff, yDiff);
  },

  moveIsInBounds: function (validPlaces, xDiff, yDiff) {
    var valid = false;
    validPlaces.forEach(function (move) {
      if (move[0] == xDiff && move[1] == yDiff) {
        valid = true;
      }
    });
    return valid;
  },

  knight: function (piece, xDiff, yDiff, pieceInDropZone, sourceCell, destinationCell, board) {
    var validPlaces = [
      [-1, 2],
      [1 , 2],
      [-2 , 1],
      [-2 , -1],
      [-1 , -2],
      [1 , -2],
      [2 , 1],
      [2 , -1]
    ];

    var valid = this.moveIsInBounds(validPlaces, xDiff, yDiff);
    return valid && (!pieceInDropZone || (pieceInDropZone.color != piece.color));
  },

  king: function (piece, xDiff, yDiff, pieceInDropZone, sourceCell, destinationCell, board) {
    var validPlaces = [
      [-1, -1],
      [1 , 1],
      [-1 , 1],
      [1 , -1],
      [-1 , 0],
      [1 , 0],
      [0 , -1],
      [0 , 1]
    ];

    var valid = this.moveIsInBounds(validPlaces, xDiff, yDiff);
    return valid && (!pieceInDropZone || (pieceInDropZone.color != piece.color));
  },

  rook: function (piece, xDiff, yDiff, pieceInDropZone, sourceCell, destinationCell, board) {
    var validDirection = (xDiff == 0 || yDiff == 0);
    var validDropZone = (!pieceInDropZone || (pieceInDropZone.color != piece.color));
    var piecesInPath = this.findPiecesInPath(xDiff, yDiff, sourceCell, destinationCell, board);
    var validPath = piecesInPath.length == 0;
    return validDirection && validDropZone && validPath;
  },

  bishop: function (piece, xDiff, yDiff, pieceInDropZone, sourceCell, destinationCell, board) {
    var validDirection = (Math.abs(yDiff) == Math.abs(xDiff));
    var validDropZone = (!pieceInDropZone || (pieceInDropZone.color != piece.color));
    var piecesInPath = this.findPiecesInPath(xDiff, yDiff, sourceCell, destinationCell, board);
    var validPath = piecesInPath.length == 0;
    return validDirection && validDropZone && validPath;
  },

  queen: function (piece, xDiff, yDiff, pieceInDropZone, sourceCell, destinationCell, board) {
    var validDirection = (xDiff == 0 || yDiff == 0) || (Math.abs(xDiff) == Math.abs(yDiff));
    var validDropZone = (!pieceInDropZone || (pieceInDropZone.color != piece.color));
    var piecesInPath = this.findPiecesInPath(xDiff, yDiff, sourceCell, destinationCell, board);
    var validPath = piecesInPath.length == 0;
    return validDirection && validDropZone && validPath;
  },

  findPiecesInPath: function (xDiff, yDiff, sourceCell, destinationCell, board) {
    var piecesInPath = [];
    var currentX = sourceCell.x, currentY = sourceCell.y;
    var pieceInPath, cell;
    var x, y, m;

    var movingDown = (xDiff == 0 && yDiff > 0);
    if (movingDown) {
      for (y = sourceCell.y - 1; y > destinationCell.y; y--) {
        cell = board.cells[y][sourceCell.x];
        pieceInPath = board.piecesByCellID[cell.id];
        if (pieceInPath) {
          piecesInPath.push(pieceInPath);
        }
      }
    }

    var movingRight = (xDiff < 0 && yDiff == 0);
    if (movingRight) {
      for (x = sourceCell.x + 1; x < destinationCell.x; x++) {
        cell = board.cells[sourceCell.y][x];
        pieceInPath = board.piecesByCellID[cell.id];
        if (pieceInPath) {
          piecesInPath.push(pieceInPath);
        }
      }
    }

    var movingUp = (xDiff == 0 && yDiff < 0);
    if (movingUp) {
      for (y = sourceCell.y + 1; y < destinationCell.y; y++) {
        cell = board.cells[y][sourceCell.x];
        pieceInPath = board.piecesByCellID[cell.id];
        if (pieceInPath) {
          piecesInPath.push(pieceInPath);
        }
      }
    }

    var movingLeft = (xDiff > 0 && yDiff == 0);
    if (movingLeft) {
      for (x = sourceCell.x - 1; x > destinationCell.x; x--) {
        cell = board.cells[sourceCell.y][x];
        pieceInPath = board.piecesByCellID[cell.id];
        if (pieceInPath) {
          piecesInPath.push(pieceInPath);
        }
      }
    }

    var movingDownLeft = (xDiff > 0 && yDiff > 0);
    if (movingDownLeft) {
      for (m = 1; m < Math.abs(xDiff); m++) {
        currentX--;
        currentY--;
        cell = board.cells[currentY][currentX];
        pieceInPath = board.piecesByCellID[cell.id];
        if (pieceInPath) {
          piecesInPath.push(pieceInPath);
        }
      }
    }

    var movingDownRight = (xDiff < 0 && yDiff > 0);
    if (movingDownRight) {
      for (m = 1; m < Math.abs(xDiff); m++) {
        currentX++;
        currentY--;
        cell = board.cells[currentY][currentX];
        pieceInPath = board.piecesByCellID[cell.id];
        if (pieceInPath) {
          piecesInPath.push(pieceInPath);
        }
      }
    }

    var movingUpLeft = (xDiff > 0 && yDiff < 0);
    if (movingUpLeft) {
      for (m = 1; m < Math.abs(xDiff); m++) {
        currentX--;
        currentY++;
        cell = board.cells[currentY][currentX];
        pieceInPath = board.piecesByCellID[cell.id];
        if (pieceInPath) {
          piecesInPath.push(pieceInPath);
        }
      }
    }

    var movingUpRight = (xDiff < 0 && yDiff < 0);
    if (movingUpRight) {
      for (m = 1; m < Math.abs(xDiff); m++) {
        currentX++;
        currentY++;
        cell = board.cells[currentY][currentX];
        pieceInPath = board.piecesByCellID[cell.id];
        if (pieceInPath) {
          piecesInPath.push(pieceInPath);
        }
      }
    }

    return piecesInPath;
  }

};