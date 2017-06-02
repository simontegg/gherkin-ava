const Wall = require('./wall')
const promiseFunction = require('./async-function')

Given('(\\d+) green bottles are standing on the wall', function (num) {
  const wall = new Wall(num)
})

When('(\\d+) green bottle accidentally falls', async function (num) {
  const asyncNum = await promiseFuntion(num)
  wall.fall(asyncNum)
})

Then(
  'there (?:are|are still) (\\d+) green bottles standing on the wall',
  function (num) {
    t.is(num, wall.bottles())
  }
)
