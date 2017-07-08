const Wall = require('./wall')
const promiseFunction = require('./promise-function')

Given('(\\d+) green bottles are standing on the wall', function (num) {
  const wall = new Wall(num)
})

When('(\\d+) green bottle accidentally falls', async function (num) {
  const awaitedNum = await promiseFuntion(num)
  wall.fall(awaitedNum)
})

Then(
  'there (?:are|are still) (\\d+) green bottles standing on the wall',
  function (num) {
    t.is(num, wall.bottles())
  }
)
