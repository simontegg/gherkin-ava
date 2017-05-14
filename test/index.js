const avaCukes = require('../')
const path = require('path')
const test = require('ava')
const format = require('prettier-standard-formatter').format

test.cb('simple async example', t => {
  const expected = `const { feature } = require('ava-spec')
const Wall = require('./wall')
feature('Ava Asynchronous Example', scenario => {
  scenario.cb('A bottle falls from the wall', t => {
    const wall = new Wall(100)
    asyncFuntion(1, err => {
      if (err) t.end(err)
      wall.fall(1)
      t.is(99, wall.items)
      t.end()
    })
  })
})
`

  avaCukes(
    path.resolve(__dirname, '../examples/steps.js'),
    path.resolve(__dirname, '../examples/bottles.feature'),
    (err, testFile) => {
      format(testFile).then(result => {
        t.is(result, expected)
        t.end()
      })
    }
  )
})
