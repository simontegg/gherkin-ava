const isArray = require('is-array')

module.exports = function getProgramExpression (body) {

  return {
    program: {
      type: 'Program',
      body
    }
  }
}

