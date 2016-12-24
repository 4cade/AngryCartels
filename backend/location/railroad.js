const Property = require('./property');

/**
 * Railroad object stores the information about a railroad location.
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

    /**
     * Adds a train depot to the railroad.
     */
    addTrainDepot() {
        if (!this.isMortgaged)
            this.hasTrainDepot = true
    }

    /**
     * Removes a train depot from the railroad.
     */
    removeTrainDepot() {
        this.hasTrainDepot = false
    }

    /**
     * Determines the total worth of this property (including train depot)
     * 
     * @return int value
     */
    getValue() {
        if (this.isMortgaged)
            return this.mortgageValue

        let worth = this.cost

        if (this.hasTrainDepot)
            worth += this.trainDepotPrice

        return worth
    }

    /**
     * Sees how much rent costs if this is landed on.
     * @param numOwned int of number of other railroads owned (0 < numOwned < 5)
     * 
     * @return int value
     */
    getRent(numOwned) {
        if (this.isMortgaged)
            return 0
        if (numOwned < 1)
            numOwned = 1
        if (numOwned > 5)
            numOwned = 4

        let amount = this.rent[numOwned-1]
        
        if (this.hasTrainDepot)
            amount *= 2

        return amount
    }
}


module.exports = Railroad;