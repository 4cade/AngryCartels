angryCartels.controller('chatController', function($scope) {
	// create a message to display in our view
	$scope.message = 'Enjoy the fun game!';
	$scope.messages = [];

  	// sends the message that the user wants to send
  	$scope.sendNewMessage = function() {
  		socket.emit('chat message', $scope.userMessage);
  		$scope.userMessage = "";
  	}
  	// gets a new chat message
    socket.on('chat message', function(msg){
        $scope.messages.push(msg);
        $scope.$apply();
    });
    $scope.increment = function() {
        socket.emit("increment", {"add": 1});
    }
});