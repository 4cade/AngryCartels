var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
var socket = require('./routes/socket.js')

// application -------------------------------------------------------------
app.use(express.static('views'))
    
app.all('/*', function ( req, res ) {
        res.sendFile(__dirname + '/views/index.html');
    })
app.on( 'error', function( error ){
       console.log( "Error: \n" + error.message );
       console.log( error.stack );
    });


// socket stuff
io.on('connection', socket);

// make the server start and listen
server.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Angry Cartels is running on port " + port);
});