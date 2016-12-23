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
        // TODO
    }

    /* Removes a house from the total number of houses on the property.
     */
    removeHouse() {
        // TODO
    }

    /* Determines the total worth of this property (including houses)
     * 
     * @return int value
     */
    getValue() {
        // TODO
    }

    /* Sees how much rent costs if this is landed on.
     * @param monopoly boolean indicating if this is part of a monopoly
     * 
     * @return int value
     */
    getRent(monopoly) {
        // TODO
    }
}


module.exports = HouseProperty;