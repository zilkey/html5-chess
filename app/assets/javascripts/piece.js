window.Piece = function (id, $element, color, type) {
  this.id = id;
  this.$element = $element;
  this.color = color;
  this.type = type;
  this.moves = [];

  this.$element.on("dragstart", function(e){
    this.$element.trigger("piece:dragstart", [e.originalEvent.dataTransfer, this]);
  }.bind(this));
};
