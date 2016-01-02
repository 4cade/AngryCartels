angryCartels.controller('gameController', function($scope, $interval) {
	$scope.gameData = {};
	socket.emit('get client name', {});
	socket.emit('request game data', {});

	socket.on('game data', function(gameData) {
		$scope.gameData = gameData;
		console.log("got data");
		$scope.setup();
		$scope.$apply();
	});

	socket.on('movement', function(gameData) {
		// TODO update locations of players
		$scope.gameData = gameData;
		$scope.setup();
		console.log("got data");
		$scope.$apply();
	});

	socket.on('actions', function(actions) {
		// TODO carry out the actions and do associated requests
	});

	socket.on('send client name', function(name) {
		$scope.username = name;
		$scope.$apply();
	});

	// load players names
	$scope.players = $scope.gameData["players"];

	// load all of the gameData info into the scope nicely
	$scope.setup = function() {
		$scope.players = $scope.gameData["players"];
		$scope.currentTurn = $scope.gameData['turnOrder'][$scope.gameData['turnIndex']];
		$scope.canRoll = $scope.gameData["canRoll"];
		$scope.$apply();
	}

	$scope.rollDice = function() {
		socket.emit('roll', {});
	}

	$scope.assignOrder = function() {
		socket.emit('set order', {});
	}

	$scope.askBus = function() {
		// TODO
	}

	$scope.askBuyHouse = function() {
		// TODO
	}

	$scope.buyHouse = function() {
		// TODO
	}

	$scope.startAction = function() {
		// TODO
	}

	$scope.endTurn = function() {
		socket.emit('end turn', {});
	}

});