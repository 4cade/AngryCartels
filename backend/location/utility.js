const Property = require('./property');

/* Utility object stores the information about a utility location.
 * @param name String name of the location
 * @param boardPreset JSON with data loaded from the stored board
 */
class Utility extends Property {

    // set up initial state
    constructor(name, boardPreset) {
        super(name, boardPreset);

        // TODO decide if needs other features

    }

    /* Sees how much rent costs if this is landed on.
     * @param numOwned int of number of other railroads owned
     * 
     * @return int value
     */
    getRent(numOwned) {
        // TODO
    }
}


module.exports = Utility;