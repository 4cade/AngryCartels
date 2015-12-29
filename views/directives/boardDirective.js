angryCartels.directive('board', function($window) {
	return {
		restrict: "EA",
		controller: "boardController",
		templateUrl: '/pages/board.html',
		link: function(scope, elementm, attrs) {
			//$window.onload = function() {
		      var canvas = document.getElementById('dude');
		      var ctx = canvas.getContext('2d');
		      var startX = 40;
		      var startY = 40;
		      var imgWidth = 500;
		      var imgHeight = 500;
		      // Create an image from scratch
		      var img = new Image();
		      // Ensure the image has loaded before calling drawImage()
		      img.onload = function() {
		        canvas.width = img.width;
		        canvas.height = img.height;
		        ctx.drawImage(img, 0, 0, 750, 750);
		        console.log("The image was drawn!");
		      };
		      // Set source path
		      img.src = 'img/game_board.jpg';
		      setTimeout(function () {
			        // Moves the path to the specified point on the canvas, (40, 40), without creating a line
				      ctx.moveTo(40, 40);
				      // Adds a new point at (100, 100) and creates a line TO that point FROM the last specified point in the canvas, (40, 40) in this case
				      ctx.lineTo(100, 100);
				      // Actually draws the path that was defined
				      ctx.stroke();
				      console.log("The line was drawn!");
				      // Draw a filled blue rectangle with dimension 25 by 25
				      ctx.fillStyle = "blue";
				      ctx.fillRect(100, 100, 25, 25);
				      console.log("The rectangle was drawn!");
			    }, 500);
		      
		    //};
		}
	}
});