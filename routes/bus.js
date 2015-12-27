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

module.exports = bus;