const assert = require('assert');
const Player = require('../backend/player');

// tests the Player object
describe('Player', function() {

	const player1 = new Player('Bob', 'go', 1);

	describe("#initialize", function() {
		it("should have all correct parts correctly initialized", function() {
			assert.equal(player1.name, 'Bob');
			assert.equal(player1.money, 3200);
		})
	});

	describe('#moneyTests', function() {
		it("should have added money", function() {
			const hasMoney = player1.deltaMoney(200);
			assert.equal(3400, player1.money);
			assert.equal(true, hasMoney);
		});

		it("should have removed money", function() {
			const hasMoney = player1.deltaMoney(-2100);
			assert.equal(1300, player1.money);
			assert.equal(true, hasMoney);
		});

		it("should handle multiple transactions", function() {
			player1.deltaMoney(-1100);
			player1.deltaMoney(500);
			player1.deltaMoney(-600);
			player1.deltaMoney(900);
			player1.deltaMoney(-50);
			player1.deltaMoney(-250);
			const hasMoney = player1.deltaMoney(-100);
			assert.equal(600, player1.money);
			assert.equal(true, hasMoney);
		});

		it("should go bankrupt when goes below 0", function() {
			const hasMoney1 = player1.deltaMoney(-600);
			assert.equal(0, player1.money);
			assert.equal(true, hasMoney1);

			const hasMoney2 = player1.deltaMoney(-1);
			assert.equal(-1, player1.money);
			assert.equal(false, hasMoney2);

			const hasMoney3 = player1.deltaMoney(2);
			assert.equal(1, player1.money);
			assert.equal(true, hasMoney3);
		});
	});

	describe("#busPassTests", function() {
		it("should add all of the bus passes", function() {
			const expected = {"forward any": 2, "derp 2": 1, "back 3": 1}
			player1.gainBusPass('forward any');
			player1.gainBusPass('derp 2');
			player1.gainBusPass('back 3');
			player1.gainBusPass('forward any');
			assert.deepEqual(expected, player1.busTickets)
		});

		it("should remove all of the bus passes", function() {
			const expected = {}
			player1.useBusPass('forward any');
			player1.useBusPass('derp 2');
			player1.useBusPass('back 3');
			player1.useBusPass('forward any');
			assert.deepEqual(expected, player1.busTickets)
		});

		it("should add and remove the bus passes", function() {
			const expected = {"forward any": 1, "derp 2": 1}
			player1.gainBusPass('forward any');
			player1.gainBusPass('derp 2');
			player1.gainBusPass('back 3');
			player1.gainBusPass('forward any');
			player1.useBusPass('back 3');
			player1.useBusPass('forward any');
			assert.deepEqual(expected, player1.busTickets)
		});

		it("should have all of the tickets expire", function() {
			const expected = {"forward expire": 1}
			player1.gainBusPass('forward any');
			player1.gainBusPass('derp 2');
			player1.gainBusPass('back 3');
			player1.gainBusPass('forward any');
			player1.useBusPass('back 3');
			player1.gainBusPass('forward expire');
			assert.deepEqual(expected, player1.busTickets);
			player1.gainBusPass('forward expire');
			assert.deepEqual(expected, player1.busTickets)
		});
	});

	describe("#specialCardTests", function() {
		it("should add all of the special cards", function() {
			player1.gainSpecialCard('just say no');
			player1.gainSpecialCard('get out of jail free');
			player1.gainSpecialCard('steal');
			player1.gainSpecialCard('just say no');
			assert(player1.specialCards.indexOf('just say no') > -1);
			assert(player1.specialCards.indexOf('steal') > -1);
			assert(player1.specialCards.indexOf('get out of jail free') > -1);
			assert.equal(4, player1.specialCards.length);
		});

		it("should remove all of the special cards", function() {
			player1.useSpecialCard('just say no');
			player1.useSpecialCard('get out of jail free');
			player1.useSpecialCard('steal');
			player1.useSpecialCard('just say no');
			assert.equal(-1, player1.specialCards.indexOf('just say no'));
			assert.equal(-1, player1.specialCards.indexOf('steal'));
			assert.equal(-1, player1.specialCards.indexOf('get out of jail free'));
			assert.equal(0, player1.specialCards.length);
		});
	});

	describe("#locationTest", function() {
		it("should move the player to the location with side effects", function() {
			let moveInfo = {"moneyGained": 299, "currentLocation": 'bob', "movedTo": []};
			player1.moveToLocation(moveInfo);
			assert.equal("bob", player1.location);
			assert.equal(300, player1.money);

			moveInfo["moneyGained"] = 0
			moveInfo["currentLocation"] = "dude";
			player1.moveToLocation(moveInfo);
			assert.equal("dude", player1.location);
			assert.equal(300, player1.money);
		});
	});

	describe("#propertyTests", function() {
		// TODO when Properties are tested to be correct, also test getNetWorth() inside this
	});
})