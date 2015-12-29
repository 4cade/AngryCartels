angryCartels.directive('board', function($window) {
    return {
        restrict: "EA",
        controller: "boardController",
        templateUrl: '/pages/board.html',
        link: function(scope, elementm, attrs) {
            var canvas = document.getElementById('testCanvas');
            var ctx = canvas.getContext('2d');
            var startX = 0;
            var startY = 0;
            var imgWidth = 1000;
            var imgHeight = 1000;
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
        }
    }
});