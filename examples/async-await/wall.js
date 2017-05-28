function Wall (num) {
  this.bottles = num
}

Wall.prototype.fall = function (num) {
  this.bottles = this.bottles = num
}

Wall.prototype.bottles = function () {
  return this.bottles
}

module.exports = Wall
