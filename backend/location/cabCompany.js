const Property = require('./property');

/* Cab object stores the information about a cab location.
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

    /* Adds a cab stand to the cab company.
     */
    addCabStand() {
        this.hasCabStand = true
    }

    /* Removes a cab stand from the cab company.
     */
    removeCabStand() {
        this.hasCabStand = false
    }

    /* Determines the total worth of this property (including cab stand)
     * 
     * @return int value
     */
    getValue() {
        let worth = 0

        if (this.isMortgages)
            worth += this.mortgage*2
        else
            worth += this.mortgage
        worth += this.houses * this.trainDepotPrice

        return worth
    }

    /* Sees how much rent costs if this is landed on.
     * @param numOwned int of number of other cab companies owned (0 < numOwned < 5)
     * 
     * @return int value
     */
    getRent(numOwned) {
        return numOwned * 25
    }
}


module.exports = CabCompany;