angryCartels.directive('board', function($window) {
    return {
        restrict: "EA",
        controller: "boardController",
        templateUrl: '/pages/board.html',
        link: function(scope, element, attrs) {
            var canvas = document.getElementById('testCanvas');
            var ctx = canvas.getContext('2d');
            var startX = 0;
            var startY = 0;
            var imgWidth = 850;
            var imgHeight = 850;
            // Create an image from scratch
            var img = new Image();
            // Ensure the image has loaded before calling drawImage()
            img.onload = function() {
                canvas.width = imgWidth;
                canvas.height = imgHeight;
                ctx.drawImage(img, startX, startY, imgWidth, imgHeight);
                console.log("The image was drawn!");
            };
            // Set source path
            img.src = 'img/game_board.jpg';
            // Draw 8 player icons on the starting location
            setTimeout(function () {
                // Temporarily use rectangles to represent players
                ctx.fillStyle = "#0000FF"; //blue
                ctx.fillRect(812, 812, 6, 6);
                ctx.fillStyle = "#800080"; //purple
                ctx.fillRect(821, 812, 6, 6);
                ctx.fillStyle = "#008000"; //green
                ctx.fillRect(830, 812, 6, 6);
                ctx.fillStyle = "#FF00FF"; //magenta
                ctx.fillRect(812, 821, 6, 6);
                ctx.fillStyle = "#000000"; //black
                ctx.fillRect(821, 821, 6, 6);
                ctx.fillStyle = "#FFA500"; //orange
                ctx.fillRect(830, 821, 6, 6);
                ctx.fillStyle = "#6F4E37"; //red
                ctx.fillRect(812, 830, 6, 6);
                ctx.fillStyle = "#FF0000"; //coffee brown
                ctx.fillRect(821, 830, 6, 6);
                console.log("The rectangles were drawn!");
            }, 500);
        }
    }
});