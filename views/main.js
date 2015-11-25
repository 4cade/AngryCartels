// create the module and name it scotchApp
var angryCartels = angular.module('angryCartels', ['ngRoute']);
var socket = io.connect(); // connect the socket so we can do cool stuff

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

		// route for the contact page
		.when('/contact', {
			templateUrl : 'pages/contact.html',
			controller  : 'contactController'
		});
});