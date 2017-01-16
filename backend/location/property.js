const Place = require('./place');

/**
 * Property object stores the information about a property.
 * @param name String name of the location
 * @param boardPreset JSON with data loaded from the stored board
 */
class Property extends Place {

    // set up initial state
    constructor(name, boardPreset) {
        super(name, boardPreset)

        this.group = boardPreset['quality'];
        this.rent = boardPreset['rent'];
        this.mortgageValue = boardPreset['mortgage'];
        this.cost = 2*this.mortgageValue
        this.owner = null;
        this.isMortgaged = false;
        this.isProperty = true;
    }

    /**
     * Turns the Property into a reloadable JSON representation
     * @return JSON version of this object
     */
    toJSON() {
        let json = super.toJSON();
        let other ={
            "group": this.group,
            "rent": this.rent,
            "mortgageValue": this.mortgageValue,
            "cost": this.cost,
            "owner": this.owner,
            "isMortgaged": this.isMortgaged
        }
        return Object.extend(json, other);
    }

    /**
     * Sets the owner of the property to the owner.
     * @param owner the new owner of the property
     * @return boolean true if new owner is set, false if owner is already the owner
     */
    setOwner(owner) {
        if (this.owner !== owner){
            this.owner = owner
            return true
        }
        else
            return false

    }

    /*
     * Mortgages the property.
     *
     * @return boolean true if property becomes isMortgaged, false if property already isMortgaged
     */
    mortgage() {
        if (!this.isMortgaged){
            this.isMortgaged = true
            return true
        }
        else
            return false
    }

    /**
     * Unmortgages the property.
     * 
     * @return boolean true if property becomes not isMortgages, false if property already not isMortgaged
     */
    unmortgage() {
        if (this.isMortgaged){
            this.isMortgaged = false
            return true
        }
        else
            return false
    }

    /**
     * Determines the total worth of the property, often overridden by child classes.
     * 
     * @return int value
     */
    getValue() {
        if (this.isMortgaged)
            return this.mortgageValue
        else
            return this.cost
    }

}


module.exports = Property;