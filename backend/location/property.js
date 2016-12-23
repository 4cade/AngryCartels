const Place = require('./place');

/* Property object stores the information about a property.
 * @param name String name of the location
 * @param boardPreset JSON with data loaded from the stored board
 */
class Property extends Place {

    // set up initial state
    constructor(name, boardPreset) {
        super(name, boardPreset)

        this.color = boardPreset['quality'];
        this.rent = boardPreset['rent'];
        this.cost = boardPreset['price'];
        this.mortgage = boardPreset['mortgage'];

        this.owner = null;
        this.isMortgaged = false;
    }

    /* Sets the owner of the property to the owner.
     * @param owner the new owner of the property
     */
    setOwner(owner) {
        // TODO
    }

    /* Mortgages the property.
     */
    mortgage() {
        // TODO
    }

    /* Unmortgages the property.
     */
    unmortgage() {
        // TODO
    }

    /* Determines the total worth of the property, often overridden by child classes.
     * 
     * @return int value
     */
    getValue() {
        // TODO
    }

}


module.exports = Property;