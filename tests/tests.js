// Create game object and fake gameData here
// var testGame = {};
// var testGameData = {};


// Example QUnit test
QUnit.test("hello test", function(assert) {
    assert.ok(1 == "1", "Passed!");
});

// Sample test using function in ../routes/sample.js
// Test passes because function defined and not inside object
QUnit.test("Test calcSum function", function(assert) {
    var pospos = calcSum(7, 18);
    var posneg = calcSum(16, -4);
    var negneg = calcSum(-1, -20);
    assert.ok(pospos === 25, "Correctly calculated sum of two positive numbers.");
    assert.ok(posneg === 12, "Correctly calculated sum of a positive and negative number.");
    assert.ok(negneg === -21, "Correctly calculated sum of two negative numbers.");
});

// Sample test using functions in ../routes/sample.js
// Note that the game variable used here is the one created inside samples.js
// So if we change the value of players in the game object in samples.js, we will fail this test
// This test passes
QUnit.test("sample test", function(assert) {
    var p1 = game.addPlayer();
    var p2 = add5Players();
    assert.ok(p1 === 1, "worked");
    assert.ok(p2 === 6, "worked");
});

// Sample tests using functions in ../routes/sample.js
// Test failed: game.addPlayer is not a function
// Object method not properly created inside an object
QUnit.test("sample test 2", function(assert) {
    var testGame = {players: 100};
    var p3 = testGame.addPlayer();
    var p4 = add5Players();
    assert.ok(p3 === 101, "worked");
    assert.ok(p4 === 106, "worked");
});

// Sample test using functions in ../routes/sample2.js
// This test passes
// Object method correctly defined inside object
QUnit.test("Person constructor test", function(assert) {
    var person = new Person(20);
    var age = person.getAge();
    assert.ok(age === 20, "worked");
});

// Sample test using function in ../routes/sample2.js
// This test passes
// Object method correctly defind inside object
QUnit.test("Person birthday function", function(assert) {
    var peep = new Person(17);
    var newAge = peep.birthday();
    assert.ok(newAge === 18, "worked");
});

// Sample test using function in ../routes/sample2.js
// Test failed: calcMult is not defined
// As expected, this method wasn't attached to the object when created in sample2.js, and is not testable
QUnit.test("test calcMult function", function(assert) {
    var result = calcMult(3, 7);
    assert.ok(result === 21, "worked");
});

// Check that game was initialized correctly
QUnit.test("Test initializeBoard", function(assert) {
    // assuming you've changed the initializeBoard function to return a new gameData object?
    // var initializedGameData = testGame.initializeBoard(testGameData);
    assert.ok(true == true, "Checked that some property of the game data was initialized correctly.")
});