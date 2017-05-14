module.exports = function getFeatureExpression (name, body) {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'feature'
      },
      arguments: [
        {
          type: 'Literal',
          value: name
        },
        {
          type: 'ArrowFunctionExpression',
          params: [
            {
              type: 'Identifier',
              name: 'scenario'
            }
          ],
          body: {
            type: 'BlockStatement',
            body
          }
        }
      ]
    }
  }
}
