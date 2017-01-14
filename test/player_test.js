const assert = require('assert');
const Player = require('../backend/player');
const HouseProperty = require('../backend/location/houseProperty');
const PlayerManager = require('../backend/playerManager');

// tests the Player object
describe('Player', function() {

    const player1 = new Player('Bob', 'go', 1);

    describe("#initialize", function() {
        it("has all correct parts correctly initialized", function() {
            assert.equal(player1.name, 'Bob');
            assert.equal(player1.getMoney(), 3200);
        })
    });

    describe('#moneyTests', function() {
        it("added money", function() {
            const hasMoney = player1.deltaMoney(200);
            assert.equal(player1.getMoney(), 3400);
            assert.equal(hasMoney, true);
        });

        it("removed money", function() {
            const hasMoney = player1.deltaMoney(-2100);
            assert.equal(player1.getMoney(), 1300);
            assert.equal(hasMoney, true);
        });

        it("handles multiple transactions", function() {
            player1.deltaMoney(-1100);
            player1.deltaMoney(500);
            player1.deltaMoney(-600);
            player1.deltaMoney(900);
            player1.deltaMoney(-50);
            player1.deltaMoney(-250);
            const hasMoney = player1.deltaMoney(-100);
            assert.equal(player1.getMoney(), 600);
            assert.equal(hasMoney, true);
        });

        it("goes bankrupt when goes below 0", function() {
            const hasMoney1 = player1.deltaMoney(-600);
            assert.equal(player1.getMoney(), 0);
            assert.equal(hasMoney1, true);

            const hasMoney2 = player1.deltaMoney(-1);
            assert.equal(player1.getMoney(), -1);
            assert.equal(hasMoney2, false);

            const hasMoney3 = player1.deltaMoney(2);
            assert.equal(player1.getMoney(), 1);
            assert.equal(hasMoney3, true);

            assert(player1.canAfford(1));
            assert(!player1.canAfford(2));
        });
    });

    describe("#busPassTests", function() {
        it("adds all of the bus passes", function() {
            const expected = {"forward any": 2, "derp 2": 1, "back 3": 1}
            player1.gainBusPass('forward any');
            player1.gainBusPass('derp 2');
            player1.gainBusPass('back 3');
            player1.gainBusPass('forward any');
            assert.deepEqual(player1.team.busTickets, expected);
        });

        it("removes all of the bus passes", function() {
            const expected = {}
            player1.useBusPass('forward any');
            player1.useBusPass('derp 2');
            player1.useBusPass('back 3');
            player1.useBusPass('forward any');
            assert.deepEqual(player1.team.busTickets, expected);
        });

        it("adds and removes the bus passes", function() {
            const expected = {"forward any": 1, "derp 2": 1}
            player1.gainBusPass('forward any');
            player1.gainBusPass('derp 2');
            player1.gainBusPass('back 3');
            player1.gainBusPass('forward any');
            player1.useBusPass('back 3');
            player1.useBusPass('forward any');
            assert.deepEqual(player1.team.busTickets, expected);
        });

        it("has all of the tickets expire", function() {
            const expected = {"forward expire": 1}
            player1.gainBusPass('forward any');
            player1.gainBusPass('derp 2');
            player1.gainBusPass('back 3');
            player1.gainBusPass('forward any');
            player1.useBusPass('back 3');
            player1.gainBusPass('forward expire');
            assert.deepEqual(player1.team.busTickets, expected);
            player1.gainBusPass('something else expire');
            const expected2 = {"something else expire": 1}
            assert.deepEqual(player1.team.busTickets, expected2);
        });
    });

    describe("#specialCardTests", function() {
        it("adds all of the special cards", function() {
            const expected = {"just say no": 2, "get out of jail free": 1, "steal": 1}
            player1.gainSpecialCard('just say no');
            player1.gainSpecialCard('get out of jail free');
            player1.gainSpecialCard('steal');
            player1.gainSpecialCard('just say no');
            assert.deepEqual(player1.team.specialCards, expected);
        });

        it("removes all of the special cards", function() {
            const expected = {}
            player1.useSpecialCard('just say no');
            player1.useSpecialCard('get out of jail free');
            player1.useSpecialCard('steal');
            player1.useSpecialCard('just say no');
            assert.deepEqual(player1.team.specialCards, expected);
        });
    });

    describe("#movementTests", function() {
        it("moves the player to the location with side effects", function() {
            player1.moveToLocation("bob", 1, 299);
            assert.equal(player1.location, "bob");
            assert.equal(player1.track, 1);
            assert.equal(player1.getMoney(), 300);

            player1.moveToLocation("dude", 0, 0);
            assert.equal(player1.location, "dude");
            assert.equal(player1.track, 0);
            assert.equal(player1.getMoney(), 300);
            assert.equal(player1.getNetWorth(), 300);
        });

        it('switches direction correctly', function() {
            assert(player1.forward);
            player1.switchDirection();
            assert(!player1.forward);
            player1.switchDirection();
            assert(player1.forward);
        })
    });

    describe("#propertyTests", function() {
        const p1 = new HouseProperty("boylston st", {"type": "property", "quality": "black", "rent": [30, 160, 470, 1050, 1250, 1500, 2500], "mortgage": 165, "house": 200, "forward": ["newbury st"], "side": [1], "backward": ["bonus"], "track": [0],"below": ["states ave"]});
        const p2 = new HouseProperty("westheimer rd", {"type": "property", "quality": "light yellow", "rent": [11, 55, 160, 475, 650, 800, 1300], "mortgage": 70, "house": 100, "forward": ["internet service provider"], "backward": ["katy freeway"], "side": [1], "track": [2], "above": ["st charles pl"]})
        const p3 = new HouseProperty("peachtree st", {"type": "property", "quality": "sea green", "rent": [20, 100, 300, 750, 925, 1100, 1600], "mortgage": 100, "house": 100, "forward": ["pay day"], "backward": ["decatur st"], "side": [1], "track": [2], "above": ["free parking"]});

        p2.addHouse();
        p2.addHouse();
        p3.mortgage();

        it("gains the properties and associated wealth", function() {
            assert.equal(player1.team.properties.size, 0);

            player1.gainProperty(p1)
            assert.deepEqual(player1.team.properties.has(p1), true);
            assert.equal(player1.getNetWorth(), player1.getMoney() + p1.getValue());

            player1.gainProperty(p2);
            assert.deepEqual(player1.team.properties.has(p1), true);
            assert.deepEqual(player1.team.properties.has(p2), true);
            assert.equal(player1.getNetWorth(), player1.getMoney() + p1.getValue() + p2.getValue());

            player1.gainProperty(p3);
            assert.deepEqual(player1.team.properties.has(p1), true);
            assert.deepEqual(player1.team.properties.has(p2), true);
            assert.deepEqual(player1.team.properties.has(p3), true);
            assert.equal(player1.getNetWorth(), player1.getMoney() + p1.getValue() + p2.getValue() + p3.getValue());

            // changes propogate?
            p3.unmortgage();
            assert.deepEqual(player1.team.properties.has(p1), true);
            assert.deepEqual(player1.team.properties.has(p2), true);
            assert.deepEqual(player1.team.properties.has(p3), true);
            assert.equal(player1.getNetWorth(), player1.getMoney() + p1.getValue() + p2.getValue() + p3.getValue());

            assert.equal(player1.team.properties.size, 3);
        });
        
        it("loses the properties and associated wealth", function() {
            player1.loseProperty(p1);
            assert.deepEqual(player1.team.properties.has(p2), true);
            assert.deepEqual(player1.team.properties.has(p3), true);
            assert.equal(player1.getNetWorth(), player1.getMoney() + p2.getValue() + p3.getValue());

            player1.loseProperty(p3);
            assert.deepEqual(player1.team.properties.has(p2), true);
            assert.equal(player1.getNetWorth(), player1.getMoney() + p2.getValue());

            // hopefully changes in the object propogate
            p2.removeHouse();
            assert.deepEqual(player1.team.properties.has(p2), true);
            assert.equal(player1.getNetWorth(), player1.getMoney() + p2.getValue());

            player1.loseProperty(p2);
            assert.deepEqual(player1.team.properties, new Set());
            assert.equal(player1.getNetWorth(), player1.getMoney());

            assert.equal(player1.team.properties.size, 0);

            // be able to handle "losing" properties that it doesn't have
            player1.loseProperty(p2);
            player1.loseProperty(p1);
            player1.loseProperty(p3);
        });
    });
})




// tests the playerManager objects
describe('PlayerManager', function() {
    const play1 = new PlayerManager(['Bob', 'Jill', 'Jack'], 'go', 1);

    describe("#initialize", function() {
        it("has correct initial attributes", function() {
            assert.equal(play1.turnIndex, 0);
            assert.equal(play1.currentPlayer, play1.turnOrder[0]);
        })
    });

    describe("#nextTurn", function() {
        it("moves to the next turn", function() {
            play1.nextTurn();
            assert.equal(play1.currentPlayer, play1.turnOrder[1])
            play1.nextTurn();
            play1.nextTurn();
            assert.equal(play1.currentPlayer, play1.turnOrder[0])
        })
    });

    describe("#getPlayer", function() {
        it("gets Player Object from name", function() {
            // test works because it doesn't scramble order until that is called
            assert.equal(play1.getPlayer('Bob'), play1.turnOrder[0])
            assert.equal(play1.getPlayer('Jill'), play1.turnOrder[1])
            assert.equal(play1.getPlayer('Jack'), play1.turnOrder[2])
        })
    });
})

