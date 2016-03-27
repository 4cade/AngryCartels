angryCartels.controller('gameController', function($scope, $interval) {
	$scope.gameData = {};
	$scope.actions = [];
	$scope.auctionPrice = 0;
	socket.emit('get client name', {});
	socket.emit('request game data', {});

	// TODO investigate which of the $scope.$apply()s are needed

	socket.on('game data', function(gameData) {
		$scope.gameData = gameData;
		console.log("got game data");
		$scope.setup();
		$scope.$apply();
	});

	socket.on('movement', function(gameData) {
		// TODO update locations of players on board
		$scope.gameData = gameData;
		$scope.setup();
		$scope.message = "The dice that " + $scope.currentTurn + " rolled were " + gameData["rolled"];
		console.log("got move data");
		$scope.$apply();
	});

	socket.on('actions', function(actions) {
		$scope.actions.push.apply($scope.actions, actions); // extends the list
		console.log($scope.actions);
		$scope.$apply();
		// TODO carry out the actions and do associated requests
	});

	socket.on('property bought', function(gameData) {
		$scope.gameData = gameData;
		$scope.setup();
		$scope.message = gameData.message;
		$scope.finishAction();
		$scope.$apply();
		console.log($scope.currentTurn);
		console.log($scope.username);
		console.log($scope.currentTurn === $scope.username);
	});

	socket.on('send client name', function(name) {
		$scope.username = name;
		$scope.$apply();
	});

	socket.on('property info', function(info) {
		$scope.propertyInfo = info;
		$scope.$apply();
	});

	socket.on('rent info', function(info) {
		$scope.rentCost = info;
		$scope.$apply();
	});

	socket.on('highest rent', function(info) {
		$scope.propertyInfo = info;
		$scope.$apply();
	});

	socket.on('all locations', function(locations) {
		$scope.locationList = locations;
		$scope.$apply();
	});

	socket.on('all unowned', function(locations) {
		$scope.locationList = locations;
		$scope.$apply();
	});

	socket.on('new auction', function(info) {
		$scope.propertyInfo = info;
		$scope.auction = {};
		$scope.actions.unshift('auction');
		$scope.notSentAuctionPrice = true;
		$scope.$apply();
	});

	socket.on('new auction price', function(info) {
		$scope.auction[info.player] = info.price;
		$scope.$apply();
	});

	socket.on('auction winner', function(winner) {
		$scope.auction = {};
		if(winner.player === $scope.username) {
			$scope.winAuction($scope.recentLocation, winner.price);
		}
		$scope.$apply();
	})

	// load players names
	$scope.players = $scope.gameData["players"];

	// load all of the gameData info into the scope nicely
	$scope.setup = function() {
		$scope.players = $scope.gameData["players"];
		$scope.currentTurn = $scope.gameData['turnOrder'][$scope.gameData['turnIndex']];
		$scope.canRoll = $scope.gameData["canRoll"];
		$scope.recentLocation = $scope.gameData["recentLocation"];
		$scope.$apply();
	}

	$scope.rollDice = function() {
		socket.emit('roll', {});
	}

	$scope.assignOrder = function() {
		socket.emit('set order', {});
	}

	$scope.drawBusPass = function() {
		// TODO
	}

	$scope.drawChance = function() {
		// TODO
		socket.emit('draw chance', {});
	}

	$scope.drawCommunityChest = function() {
		// TODO
	}

	$scope.askBuyHouse = function() {
		// TODO
	}

	$scope.buyHouse = function(property) {
		// TODO
	}

	$scope.mortgage = function(property) {
		// TODO
	}

	$scope.buyProperty = function(property) {
		var info = {};
		console.log(property);
		info.property = property;
		info.player = $scope.username;
		info.auction = false;
		socket.emit('buy property', info);
	}

	$scope.selectLocation = function(location) {
		$scope.selectedLocation = location;
	}

	$scope.upForAuction = function(property) {
		// TODO make this the auctioned property for everyone (use scope.selectedLocation)
		socket.emit('up auction', property);
	}

	$scope.setAuctionPrice = function(price) {
		socket.emit('set auction price', price);
		$scope.notSentAuctionPrice = false;
		$scope.$apply();
	}

	$scope.winAuction = function(property, price) {
		var info = {};
		info.property = property;
		info.player = $scope.username;
		info.auction = true;
		info.price = price;
		socket.emit('buy property', info);
	}

	$scope.startMrMonopoly = function() {
		socket.emit('mrmonopoly', {});
	}

	$scope.startAction = function() {
		var action = $scope.actions[0];

		if(action === 'buy' || action === 'auction') {
			socket.emit('property info', $scope.recentLocation);
		}
		else if(action === 'mrmonopoly') {
			// don't need to do anything because acts upon button press
		}
		else if(action === 'rent') {
			socket.emit('rent info', $scope.recentLocation);
		}
		else if(action === 'subway') {
			socket.emit('all locations', {});
		}
		else if(action === 'chance') {
			// TODO
		}
		else if(action === 'community chest') {
			// TODO
		}
		else if(action === 'bus') {
			// TODO load bus passes
		}
		else if(action === 'auction choice') {
			$scope.setUnownedChoices();
		}
		else if(action === 'highest rent') {
			socket.emit('highest rent', {});
		}

		$scope.canAct = false;
		$scope.$apply();
	}

	$scope.endTurn = function() {
		socket.emit('end turn', {});
	}

	$scope.requestPropertyInfo = function(property) {
		socket.emit('property info', property);
	}

	$scope.setUnownedChoices = function() {
		socket.emit('all unowned', {});
	}

	// removes the first element of actions
	$scope.finishAction = function() {
		$scope.actions = $scope.actions.splice(1);
		$scope.canAct = true;
	}

	$scope.startTrade = function() {
		// TODO set it up to give options by selecting player first and stuffsssss
	}

	$scope.hasProperty = function(player) {
		return Object.keys(player.property).length > 0;
	}

	$scope.playerProperties = function(player) {
		return Object.keys(player.property);
	}

	// ugh idk why this needs to be a thing....
	$scope.auctionKeys = function() {
		return Object.keys($scope.auction);
	}

	$scope.$watch('actions', function() {
		// TODO deal with changes to the actions
		if($scope.canAct) {
			$scope.startAction();
		}
	});

});
