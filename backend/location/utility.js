const Property = require('./property');

/* Utility object stores the information about a utility location.
 * @param name String name of the location
 * @param boardPreset JSON with data loaded from the stored board
 */
class Utility extends Property {

    // set up initial state
    constructor(name, boardPreset) {
        super(name, boardPreset);
    }

    /* Sees how much rent costs if this is landed on.
     * @param numOwned int of number of other utilities owned
     * 
     * @return int value
     */
    getRent(numOwned, dice) {
        if (this.isMortgaged)
            return 0
        if(numOwned < 1)
            numOwned = 1
        if (numOwned > 8)
            numOwned = 8
        return this.rent[numOwned-1] * dice
    }
}

module.exports = Utility;