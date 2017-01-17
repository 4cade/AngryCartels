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

        if(boardPreset['snapshot']) {
            this.hasTrainDepot = boardPreset['hasTrainDepot'];
            this.trainDepotPrice = boardPreset['trainDepotPrice'];
        }
        else {
            this.hasTrainDepot = false;
            this.trainDepotPrice = 100;            
        }

    }

    /**
     * Turns the Railroad into a reloadable JSON representation
     * @return JSON version of this object
     */
    toJSON() {
        let oldJSON = super.toJSON();
        let newJSON = {"hasTrainDepot": this.hasTrainDepot, "trainDepotPrice": this.trainDepotPrice};
        return Object.assign(oldJSON, newJSON);
    }

    /*
     * Mortgages the property.
     *
     * @return boolean true if property becomes isMortgaged, false if property already isMortgaged
     */
    mortgage(){
        if (!this.hasTrainDepot)
            return super.mortgage()
        else
            return false
    }

    /**
     * Adds a train depot to the railroad.
     *
     * @return boolean true if property addTrainDepot, false if property can not addTrainDepot because it isMortgaged
     */
    addTrainDepot() {
        if (!this.isMortgaged && !this.hasTrainDepot){
            this.hasTrainDepot = true
            return true
        }
        else
            return false
    }

    /**
     * Removes a train depot from the railroad.
     *
     * @return boolean true if property removeTrainDepot, false if property does not hasTrainDepot to remove
     */
    removeTrainDepot() {
        if (this.hasTrainDepot){
            this.hasTrainDepot = false
            return true
        }
        else
            return false
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