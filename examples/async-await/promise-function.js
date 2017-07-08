module.exports = function (t) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(t)
    }, t)
  })
}
