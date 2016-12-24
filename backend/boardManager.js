const Place = require('./location/place.js');
const HouseProperty = require('./location/houseProperty.js');
const Utility = require('./location/utility.js');
const Railroad = require('./location/railroad.js');

/**
 * Manages all of the locations on the board and the states associated with them.
 * @param rawBoard JSON that represents a board
 */
class BoardManager {
	constructor(rawBoard) {
		// TODO init stuff
		this.locations = {}
		this.propertySets = {}

		for(let name in rawBoard) {
			const loc = rawBoard[name];
			let loc_obj = null; // it will get reassigned in the if statements

			if (loc.type === 'property') {
				// TODO
			}
			else if (loc.type === 'railroad') {
				// TODO
			}
			else if (loc.type === 'cab') {
				// TODO
			}
			else if (loc.type === 'utility') {
				// TODO
			}
			else {
				// TODO
			}

			// TODO add to locations and make property sets
		}
	}
}


/**
 * Handles the state of a set of properties such as balancing houses, majority, and monopoly
 * @param index the index that any property added to this set has
 */
class PropertySet {
	constructor(index) {
		this.index = index;

		this.properties = [];
	}

	/**
	 * Adds the property to the set if it can be added
	 *
	 * @return true if it was added to the set
	 */
	addProperty(property) {
		// TODO
	}

	/**
	 * Makes a player own a property.
	 *
	 */
	newOwner(property, player) {
		// TODO
	}

	/**
	 * Check if a player has a majority of the properties.
	 * @return true if the player has a majority
	 */
	hasMajority(player) {
		// TODO
	}

	/**
	 * Check if a player has a monopoly of the properties.
	 * @return true if the player has a monopoly
	 */
	hasMonopoly(player) {
		// TODO
	}

	/**
	 * Adds a house to the property. If it is unbalanced then the houses will be balanced.
	 * @return true if the house was added
	 */
	addHouse(property) {
		// TODO
	}

	/**
	 * Makes sure that the balance of houses is maintained. Highest value properties are
	 * 		prioritized.
	 */
	rebalanceHouses() {
		// TODO
	}
}






this.exports = BoardManager;