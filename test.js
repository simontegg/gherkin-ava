const { feature } = require('ava-spec')

const Wall = function (num) {
  let bottles = num

  return {
    fall: fallNum => {
      bottles = bottles - fallNum
    },

    getBottles: () => bottles
  }
}

feature('Ava Asynchronous Example', scenario => {
  scenario.cb('A bottle falls from the wall', t => {
    const wall = Wall(100)
    wall.fall(1)
    t.is(wall.getBottles(), 99)
    t.end() 
  })
})


