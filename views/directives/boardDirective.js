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
            // Functions for getting and displaying mouse coordinates over canvas
            function getMousePosition(canvas, event) {
                var rectangle = canvas.getBoundingClientRect();
                return {
                    x: event.clientX - rectangle.left,
                    y: event.clientY - rectangle.top
                };
            }
            canvas.addEventListener('mousemove', function(event) {
                var mousePosition = getMousePosition(canvas, event);
                scope.$apply(function() {
                    scope.mouseX = mousePosition.x;
                    scope.mouseY = mousePosition.y;
                });
            });
        }
    }
});