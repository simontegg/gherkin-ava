const {feature} = require('ava-spec');
const Wall = require('./wall');
feature('Ava Asynchronous Example', scenario => {
    scenario.cb('A bottle falls from the wall', t => {
        const wall = new Wall(num);
        asyncFuntion(num, err => {
            if (err)
                t.end(err);
            wall.fall(num);
            next();
        });
        t.is(num, wall.items);
    });
});