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
     * @param numOwned int of number of other utilities owned
     * 
     * @return int value
     */
    getRent(numOwned) {
        // let dice = amount shown on dice
        if numOwned === 1
            return 4*dice
        else if numOwned === 2
            return 10*dice
        else if numOwned === 3
            return 20*dice
        else if numOwned === 4
            return 40*dice
        else if numOwned === 5
            return 80*dice
        else if numOwned === 6
            return 100*dice
        else if numOwned === 7
            return 120*dice
        else
            return 150*dice
    }


module.exports = Utility;