const Property = require('./property');

/* HouseProperty object stores the information about a property that can have houses.
 * @param name String name of the location
 * @param boardPreset JSON with data loaded from the stored board
 */
class HouseProperty extends Property {

    // set up initial state
    constructor(name, boardPreset) {
        super(name, boardPreset);

        this.houses = 0; // max is 6 (4 + 1 hotel + 1 skyscraper)
        this.housePrice = boardPreset['house'];

    }

    /* Adds a house to the total number of houses on the property.
     */
    addHouse() {
        this.houses += 1
    }

    /* Removes a house from the total number of houses on the property.
     */
    removeHouse() {
        this.houses -= 1
    }

    /* Determines the total worth of this property (including houses)
     * 
     * @return int value
     */
    getValue() {
        let worth = 0

        if this.isMortgages
            worth += this.mortgage*2
        else
            worth += this.mortgage
        worth += this.houses * this.housePrice

        return worth

    }

    /* Sees how much rent costs if this is landed on.
     * @param monopoly boolean indicating if this is part of a monopoly
     * 
     * @return int value
     */
    getRent(monopoly) {
        if monopoly
            return 2*this.rent
        else
            return this.rent
    }
}


module.exports = HouseProperty;