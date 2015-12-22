angryCartels.controller('chatController', function($scope) {

	// connect the socket so we can do cool stuff, will probably link this with logging in though
	var socket = io.connect();

	// create a message to display in our view
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
});