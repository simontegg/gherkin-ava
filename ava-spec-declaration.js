module.exports = {
  'type': 'VariableDeclaration',
  'declarations': [
    {
      'type': 'VariableDeclarator',
      'id': {
        'type': 'ObjectPattern',
        'properties': [
          {
            'type': 'Property',
            'key': {
              'type': 'Identifier',
              'name': 'feature'
            },
            'computed': false,
            'value': {
              'type': 'Identifier',
              'name': 'feature'
            },
            'kind': 'init',
            'method': false,
            'shorthand': true
          }
        ]
      },
      'init': {
        'type': 'CallExpression',
        'callee': {
          'type': 'Identifier',
          'name': 'require'
        },
        'arguments': [
          {
            'type': 'Literal',
            'value': 'ava-spec',
            'raw': "'ava-spec'"
          }
        ]
      }
    }
  ],
  'kind': 'const'
}
