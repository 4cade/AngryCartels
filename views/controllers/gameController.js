angryCartels.controller('gameController', function($scope, $interval, socket) {
	$scope.gameData = {};
	$scope.actions = [];
	$scope.auctionPrice = 0;
	$scope.recentLocation = null;
	$scope.messages = [];

	// socket.emit('get client name', {});
	// socket.emit('request game data', {});

	// TODO investigate which of the $scope.$apply()s are needed
	// $interval(function() { if($scope.actions.length === 0 && $scope.gameGoing){socket.emit('get actions', {"player": $scope.username});} }, 5000);

	socket.on('game data', function(gameData) {
		// $scope.gameData = gameData;
		console.log("got game data");
		console.log(gameData)
		$scope.gameGoing = true;
		
		$scope.teams = gameData['playerManager']['teams']

		var play = gameData['playerManager']['players']
		for(var i in play) {
			if($scope.teams[play[i].team].hasOwnProperty('players')) {
				$scope.teams[play[i].team]['players'].push(play[i]);
			}
			else {
				$scope.teams[play[i].team]['players'] = [play[i]];
			}

			if(play[i].name === $scope.username) {
				$scope.actions = play[i].actions;
			}
		}

		$scope.currentPlayer = play[gameData['playerManager']['turnIndex']].name;
		// $scope.setup();
	});

	socket.on('next turn', function(json) {
		console.log(json);
		$scope.currentPlayer = json.player
		$scope.message = json.message
		$scope.messages.push($scope.message);
		if(json.player === $scope.username) {
			$scope.actions = json.actions;
		}
	})

	socket.on('movement', function(json) {
		// TODO update locations of players on board
		console.log(json);
		$scope.message = json.message
		$scope.messages.push($scope.message);
		$scope.recentLocation = json.movedTo.slice(-1)[0];

		for(let tname in $scope.teams) {
			let team = $scope.teams[tname]
			for(let index in team.players) {
				let player = team.players[index]
				if(player.name === json.player.name) {
					player.location = $scope.recentLocation;
					team.money = json.player.money
				}
			}
		}

		if(json.player.name === $scope.username) {
			$scope.actions = json.actions;
		}
	});


	socket.on('property bought', function(json) {
		$scope.message = json.message
		$scope.messages.push($scope.message);

		for(let tname in $scope.teams) {
			let team = $scope.teams[tname]
			for(let index in team.players) {
				let player = team.players[index]
				if(player.name === json.player.name) {
					team.properties.push(json.location)
					team.money = json.player.money
				}
			}
		}

		if(json.player.name === $scope.username) {
			$scope.actions = json.actions;
		}
	});

	socket.on('special card', function(json) {
		$scope.message = json.message
		$scope.messages.push($scope.message);

		for(let tname in $scope.teams) {
			let team = $scope.teams[tname]
			for(let index in team.players) {
				let player = team.players[index]
				if(player.name === json.player.name) {
					if(team.specialCards[json.card]) {
						team.specialCards[json.card] += 1
					}
					else {
						team.specialCards[json.card] = 1
					}
				}
			}
		}

		if(json.player.name === $scope.username) {
			$scope.actions = json.actions;
		}
	})

	socket.on('draw bus pass', function(json) {
		$scope.message = json.message
		$scope.messages.push($scope.message);

		for(let tname in $scope.teams) {
			let team = $scope.teams[tname]
			for(let index in team.players) {
				let player = team.players[index]
				if(player.name === json.player.name) {
					if(team.busTickets[json.card]) {
						team.busTickets[json.card] += 1
					}
					else {
						team.busTickets[json.card] = 1
					}
				}
			}
		}

		if(json.player.name === $scope.username) {
			$scope.actions = json.actions;
		}
	})

	socket.on('send client name', function(name) {
		$scope.username = name;
		$scope.joined = true;
	});

	socket.on('property info', function(info) {
		$scope.propertyInfo = info;
	});

	socket.on('rent info', function(info) {
		$scope.rentCost = info;
	});

	socket.on('highest rent', function(info) {
		$scope.propertyInfo = info;
	});

	socket.on('all locations', function(locations) {
		$scope.locationList = locations;
	});

	socket.on('all unowned', function(locations) {
		$scope.locationList = locations;
	});

	socket.on('actions', function(json) {
		console.log('action', json)
		$scope.actions = json.actions;
	});

	socket.on('new auction', function(info) {
		$scope.propertyInfo = info;
		$scope.auction = {};
		$scope.actions.unshift('auction');
		$scope.notSentAuctionPrice = true;
	});

	socket.on('new auction price', function(info) {
		$scope.auction[info.player] = info.price;
	});

	socket.on('auction winner', function(winner) {
		$scope.auction = {};
		if(winner.player === $scope.username) {
			$scope.winAuction($scope.recentLocation, winner.price);
		}
	})

	// load players names
	$scope.players = $scope.gameData["players"];

	// load all of the gameData info into the scope nicely
	// $scope.setup = function() {
	// 	$scope.players = $scope.gameData["players"];
	// 	$scope.currentTurn = $scope.gameData['turnOrder'][$scope.gameData['turnIndex']];
	// 	$scope.canRoll = $scope.gameData["canRoll"];
	// 	$scope.recentLocation = $scope.gameData["recentLocation"];
	// }

	$scope.doAction = function(action) {
		if(action === 'roll') {
			$scope.rollDice();
		}
		else if(action === 'trade') {
			// TODO make trade menu
		}
		else if(action === 'build') {
			// TODO make build menu
		}
		else if(action === 'end turn') {
			$scope.endTurn();
		}
		else if(action === 'buy') {
			$scope.buyProperty();
		}
		else if(action === 'mrmonopoly') {
			$scope.startMrMonopoly();
		}
		else if(action === 'rent') {
			$scope.payRent();
		}
		else if(action === 'draw fortune') {
			socket.emit('draw fortune', {})
		}
		else if(action === 'draw misfortune') {
			socket.emit('draw misfortune', {})
		}
		
		$scope.actions = [];
	}

	$scope.rollDice = function() {
		socket.emit('roll', {});
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

	$scope.payRent = function() {
		socket.emit('rent', {});
	}

	$scope.buyProperty = function() {
		var info = {};
		info.location = $scope.recentLocation;
		info.player = $scope.username;
		socket.emit('buy', info);
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
	}

	$scope.winAuction = function(property, price) {
		var info = {};
		info.property = property;
		info.player = $scope.username;
		info.auction = true;
		info.price = price;
		socket.emit('buy', info);
	}

	$scope.startMrMonopoly = function() {
		socket.emit('mrmonopoly', {});
	}

	$scope.startAction = function() {
		var action = $scope.actions[0];

		if(action === 'buy' || action === 'auction') {
			socket.emit('property info', $scope.recentLocation);
		}
		else if(action === 'mrmonopoly' || action === 'community chest' || action === 'chance') {
			// don't need to do anything because acts upon button press
		}
		else if(action === 'rent') {
			socket.emit('rent info', $scope.recentLocation);
		}
		else if(action === 'subway') {
			socket.emit('all locations', {});
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
	// $scope.finishAction = function() {
	// 	$scope.actions = $scope.actions.splice(1);
	// 	$scope.canAct = true;
	// }

	$scope.startTrade = function() {
		// TODO set it up to give options by selecting player first and stuffsssss
	}

	// $scope.$watch('actions', function() {
	// 	// TODO deal with changes to the actions
	// 	if($scope.canAct) {
	// 		$scope.startAction();
	// 	}
	// });

});
