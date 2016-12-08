var roll3 = {};

/**
* Simulates drawing a draw3 card.
* @return an array of 3 numbers [1,6] that the user needs to match with dice rolls
*/
roll3.draw = function() {
	var rollSet = new Set([1,2,3,4,5,6]);
	var nums = [];

	// get the first number
	var index = Math.floor(Math.random()*6);
	var drawn = Object.keys(rollSet)[index];

	rollSet.remove(drawn);
	nums.push(drawn);

	// get the second number from the remaining numbers
	index = Math.floor(Math.random()*5);
	drawn = Object.keys(rollSet)[index];

	rollSet.remove(drawn);
	nums.push(drawn);

	// get the third number from the remaining numbers
	index = Math.floor(Math.random()*4);
	drawn = Object.keys(rollSet)[index];

	rollSet.remove(drawn);
	nums.push(drawn);	

	// sort the list
	nums.sort();
	return nums;
};

module.exports = roll3;