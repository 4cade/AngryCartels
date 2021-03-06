const Place = require('./place');

/**
* Place Object stores info about a place to collect items like money
* @param name String name of the location
* @param boardPreset JSON with data loaded from the stored board
**/

class Collect extends Place{

	//set up initial state
	constructor(name, boardPreset){
		super(name, boardPreset)

		this.amount = boardPreset["amount"];
		this.gain = boardPreset["gain"];
	}

	/**
     * Turns the Collect into a reloadable JSON representation
     * @return JSON version of this object
     */
    toJSON() {
        let oldJSON = super.toJSON();
        let newJSON = {"amount": this.amount, "gain": this.gain};
        return Object.assign(oldJSON, newJSON);
    }

	/**
	* Gets the amount of money collected.
	* @param odd boolean true if player rolled an odd, false if even
	* @param land boolean true if player has no more steps, false if can continue
	* @return int amount of money collected
	**/
	getGain(odd, land){

		if (this.gain === "land/pass"){
			if (land){
				return this.amount[0]
			}
			else
				return this.amount[1]
		}

		else if (this.gain === "odd/even"){
			if (odd){
				return this.amount[0]
			}
			else
				return this.amount[1]
		}
	}

}

module.exports = Collect;