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

        if(boardPreset['snapshot']) {
            this.hasCabStand = boardPreset['hasCabStand'];
            this.cabStandPrice = boardPreset['cabStandPrice'];
        }
        else {
            this.hasCabStand = false;
            this.cabStandPrice = 150;
        }
    }

    /**
     * Turns the CabCompany into a reloadable JSON representation
     * @return JSON version of this object
     */
    toJSON() {
        let oldJSON = super.toJSON();
        let newJSON = {"hasCabStand": this.hasCabStand, "cabStandPrice": this.cabStandPrice};
        return Object.assign(oldJSON, newJSON);
    }

    /*
     * Mortgages the property.
     *
     * @return boolean true if property becomes isMortgaged, false if property already isMortgaged
     */
    mortgage(){
        if (!this.hasCabStand)
            return super.mortgage()
        else
            return false
    }

    /**
     * Adds a cab stand to the cab company.
     *
     * @return boolean true if hasCabStand becomes true, true if hasCabStand does not change
     */
    addCabStand() {
        if (!this.isMortgaged && !this.hasCabStand){
            this.hasCabStand = true
            return true
        }
        else
            return false
    }

    /**
     * Removes a cab stand from the cab company.
     *
     * @return boolean true if hasCabStand becomes false, false if does not hasCabStand
     */
    removeCabStand() {
        if (this.hasCabStand) {
            this.hasCabStand = false
            return true
        }
        else
            return false
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