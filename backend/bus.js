var board = require('./large_board.js');

var tickets = [
	"forward transit",
	"forward any",
	"forward any",
	"forward any",
	"forward any",
	"forward expire",
	"back 1",
	"back 2",
	"back 3",
	"forward 1",
	"forward 2",
	"forward 3"
];

var lines = {
	"outer top": ["pay day", "randolph st", "chance outer nw", "lake shore dr", "wacker dr",
					"michigan ave", "yellow cab co", "b&o railroad", "community chest outer north",
					"south temple", "west temple", "trash collector", "north temple", "temple square", "go to jail"],
	"outer right": ["go to jail", "south st", "broad st", "walnut st", "community chest outer east",
					"market st", "bus ticket east", "sewage system", "ute cab co", "birthday gift",
					"mulholland dr", "ventura blvd", "chance outer se", "rodeo dr", "subway"],
	"outer bottom": ["subway", "lake st", "community chest outer se", "nicollet ave", "hennepin ave",
					"bus ticket south", "checker cab co", "reading railroad", "esplanade ave",
					"canal st", "chance outer south", "cable company", "magazine st", "bourbon st", "holland tunnel sw"],
	"outer left": ["holland tunnel sw", "auction", "katy freeway", "westheimer rd", "internet service provider",
					"kirby dr", "cullen blvd", "chance outer west", "black & white cab co",
					"dekalb ave, community chest outer nw", "young int'l blvd", "decatur st",
					"peachtree st", "pay day"],
	"middle top": ["free parking", "kentucky ave", "chance middle north", "indiana ave", "illinois ave",
					"b&o railroad", "atlantic ave", "ventnor ave", "water works", "marvin gardens", "roll3"],
	"middle right": ["roll3", "pacific ave", "north carolina ave", "community chest middle east",
					"pennsylvania ave", "short line", "chance middle east", "park place", 
					"luxury tax", "boardwalk", "go"],
	"middle bottom": ["go", "mediterranean ave", "community chest middle south", "baltic ave",
					"income tax", "reading railroad", "oriental ave", "chance middle south",
					"vermont ave", "connecticut ave", "jail"],
	"middle left": ["jail", "st charles pl", "electric company", "states ave", "virginia ave",
					"pennsylvania railroad", "st james pl", "community chest middle west",
					"tennessee ave", "new york ave", "free parking"],
	"inner top": ["stock exchange", "wall st", "tax refund", "gas company", "chance inner ne",
					"florida ave", "holland tunnel ne"],
	"inner right": ["holland tunnel ne", "miami ave", "biscayne ave", "short line",
					"reverse", "lombard st", "squeeze play"],
	"inner bottom": ["squeeze play", "the embarcadero", "fisherman's wharf", "telephone company",
					"community chest inner sw", "beacon st", "bonus"],
	"inner left": ["bonus", "boylston st", "newbury st", "pennsylvania railroad", "fifth ave",
					"madison ave", "stock exchange"]
}

var bus = {};

/**
* Simulates drawing a bus pass card.
* @return a String representing a bus pass
*/
bus.getBusPass = function() {
	var index = Math.floor(Math.random()*tickets.length);
	return tickets[index];
}

/**
* Gets all of the properties forward on this side of the board.
* @param property the name of the property that is the current location
* @param forward boolean that is true if the player is moving forward
* @return list of the properties in the forward direction
*/
bus.getForward = function(property, forward) {
	var side = board[property]["side"];
	// we know the location on the side but not which side
	if(side === "edge") {
		var track = board[property]["track"];

		// check all the edges and the property on the edge should match this one
		for(var key in Object.keys(lines)) {
			if(forward) {
				// this means it will be at the beginning of the list
				if(lines[key][0] === property) {
					// return the properties excluding this one
					return lines[key].slice(1);
				}
			}
			else {
				// the property will be at the end of the list]
				var lastIndex = lines[key].length-1;
				if(lines[key][lastIndex] === property) {
					// take off property and properties need to be in the reverse order
					return lines[key].slice(0, lastIndex).reverse();
				}
			}
		}
		
	}
	// we know exactly which side it is just not the location
	else {
		var lineString = board[property]["track"] + " " + board[property]["side"];
		properties = lines[lineString];

		// different order if forward and back
		if(forward) {
			for(var i = 0; i < properties.length; i++) {
				// if the current property is at that index, return all of the ones after
				if(properties[i] === property) {
					return lines[key].slice(i+1);
				}
			}
		}
		else {
			for(var i = properties.length-1; i >= 0; i--) {
				// if the current property is at that index, return all of the ones before and reverse to match direction
				if(properties[i] === property) {
					return lines[key].slice(0, i).reverse();
				}
			}
		}
	}
}

/**
* Gets the name of the transit station for the player
* @param property the name of the property that is the current location
* @param forward boolean that is true if the player is moving forward
* @return String of the name of the transit station, if returns null something really went wrong
*/
bus.getNextTransit = function(property, forward) {
	var properties = bus.getForward(property, forward);

	// there are railroads on at least every 2 sides so try one side first, then try other side
	var railroad = getRailroad(properties);

	// try again
	if(!railroad) {
		properties = bus.getForward(properties[properties.length-1]);
		railroad = getRailroad(properties);
	}

	// if get to this point then it means we were on a side without a railroad or started past a railroad on the current side
	if(!railroad) {
		properties = bus.getForward(properties[properties.length-1]);
		railroad = getRailroad(properties);
	}

	return railroad;
}

/**
* Gets a railroad out of a list of properties
* @param properties a list of property names
* @return null if no railroad in the list, otherwise a railroad
*/
var getRailroad = function(properties) {
	// check entire list
	for(var i = 0; i < properties.length; i++) {
		if(properties[i].contains("railroad")) {
			return properties[i];
		}
	}
	// did not get one
	return null;
}

module.exports = bus;
