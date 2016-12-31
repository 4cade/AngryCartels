const assert = require('assert');
const Player = require('../backend/player');
const BoardManager = require('../backend/boardManager');
const Card = require('../backend/card');
const board = require('../backend/config/large_board');

// tests the boardManager object
describe('BoardManager', function(){

    const board1 = new BoardManager(board)

    describe("#initialize", function(){

        it("initializes buildings", function(){
            assert.equal(board1.houses, 81);
            assert.equal(board1.hotels, 31);
            assert.equal(board1.skyscrapers, 16);
        });
        /*
        it("initializes board", function(){
            assert.equal(board1.locations, );
            assert.equal(board1.propertyGroups, );
        })
        */
    });


    const player = new Player('Bob', 'go', 1);

    describe("#movements", function(){

        /*
        it("find location dice rolls away", function(){
            const expected1 = { "next": "go", "gain": 0, "track": false, "visit": []}
            assert.deepEqual(board1.moveLocation(player, 0), expected1) // no movement

            board1.moveLocation(player, 3); // ...baltic

            const expected2 = { "next": "oriental ave", "gain": 0, "track": false, "visit": ["income tax", "reading railroad", "oriental ave"]}
            assert.deepEqual(board1.moveLocation(player, 3), expected2) // cross odd railroad same tracks

            board1.moveLocation(player, 8); // ...virginia

            const expected3 = { "next": "pennsylvania railroad", "gain": 0, "track": false, "visit": ["pennsylvania railroad", "fifth ave"]}
            assert.deepEqual(board1.moveLocation(player, 2), expected3) // cross even railroad change tracks

            assert.deepEqual(player, 14); // ...luxury tax

            const expected4 = { "next": "mediterranean", "gain": 1, "track": false, "visit": ["boardwalk", "go", "mediterranean ave"]}
            assert.deepEqual(board1.moveLocation(player, 3), expected4) // pass collect

            //land on upper track

            //land on lower track
        });
    */

    	/*
        it("find next location if traveling odd and forward", function(){
            const expected1 = { "next": "mediterranean ave", "track": 1 };
            assert.deepEqual(board1.nextLocation("go", true, true, 1), expected1);

            const expected2 = { "next": "atlantic ave", "track": 1 };
            assert.deepEqual(board1.nextLocation("b&o railroad", true, true, 1), expected2);

            const expected3 = { "next": "community chest outer north", "track": 2 };
            assert.deepEqual(board1.nextLocation("b&o railroad", true, true, 2), expected3);
        });

        it("find next location if traveling odd and backward", function(){
            const expected1 = { "next": "boardwalk", "track": 1 };
            assert.deepEqual(board1.nextLocation("go", true, false, 1), expected1);

            const expected2 = { "next": "illinois ave", "track": 1 };
            assert.deepEqual(board1.nextLocation("b&o railroad", true, false, 1), expected2);

            const expected3 = { "next": "yellow cab co", "track": 2 };
            assert.deepEqual(board1.nextLocation("b&o railroad", true, false, 2), expected3);
        });

        it("find next location if traveling even and forward", function(){
            const expected1 = { "next": "mediterranean ave", "track": 1 };
            assert.deepEqual(board1.nextLocation("go", false, true, 1), expected1);

            const expected2 = { "next": "community chest outer north", "track": 2 };
            assert.deepEqual(board1.nextLocation("b&o railroad", false, true, 1), expected2);

            const expected3 = { "next": "atlantic ave", "track": 1 };
            assert.deepEqual(board1.nextLocation("b&o railroad", false, true, 2), expected3);
        });

        it("find next location if traveling even and backward", function(){
            const expected1 = { "next": "boardwalk", "track": 1 };
            assert.deepEqual(board1.nextLocation("go", false, false, 1), expected1);

            const expected2 = { "next": "yellow cab co", "track": 2 };
            assert.deepEqual(board1.nextLocation("b&o railroad", false, false, 1), expected2);

            const expected3 = { "next": "illinois ave", "track": 1 };
            assert.deepEqual(board1.nextLocation("b&o railroad", false, false, 2), expected3);
        });

        it("find info about location jumped to", function(){
            const expected1 = { "next": "boardwalk", "gain": 0, "track": 1, "visit": ["boardwalk"]}
            assert.deepEqual(board1.jumpToLocation("boardwalk"), expected1) // jump to property

            const expected2 = { "next": "go", "gain": 200, "track": 1, "visit": ["go"]}
            assert.deepEqual(board1.jumpToLocation("go"), expected2) // jump to collectGroup

            const expected3 = { "next": "holland tunnel sw", "gain": 0, "track": 2, "visit": ["holland tunnel sw"]}
            assert.deepEqual(board1.jumpToLocation("holland tunnel ne"), expected3) // jump to teleportGroup
        });

        const player2 = new Player("Bill", "go", 1);

        it("find info about location advancement", function(){
            const expected1 = { "next": "go", "gain": 0, "track": 1, "visit": []}
            assert.deepEqual(board1.advanceToLocation(player2, "go"), expected1)

            board1.advanceToLocation(player2, "income tax")

            const expected2 = { "next": "oriental ave", "gain": 0, "track": 1, "visit": ["reading railroad", "oriental ave"]}
            assert.deepEqual(board1.advanceToLocation(player2, "oriental ave"), expected2) // cross odd railroad same tracks

            board1.advanceToLocation(player2, "virginia ave")

            const expected3 = { "next": "fifth ave", "gain": 0, "track": 0, "visit": ["pennsylvania railroad", "fifth ave"]}
            assert.deepEqual(board1.advanceToLocation(player2, "fifth ave"), expected3) // cross even railroad change tracks

            board1.advanceToLocation(player2, "biscayne ave")
            board1.advanceToLocation(player2, "boardwalk")

            const expected4 = { "next": "mediterranean ave", "gain": 200, "track": 1, "visit": ["go", "mediterranean ave"]}
            assert.deepEqual(board1.advanceToLocation(player2, "mediterranean ave"), expected4) // pass collect

            board1.advanceToLocation(player2, "boardwalk")

            const expected5 = { "next": "go", "gain": 200, "track": 1, "visit": ["go"]}
            assert.deepEqual(board1.advanceToLocation(player2, "go"), expected5) // advance to collect

            board1.advanceToLocation(player2, "florida ave")

            const expected6 = { "next": "miami ave", "gain": 0, "track": 0, "visit": ["holland tunnel ne", "miami ave"]}
            assert.deepEqual(board1.advanceToLocation(player2, "miami ave"), expected6) // pass teleport

            board1.advanceToLocation(player2, "florida ave")

            const expected7 = { "next": "holland tunnel sw", "gain": 0, "track": 2, "visit": ["holland tunnel ne", "holland tunnel sw"]}
            assert.deepEqual(board1.advanceToLocation(player2, "holland tunnel ne"), expected7) // advance to teleport

        });
        */
        const player3 = new Player("Ted", "go", 1);

        it("moves to the correct location after rolling", function() {
            // TODO update tests for new spec
            // move to reading rr
            const action1 = board1.moveLocation(player3, 5)[0];
            assert.equal(action1, 'buy');
            assert.equal(player3.location, 'reading railroad');
            assert.equal(player3.track, 1);
            assert.equal(player3.money, 3200);

            // move to pennsylvania rr
            board1.moveLocation(player3, 1);
            const action2 = board1.moveLocation(player3, 9)[0];
            assert.equal(action1, 'buy');
            assert.equal(player3.location, 'pennsylvania railroad');
            assert.equal(player3.track, 1);
            assert.equal(player3.money, 3200);

            // move to lombard st
            board1.moveLocation(player3, 2);
            board1.moveLocation(player3, 11)
            const action3 = board1.moveLocation(player3, 1)[0];
            assert.equal(action3, 'buy');
            assert.equal(player3.location, 'lombard st');
            assert.equal(player3.track, 0);
            assert.equal(player3.money, 3200);

            // move to bonus and get paid
            const action4 = board1.moveLocation(player3, 7)[0];
            assert.equal(action4, null);
            assert.equal(player3.location, 'bonus');
            assert.equal(player3.track, 0);
            assert.equal(player3.money, 3500);

            // move to stock exchange
            board1.moveLocation(player3, 3);
            const action5 = board1.moveLocation(player3, 3)[0];
            assert.equal(action5, 'stock');
            assert.equal(player3.location, 'stock exchange');
            assert.equal(player3.track, 0);
            assert.equal(player3.money, 3500);

            // go through a tunnel
            board1.moveLocation(player3, 6);
            assert.equal(player3.location, 'holland tunnel sw');
            assert.equal(player3.track, 2);
            assert.equal(player3.money, 3500);

            // auction space
            const action6 = board1.moveLocation(player3, 1)[0];
            assert.equal(action6, 'auction'); // TODO test when all properties are owned

            // chance space
            const action7 = board1.moveLocation(player3, 6)[0];
            assert.equal(action7, 'chance'); // TODO test when all properties are owned

            // pass pay day even
            board1.moveLocation(player3, 8);
            assert.equal(player3.money, 3900);

            // move backwards & test pay day odd & community chest
            player3.switchDirection();
            const action8 = board1.moveLocation(player3, 5)[0];
            assert.equal(action8, 'community chest');
            assert.equal(player3.money, 4200);
        });

        it('jumps the player to the specified location', function() {
            // TODO tests
        });

        it('advances to the specified location', function() {
            // TODO
        });

        it('buys properties normally', function() {
            // TODO
        });

        it('buys properties with special auction prices', function() {
            // TODO
        });

        it('finds the next location for Mr. Monopoly', function() {
            // TODO put after several properties bought
        });

        it('sets houses on properties', function() {
            // TODO after properties bought
        });

        it('handles mortgaging/unmortgaging', function() {
            // TODO
        });

        it('handles property transfer', function() {
            // TODO
        });

        it('gets the cost of rent', function() {
            // TODO
        });

        it('lets you know if you can buy properties', function() {
            // TODO
        });

        it('gets all properties in the forward direction', function() {
            // TODO
        });

        it('gets the next transit in the forward direction', function() {
            // TODO
        });
    });
});

