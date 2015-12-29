var board = require('./board.js');

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


var bus = {};

/**
* Simulates drawing a bus pass card.
* @return a String representing a bus pass
*/
bus.getBusPass = function() {
	var index = Math.floor(Math.random()*tickets.length);
	return tickets[index];
}

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

/**
* Gets all of the properties forward on this side of the board.
* @param property the name of the property that is the current location
* @param forward boolean that is true if the player is moving forward
* @return list of the properties in the forward direction
*/
bus.getForward = function(property, forward) {
	var lineString = board[property]["track"];
	// TODO
}































module.exports = bus;