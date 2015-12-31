angryCartels.controller('gameController', function($scope, $interval) {
	$scope.gameData = {};
	socket.emit('request game data', {});

	// get the initial game data to populate stuff
	//$interval(function() { socket.emit('request game data', {}); }, 5000);

	socket.on('game data', function(gameData) {
		$scope.gameData = gameData;
	});

	socket.on('movement', function(gameData) {
		// TODO update locations of players
	});

	socket.on('actions', function(actions) {
		// TODO carry out the actions and do associated requests
	});

	// load players names
	$scope.players = $scope.gameData["players"];

});