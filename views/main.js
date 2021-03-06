// create the module and name it angryCartels
var angryCartels = angular.module('angryCartels', ['ngRoute']);

// connect the socket so we can do cool stuff, will probably link this with logging in though
// var socket = io.connect();

// configure our routes
angryCartels.config(function($routeProvider, $locationProvider) {
	$routeProvider

		// route for the home page
		.when('/', {
			templateUrl : 'pages/home.html',
			controller  : 'homeController'
		})

		// route for the about page
		.when('/chat', {
			templateUrl : 'pages/chat.html',
			controller  : 'chatController'
		})

		// route for the gamerooms page
		.when('/gameroom', {
			templateUrl : 'pages/gameroom.html',
			controller  : 'gameRoomController'
		})

		// route for the game page
		.when('/game', {
			templateUrl : 'pages/game.html',
			controller  : 'gameController'
		});

		// use the HTML5 History API to get the pretty urls without a weird /#/ between relevant info
        $locationProvider.html5Mode(true);
});