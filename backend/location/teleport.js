const Place = require('./place');

/**
* Place Object stores info about a place to collect items like money
* @param name String name of the location
* @param boardPreset JSON with data loaded from the stored board
**/

class Teleport extends Place{

	//set up initial state
	constructor(name, boardPreset){
		super(name, boardPreset)

		this.teleport = boardPreset["teleport"];
	}

	/**
	* Gets the location teleported to.
	* @param land boolean true if player has no more steps, false if can continue
	* @return string location to teleport to
	**/
	getLocation(land){
		if (land){
			return this.teleport[0]
		}
		else{
			return this.name
		}
	}

	/**
	* Gets track of location teleported to
	* @param
	* 
	**/
	getTrack(land){
		if (land){
			return this.teleport[1][0]
		}
		else{
			return this.track[0]
		}
	}

}

module.exports = Teleport;