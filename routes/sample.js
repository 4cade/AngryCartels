var game = {players: 0};

var calcSum = function(num1, num2) {
    return num1 + num2;
}

game.addPlayer = function() {
    game.players += 1;
    return game.players;
}

var add5Players = function() {
    game.players += 5;
    return game.players;
}