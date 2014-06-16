window.Cell = function ($element, y, x, xLabel) {
  this.$element = $element;
  this.y = y;
  this.x = x;
  this.xLabel = xLabel;
  this.id = y.toString() + xLabel;

  this.$element.on('dragenter', function (e) {
    $element.trigger("cell:dragenter", [e.originalEvent.dataTransfer, this]);
  }.bind(this));

  this.$element.on('dragleave', function (e) {
    $element.trigger("cell:dragleave", this);
  }.bind(this));

  this.$element.on("drop", function (e) {
    e.stopPropagation();
    $element.trigger("cell:drop", [e.originalEvent.dataTransfer, this]);
    return false;
  }.bind(this));
};