// tests the Card object
describe('Card', function() {
    
    it('chance card is valid', function() {
        for(let i = 0; i < 5; i++) {
            const chance = Card.drawChance();
            assert(chance.hasOwnProperty('title'));
            assert(chance.hasOwnProperty('description'));
            assert(chance.hasOwnProperty('play'));
            assert(chance.hasOwnProperty('short'));
        }
    });

    it('community chest is valid', function() {
        for(let i = 0; i < 5; i++) {
            const cc = Card.drawCommunityChest();
            assert(cc.hasOwnProperty('title'));
            assert(cc.hasOwnProperty('description'));
            assert(cc.hasOwnProperty('play'));
            assert(cc.hasOwnProperty('short'));
        }
    });

    it('bus pass is valid', function() {
        for(let i = 0; i < 5; i++) {
            const bp = Card.drawBusPass();
            assert(bp.includes('forward') || bp.includes('backward'));
        }
    });

    it('roll3 is valid', function() {
        for(let i = 0; i < 5; i++) {
            const roll3 = Card.drawRoll3();
            assert.equal(roll3.length, 3);

            let rollSet = new Set();

            roll3.forEach(r => {
                assert(1 <= r <= 6);
                rollSet.add(r);
            });

            // each value is distinct
            assert(Array.from(rollSet).length, 3);
        }
    });

    it('gets 3 dice rolls', function() {
        let die1, die2, die3 = (Card.rollDie(), Card.rollDie(), Card.rollDie());
        assert(1 <= die1 <= 6);
        assert(1 <= die2 <= 6);
        assert(1 <= die3 <= 6);
    });

});
