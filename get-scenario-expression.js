module.exports = function getScenarioExpression (name, body) {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'scenario',
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
              name: 't',
            }
          ],
          body: {
            type: "BlockStatement",
            body
          }
        }
      ]
    }
  }
}
