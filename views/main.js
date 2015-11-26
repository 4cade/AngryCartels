// create the module and name it angryCartels
var angryCartels = angular.module('angryCartels', ['ngRoute']);

// connect the socket so we can do cool stuff, will probably link this with logging in though
var socket = io.connect();

// configure our routes
angryCartels.config(function($routeProvider) {
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

		// route for the contact page
		.when('/contact', {
			templateUrl : 'pages/contact.html',
			controller  : 'contactController'
		});
});