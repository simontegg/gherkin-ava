module.exports = function (t, callback) {
  setTimeout(function () {
    callback(null)
  }, t)
}
