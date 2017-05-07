
module.exports = function getProgramExpression(body) {
  return {
    type: 'Program',
    body,
    sourceType: "module",
  }
}

