const Wall = require('./wall')

Given('(\\d+) green bottles are standing on the wall', function (num) {
  const wall = new Wall(num)
})

When('(\\d+) green bottle accidentally falls', function (num) {
  asyncFuntion(num, err => {
    if (err) t.end(err)
    wall.fall(num)
    next()
  })
})

Then('there (?:are|are still) (\\d+) green bottles standing on the wall', function (num) {
  t.is(num, wall.items)
})

