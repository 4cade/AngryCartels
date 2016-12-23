const Property = require('./property');

/* Railroad object stores the information about a railroad location.
 * @param name String name of the player
 * @param name String name of the location
 * @param boardPreset JSON with data loaded from the stored board
 */
class Railroad extends Property {

    // set up initial state
    constructor(name, boardPreset) {
        super(name, boardPreset);

        this.hasTrainDepot = false;
        this.trainDepotPrice = 100;

    }

    /* Adds a train depot to the railroad.
     */
    addTrainDepot() {
        // TODO
    }

    /* Removes a train depot from the railroad.
     */
    removeTrainDepot() {
        // TODO
    }

    /* Determines the total worth of this property (including train depot)
     * 
     * @return int value
     */
    getValue() {
        // TODO
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


module.exports = Railroad;