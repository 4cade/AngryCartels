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
        this.hasTrainDepot = true
    }

    /* Removes a train depot from the railroad.
     */
    removeTrainDepot() {
        this.hasTrainDepot = false
    }

    /* Determines the total worth of this property (including train depot)
     * 
     * @return int value
     */
    getValue() {
        let worth = 0

        if (this.isMortgages)
            worth += this.mortgage*2
        else
            worth += this.cost

        if (this.hasTrainDepot)
            worth += this.trainDepotPrice

        return worth
    }

    /* Sees how much rent costs if this is landed on.
     * @param numOwned int of number of other railroads owned (0 < numOwned < 5)
     * 
     * @return int value
     */
    getRent(numOwned) {
        if (this.isMortgaged)
            return 0
        if (numOwned < 1)
            numOwned = 1
        let rent = this.rent[numOwned-1]
        
        if (this.hasTrainDepot)
            rent += this.trainDepotPrice

        return rent
    }
}


module.exports = Railroad;