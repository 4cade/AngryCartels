angryCartels.controller('gameRoomController', function($scope) {
    $scope.hostingGame = false;

	  // create a message to display in our view
	  $scope.games = {};
    socket.emit('get games', {});

  	// sends the message that the user wants to send
  	$scope.createGame = function() {
  		socket.emit('create game', {});
  		$scope.hostingGame = true;
  	}

    $scope.joinGame = function(host) {
      socket.emit('join game', host);
      $scope.inGame = host;
    }

    $scope.leaveGame = function() {
      socket.emit('leave game', $scope.inGame);
      $scope.inGame = null;
    }

    $scope.stopHosting = function() {
      socket.emit('stop hosting game', $scope.inGame);
      $scope.inGame = null;
    }

    $scope.startGame = function() {
      socket.emit('start game', $scope.inGame);
    }

  	// gets a new games
    socket.on('updated games', function(games){
        $scope.games = games;
        $scope.$apply();
    });

    socket.on('kick game', function() {
      $scope.inGame = null;
      $scope.hostingGame = false;
    })
});