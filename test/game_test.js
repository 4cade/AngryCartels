const assert = require('assert');
const Player = require('../backend/player');
const BoardManager = require('../backend/boardManager')
const board = require('../backend/large_board')

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
		
		const player3 = new Player("Ted", "go", 1);

		it("moves to the correct location after rolling", function() {
			const action1 = board1.moveLocation(player3, 5)[0];

			assert.equal(action1, 'buy');
			assert.equal(player3.location, 'reading railroad');
			assert.equal(player3.track, 1);
			assert.equal(player3.money, 3200);

			// TODO more
		});
	});
})