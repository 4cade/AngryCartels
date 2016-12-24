const Property = require('./property');

/**
 * Cab object stores the information about a cab location.
 * @param name String name of the player
 * @param name String name of the location
 * @param boardPreset JSON with data loaded from the stored board
 */
class CabCompany extends Property {

    // set up initial state
    constructor(name, boardPreset) {
        super(name, boardPreset);

        this.hasCabStand = false;
        this.cabStandPrice = 150;
    }

    /**
     * Adds a cab stand to the cab company.
     */
    addCabStand() {
        if (!this.isMortgaged)
            this.hasCabStand = true
    }

    /**
     * Removes a cab stand from the cab company.
     */
    removeCabStand() {
        this.hasCabStand = false
    }

    /**
     * Determines the total worth of this property (including cab stand)
     * 
     * @return int value
     */
    getValue() {
        if (this.isMortgaged)
            return this.mortgageValue

        let worth = this.cost

        if (this.hasCabStand)
            worth += this.cabStandPrice

        return worth
    }

    /**
     * Sees how much rent costs if this is landed on.
     * @param numOwned int of number of other cab companies owned (0 < numOwned < 5)
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
        
        if (this.hasCabStand)
            amount *= 2

        return amount
    }
}


module.exports = CabCompany;