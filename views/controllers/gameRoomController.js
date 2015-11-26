angryCartels.controller('gameRoomController', function($scope, $interval) {
    $scope.hostingGame = false;
    $scope.inGame = null;
    $scope.clientName = null;
	  // load initial games
	  socket.emit('get games', {});
    socket.emit('get client name', {});
    // check for new games every 5 seconds
    $interval(function() { socket.emit('get games', {}); }, 5000);

  	// sends the message that the user wants to send
  	$scope.createGame = function() {
  		socket.emit('create game', {});
  		$scope.hostingGame = true;
      $scope.inGame = $scope.clientName;
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
      $scope.hostingGame = false;
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
      console.log("I got kicked yooo");
      $scope.inGame = null;
      $scope.hostingGame = false;
      $scope.$apply();
    });

    socket.on('send client name', function(name) {
      $scope.clientName = name;
    })
});