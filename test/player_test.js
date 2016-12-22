const assert = require('assert');
const Player = require('../backend/player')

// tests the Player object
describe('Player', function() {

	const player1 = new Player('Bob', 'go', 1);

	describe("#initialize", function() {
		it("should have all correct parts correctly initialized", function() {
			assert.equal(player1.name, 'Bob');
			assert.equal(player1.money, 3200);
		})
	});

	describe("#propertyTests", function() {
		// TODO
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
		// TODO
	});

	describe("#specialCardTests", function() {
		// TODO
	});

	describe("#locationTests", function() {
		// TODO
	});

	// TODO more tests
})