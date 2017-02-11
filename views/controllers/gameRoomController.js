angryCartels.controller('gameRoomController', function($scope, $interval, socket) {
    $scope.hostingGame = false;
    $scope.gameGoing = false;
    $scope.inGame = null;
    $scope.username = "";
    $scope.joined = false;
	  // load initial games
	  // socket.emit('get games', {});
   //  socket.emit('get client name', {});

    // check for new games every 5 seconds
    // $interval(function() { if($scope.joined){socket.emit('get games', {});} }, 5000);
    $scope.joinSocket = function(username) {
      $scope.username = username
      socket.emit("join", {"username": $scope.username})
    }

  	// sends the message that the user wants to send
  	$scope.createGame = function() {
  		socket.emit('create game', {});
  		$scope.hostingGame = true;
      $scope.inGame = $scope.username;
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
      console.log('started');
    }

  	// gets a new games
    socket.on('updated games', function(games){
        $scope.games = games;
    });

    socket.on('kick game', function() {
      console.log("I got kicked yooo");
      $scope.inGame = null;
      $scope.hostingGame = false;
    });

    socket.on('in room', function(json) {
      $scope.inGame = true;
      $scope.owner = json.owner;
      if($scope.owner === $scope.username) {
        $scope.hostingGame = true;
      }
      console.log("I'm in a room");
    })

    socket.on('send client name', function(name) {
	  console.log('gameRoomcontroller send client name ' + name);
      $scope.username = name;
      $scope.joined = true;
      socket.emit('get games', {});
    });

    socket.on('start game', function() {
      $scope.gameGoing = true;
      console.log("game has started");
    });
});