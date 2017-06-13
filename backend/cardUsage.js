const BoardManager = require('./boardManager');
const PlayerManager = require('./playerManager');
const Card = require('./card');

/**
 * CardUsage object handles how the player will react to the drawn card. 
 **/

 class CardUsage {

 	constructor(board, player) {
 		this.boardManager = board;
 		this.playerManager = player;
 	}

 	/**
 	 * Sets the player's new state after the bus pass is drawn
 	 * @param player object that is being affected
 	 * @param pass specific bus pass the player draws
 	 *
 	 * @return JSON with fields movedTo (list of locations visited), actions (list
     *       of actions that the player should perform), and player (JSON with name: name, money: money)
 	 **/
 	busPass(player, pass) {
 		passSplit = pass.split(" ");
 		if (passSplit[0] === 'forward') {
 			if (passSplit[1] === 'any') {
 				if (passSplit.length > 2 && passSplit[2] === 'expire') {
 					player.team.busTickets = {};
 				}
 				desiredLocation = playerInput()	;								// TODO : figure out a way to ask for player's input
 				json = this.boardManager.advanceToLocation(player, desiredLocation);
 			} else if (passSplit[1] === 'transit') {
 				nextTransit = this.boardManager.nextTransit(player);
 				json = this.boardManager.advanceToLocation(player, nextTransit);
 			} else if (Number.isInteger(passSplit[1])) {
 				num = Number.parseInt(passSplit[1]);
 				json = this.boardManager.moveLocation(player, num);
 			}
 		} else if (passSplit[0] === 'backward') {
 			player.switchDirection();
 			num = Number.parseInt(passSplit[1]);
 			json = this.boardManager.moveLocation(player, num);
 			player.switchDirection();
		}
		return json;
 	}

 	/**
 	 * If the card is keepable, the player chooses whether they want to
 	 * use or keep the card. If keep,the card will just move to it's
 	 * team's card pile. Else, calls the corresponding function depending
 	 * on the card's type.
 	 **/
	cards(player, card) {
		if (card['play'] === 'keep') {
			const choice = playerInput();									// keep or use
			if (choice === 'keep') {
				player.team.specialCards(card);
				const message = player.name + " kept the card they drew.";
				return message;
			}
		}
		if (card['type'] === 'advance') {
			return this.advanceCards(player, card['details']);
		} else if (card['type'] === 'pay') {
			return this.payCards(player, card['details'].split(" "));
		} else if (card['type'] === 'collect') {
			return this.collectCards(player, card['details'].split(" "));
		} else if (card['type'] === 'jail') {
			return this.jailCards(player, card['details']);
		} else if (card['type'] === 'move') {
			return this.moveCards(player, card['details']);
		}else if (card['type'] === 'changeLanes') {
			return this.changeLanesCards(player, card['details']);
		} else if (card['type'] === 'trip') {
			return this.tripCards(player, card['details']);
		}
	}


	/**********************************************************
	 *	METHODS FOR PLAYING A CARD
	 **********************************************************/

 	/**
 	 * Handles cards that advance the player to a location. The location
 	 *  could be a number steps away, a specific location, a nearest type
 	 *  of location. ex: 4 -or- 'railroad' -or- 'lombard st'
 	 **/
 	advanceCards(player, detail) {
 		let json = null;
 		let loc = null;
 		if (Number.isInteger(Number.parseInt(detail))) {
 			let num = Number.parseInt(detail);
 			let switched = false;
 			if (num < 0) {
 				player.switchDirection();
 				switched = true;
 				num = -1 * num;
 			}
 			json = this.boardManager.moveLocation(player, num);
 			if (switched) {
 				player.switchDirection();
 			}
 		} else if (detail === 'pay corner') {
 			if (player.track === 0) {
 				json = this.boardManager.advanceToLocation(player, 'bonus');
 			} else if (player.track === 1) {
 				json = this.boardManager.advanceToLocation(player, 'go');
 			} else if (player.track === 2) {
 				json = this.boardManager.advanceToLocation(player, 'payday');
 			}
 		} else if (detail === 'railroad') {
 			loc = this.boardManager.nextRailroad(player);
 			json = this.boardManager.advanceToLocation(player, loc);
 		} else if (detail === 'utility') {
 			loc = this.boardManager.nextUtility(player);
 			json = this.boardManager.advanceToLocation(player, loc);
 		}else if (detail.includes('tax refund')) {
 			json = this.boardManager.advanceToLocation(player, 'tax refund');
 			if (detail.includes('half')) {									// specific to c card "advance to tax refund"
 				player.collectFromPool(player, 0.5);
 				for (let opponent of this.playerManager.players) {
	 				player.deltaMoney(-num);
	 				opponent.deltaMoney(num);
	 			}
 			} else if (detail.includes('all')) {							// specific to c card "excellent accounting"
 				this.boardManager.collectFromPool(player, 1);
 			}
 		} else {
 			json = this.boardManager.advanceToLocation(player, detail);
 		} 
 		return json;
 	}

 	/**
 	 * Handles the card that charges a player. Player pays +int amount to
 	 *  the pool or each player. ex: 50 pool -or- 25 all
 	 **/
 	payCards(player, detail) {
 		const num = Number.parseInt(detail[0]);
 		let json = null;
 		if (detail[1] === 'pool') {
 			if (detail.length === 2) {
 				this.boardManager.payPool(player, num);
 			} else if (detail.length === 3 && detail[2] === 'vehicle') {	// specific to cc card "vehicle impounded"
 				this.boardManager.payPool(player, num);
 				this.boardManager.jumpToLocation(player, 'jail');
 				player.jailTurnsLeft = 1;
 			} else if (detail.length === 3 && detail[2] === 'taxes') {		// specific to c card "property taxes"
 				const count = player.team.unmortgagedProperties();
 				if (count > 0) {
 					this.boardManager.payPool(player, num * count);
 				}
 			}
 		} else if(detail[1] === 'all') {
 			for (let opponent of this.playerManager.turnOrder) {
 				player.deltaMoney(-num);
 				opponent.deltaMoney(num);
 			}
 		}
 		return json;
 	}

 	/**
 	 * Handles the card that collects from a player. Player collects +int
 	 *  amount from bank, each player. ex: 100 bank -or- 25 all
 	 **/
 	collectCards(player, detail) {
 		const num = Number.parseInt(detail[0]);
 		let json = null;
 		if (detail[1] === 'bank') {
 			player.deltaMoney(num);
 		} else if(detail[1] === 'all') {
 			for (let opponent of this.playerManager.turnOrder) {
 				player.deltaMoney(num);
 				opponent.deltaMoney(-num);
 			}
 		} else if (detail[0] === 'track') {									// specific to cc card "the insider's edge"
 			if (player.track[0] === 0) {
 				player.deltaMoney(250);
 			} else if (player.track[0] === 2) {
 				player.deltaMoney(-50);
 			}
 		}
 		return json;
 	}

 	/**
 	 * Handles the card that sends or takes a player out of jail.
 	 *  ex: out -or- go
 	 **/
 	jailCards(player, detail) {
 		let json = null;
 		if (detail === 'go') {
 			player.sendToJail();
 			json = this.boardManager.jumpToLocation(player, 'jail');
 		} else if (detail === 'out') {
 			player.leaveJail(false);
 		}
 		return json;
 	}

 	/**
 	 * Handles the card that says to move to a specified location that is
 	 * 	a location on the board. ex: lombard st -or- miami ave
 	 **/
 	moveCards(player, detail) {
 		let json = this.boardManager.jumpToLocation(player, detail);
 		return json;
 	}

 	/**
 	 * Handles the card that that says to change to the lane above or
 	 *  below. ex: above -or- below
 	 **/
 	changeLanesCards(player, detail) {
 		let loc = null;
 		let json = null;
 		if (detail === 'above') {
 			if (player.track !== 0) {
				loc = this.boardManager.nextTrackAbove(player);
				json = this.boardManager.jumpToLocation(player, loc);
			}
 		} else if (detail === 'below') {
 			if (player.track !== 2) {
				loc = this.boardManager.nextTrackBelow(player);
				json = this.boardManager.jumpToLocation(player, loc);
			}
 		}
 		return json;
 	}

 	/**
 	 * Handles the card that says to take a bus pass. Bus pass can
 	 *	only be collected. ex: 1 -or- 3
 	 **/
 	tripCards(player, detail) {
 		let num = Number.parseInt(detail);
 		if (num > 0) {
 			while (num != 0) {
				const pass = Card.drawBusPass();
				player.gainBusPass(pass);
 				num -= 1;
 			}
 		}
 	}
 }


 module.exports = CardUsage;