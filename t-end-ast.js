module.exports = function () {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: {
          type: 'Identifier',
          name: 't'
        },
        property: {
          type: 'Identifier',
          name: 'end'
        }
      },
      arguments: []
    }
  }
}
