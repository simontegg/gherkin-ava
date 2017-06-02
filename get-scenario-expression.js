module.exports = function getScenarioExpression (
  { name, callback, async, assertionCount },
  body
) {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: {
          type: 'Identifier',
          name: 'scenario'
        },
        property: {
          type: 'Identifier',
          name: 'cb'
        }
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
              name: 't'
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
