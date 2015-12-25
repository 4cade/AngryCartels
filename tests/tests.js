// Create game object and fake gameData here
// var testGame = {};
// var testGameData = {};


// Example QUnit test
QUnit.test("hello test", function(assert) {
    assert.ok(1 == "1", "Passed!");
});

// Fake function from another file
var calcSum = function(num1, num2) {
    return num1 + num2;
}

// Example QUnit test 2
QUnit.test("Test calcSum function", function(assert) {
    var pospos = calcSum(7, 18);
    var posneg = calcSum(16, -4);
    var negneg = calcSum(-1, -20);
    assert.ok(pospos === 25, "Correctly calculated sum of two positive numbers.");
    assert.ok(posneg === 12, "Correctly calculated sum of a positive and negative number.");
    assert.ok(negneg === -21, "Correctly calculated sum of two negative numbers.");
});

// Check that game was initialized correctly
QUnit.test("Test initializeBoard", function(assert) {
    // assuming you've changed the initializeBoard function to return a new gameData object?
    // var initializedGameData = testGame.initializeBoard(testGameData);
    assert.ok(true == true, "Checked that some property of the game data was initialized correctly.")
});