const avaCukes = require('../')
const path = require('path')
const fs = require('fs')
const test = require('ava')
const format = require('prettier-standard-formatter').format

test('simple async example', t => {
  const expected = `const { feature } = require('ava-spec')
const Wall = require('./wall')
const asyncFunction = require('./async-function')
feature('Ava Asynchronous Example', scenario => {
  scenario.cb('A bottle falls from the wall', t => {
    const wall = new Wall(100)
    asyncFuntion(1, err => {
      if (err) t.end(err)
      wall.fall(1)
      t.is(99, wall.bottles())
      t.end()
    })
  })
})
`
  const libraryFile = fs.readFileSync(
    path.resolve(__dirname, '../examples/bottles/steps.js'),
    'utf8'
  )
  const featureFile = fs.readFileSync(
    path.resolve(__dirname, '../examples/bottles/bottles.feature'),
    'utf8'
  )

  const testFile = avaCukes(libraryFile, featureFile)

  return format(testFile).then(result => {
    t.is(result, expected)
  })
})

test.only('async/await example', t => {
  const expected = `const { feature } = require('ava-spec')
const Wall = require('./wall')
const promiseFunction = require('./promise-function')
feature('Ava Asynchronous Example', scenario => {
  scenario('A bottle falls from the wall', async t => {
    const wall = new Wall(100)
    const awaitedNum = await promiseFunction(1)
    wall.fall(awaited)
    t.is(99, wall.bottles())
  })
})
`
  const libraryFile = fs.readFileSync(
    path.resolve(__dirname, '../examples/async-await/steps.js'),
    'utf8'
  )
  const featureFile = fs.readFileSync(
    path.resolve(__dirname, '../examples/async-await/bottles.feature'),
    'utf8'
  )

  const testFile = avaCukes(libraryFile, featureFile)

  return format(testFile).then(result => {
    t.is(result, expected)
  })
})
