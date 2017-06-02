const { feature } = require('ava-spec')
const Wall = require('./wall')
const promiseFuntion = require('.async-function')
feature('Ava Asynchronous Example', scenario => {
  scenario('A bottle falls from the wall', async t => {
    const wall = new Wall(100)
    asyncFuntion(1, err => {
      if (err) t.end(err)
      wall.fall(1)
      t.is(99, wall.bottles())
      t.end()
    })
  })
})
