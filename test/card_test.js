const assert = require('assert');
const Player = require('../backend/player');
const CardUsage = require('../backend/cardUsage');
const Game = require('../backend/game');
const BoardManager = require('../backend/boardManager');
const PlayerManager = require('../backend/playerManager');
const board = require('../backend/config/large_board')

//test the card usage object
describe('Card', function() {
	const playerList = ["Bob", "Jerry", "Guy"];
	const boardManager = new BoardManager(board);
	const playerManager = new PlayerManager(playerList, 'go', 1);
	const players = playerManager.turnOrder;
	const cardUsage = new CardUsage(boardManager, playerManager);

	describe('#advance type cards', function() {
		it('to (+/-)int spaces away ', function() {
			const c1 = {
						"type": "advance",
						"details": "3",
						};
			cardUsage.cards(players[1], c1);
			assert.equal(players[1].location, 'baltic ave');
			assert(players[1].forward);

			const c2 = {
						"type": "advance",
						"details": "-3",
						};
			cardUsage.cards(players[1], c2);
			assert.equal(players[1].location, 'go');
			assert(players[1].forward);
		});

		it('to specified location', function() {
			const c1 = {
						"type": "advance",
						"details": "atlantic ave",
						};
			cardUsage.cards(players[1], c1);
			assert.equal(players[1].location, 'atlantic ave');

			const c2 = {
						"type": "advance",
						"details": "go",
						};
			cardUsage.cards(players[1], c2);
			assert.equal(players[1].location, 'go');
		});

		it('to nearest location', function() {
			const c1= {
						"type": "advance",
						"details": "railroad",
						};
			assert.equal(players[1].location, 'go');
			const json = cardUsage.cards(players[1], c1);
			assert.equal(players[1].location, 'reading railroad');

			const c2 = {
						"type": "advance",
						"details": "utility",
						};
			cardUsage.cards(players[1], c2);
			assert.equal(players[1].location, 'cable company');
		});
	});

	describe('#pay type cards', function() {
		it('int amount to pool', function() {
			assert.equal(players[0].getMoney(), 3200);
			assert.equal(players[1].getMoney(), 3600);
			assert.equal(players[2].getMoney(), 3200);

			const c1= {
						"type": "pay",
						"details": "50 pool",
						};		
			cardUsage.cards(players[1], c1);
			assert.equal(players[1].getMoney(), 3550);
			assert.equal(boardManager.pool, 50);

			const c2= {
						"type": "pay",
						"details": "1000 pool",
						};		
			cardUsage.cards(players[1], c2);
			assert.equal(players[1].getMoney(), 2550);
			assert.equal(boardManager.pool, 1050);
		});

		it('int amount to each player', function() {
			const c1 = {
						"type": "pay",
						"details": "10 all",
						};
			cardUsage.cards(players[1], c1);
			assert.equal(players[1].getMoney(), 2530);
			assert.equal(players[2].getMoney(), 3210);
			assert.equal(players[0].getMoney(), 3210);

			const c2 = {
						"type": "pay",
						"details": "100 all",
						};
			cardUsage.cards(players[1], c2);
			assert.equal(players[1].getMoney(), 2330);
			assert.equal(players[2].getMoney(), 3310);
			assert.equal(players[0].getMoney(), 3310);
		});
	});

	describe('#collect type cards', function() {
		it('int amount from bank', function() {
			const c1 = {
						"type": "collect",
						"details": "50 bank",
						};
			cardUsage.cards(players[1], c1);
			assert.equal(players[1].getMoney(), 2380);

			const c2 = {
						"type": "collect",
						"details": "1000 bank",
						};
			cardUsage.cards(players[1], c2);
			assert.equal(players[1].getMoney(), 3380);
		});

		it('int amount from each player', function() {
			const c1 = {
						"type": "collect",
						"details": "10 all",
						};
			cardUsage.cards(players[1], c1);
			assert.equal(players[1].getMoney(), 3400);
			assert.equal(players[2].getMoney(), 3300);
			assert.equal(players[0].getMoney(), 3300);

			const c2 = {
						"type": "collect",
						"details": "100 all",
						};
			cardUsage.cards(players[1], c2);
			assert.equal(players[1].getMoney(), 3600);
			assert.equal(players[2].getMoney(), 3200);
			assert.equal(players[0].getMoney(), 3200);
		});

		it('amount dependent on track', function() {
			const c1 = {
						"type": "collect",
						"details": "track",
						};
			assert.equal(players[1].getMoney(), 3600);
			assert.equal(players[1].track[0], 2);
			cardUsage.cards(players[1], c1);
			assert.equal(players[1].getMoney(), 3550);
		});
	});

	describe('#jail type cards', function() {
		it('go to jail', function() {
			const c1 = {
						"type": "jail",
						"details": "go",
						};
			cardUsage.cards(players[1], c1);
			assert.equal(players[1].jailTurnsLeft, 3);
			assert.equal(players[1].location, 'jail');
		});

		it('get out of jail', function() {
			const c1 = {
						"type": "jail",
						"details": "out",
						};
			cardUsage.cards(players[1], c1);
			assert.equal(players[1].jailTurnsLeft, 0);
			assert.equal(players[1].location, 'jail');
			assert.equal(players[1].getMoney(), 3550);
		});
	});

	describe('#move type cards', function() {
		it('to specific location', function() {
			const c1 = {
						"type": "move",
						"details": "lombard st",
						};
			cardUsage.cards(players[1], c1);
			assert.equal(players[1].location, 'lombard st');

			const c2 = {
						"type": "move",
						"details": "jail",
						};
			cardUsage.cards(players[1], c2);
			assert.equal(players[1].location, 'jail');
		});
	});

	describe('#change lanes type cards', function() {
		it('to above lane', function() {
			const c1 = {
						"type": "changeLanes",
						"details": "above",
						};
			cardUsage.cards(players[1], c1);
			assert.equal(players[1].track, 0);
			assert.equal(players[1].location, 'bonus');

			const c2 = {
						"type": "changeLanes",
						"details": "above",
						};
			cardUsage.cards(players[2], c1);
			assert.equal(players[2].track, 0);
			assert.equal(players[2].location, 'squeeze play');
		});

		it('to below lane', function() {
			const c1 = {
						"type": "changeLanes",
						"details": "below",
						};
			cardUsage.cards(players[1], c1);
			assert.equal(players[1].track, 1);

			const c2 = {
						"type": "changeLanes",
						"details": "below",
						};
			cardUsage.cards(players[2], c1);
			assert.equal(players[2].track, 1);
		});
	});

	describe('#trip type cards', function() {
		it('take +int cards', function() {
			const c1 = {
						"type": "trip",
						"details": "1",
						};
			cardUsage.cards(players[1], c1);
			const json = players[1].team.busTickets
			assert.equal(Object.keys(json).length, 2);
		});
	});
})