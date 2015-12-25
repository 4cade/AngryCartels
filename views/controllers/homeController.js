angryCartels.controller('homeController', function($scope) {
	// create a message to display in our view
	$scope.message = 'Enjoy the fun game!';
	$scope.username = "testuser";
	$scope.name = "Test User";
	$scope.stats = {
		gamesPlayed: 0,
		wins: 0,
		losses:0
	};
	$scope.friendList = [];
	$scope.friends = 0;
});