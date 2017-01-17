const Property = require('./property');

/**
 * HouseProperty object stores the information about a property that can have houses.
 * @param name String name of the location
 * @param boardPreset JSON with data loaded from the stored board
 */
class HouseProperty extends Property {

    // set up initial state
    constructor(name, boardPreset) {
        super(name, boardPreset);

        if(boardPreset['snapshot']) {
            this.houses = boardPreset['houses'];
            this.housePrice = boardPreset['housePrice'];
        }
        else {
            this.houses = 0; // max is 6 (4 + 1 hotel + 1 skyscraper)
            this.housePrice = boardPreset['house'];
        }
    }

    /**
     * Turns the HouseProperty into a reloadable JSON representation
     * @return JSON version of this object
     */
    toJSON() {
        let oldJSON = super.toJSON();
        let newJSON = {"houses": this.houses, "housePrice": this.housePrice};
        return Object.assign(oldJSON, newJSON);
    }

    /*
     * Mortgages the property.
     *
     * @return boolean true if property becomes isMortgaged, false if property already isMortgaged
     */
    mortgage(){
        if (this.houses === 0)
            return super.mortgage()
        else
            return false
    }

    /**
     * Adds a house to the total number of houses on the property.
     *
     * @return boolean true is house increases by 1, false if house isMortgaged or if house has max amount of houses
     */
    addHouse() {
        if (!this.isMortgaged && this.houses < 6){
            this.houses += 1
            return true
        }
        else
            return false
    }

    /**
     * Removes a house from the total number of houses on the property.
     * 
     * @return boolean true if house decreases by 1, false if house can not removeHouse
     */
    removeHouse() {
        if (this.houses > 0){
            this.houses -= 1
            return true
        }
        else
            return false
    }

    /**
     * Determines the total worth of this property (including houses)
     * 
     * @return int value
     */
    getValue() {
        let worth = 0

        if (this.isMortgaged)
            worth += this.mortgage
        else
            worth += this.cost

        worth += (this.houses * this.housePrice)

        return worth
    }

    /**
     * Sees how much rent costs if this is landed on.
     * @param monopoly boolean indicating if this is part of a monopoly
     * 
     * @return int value
     */
    getRent(monopoly) {
        if (this.isMortgaged)
            return 0
        else if(monopoly && this.houses === 0)
            return 2*this.rent[this.houses]
        else
            return this.rent[this.houses]
    }
}


module.exports = HouseProperty;