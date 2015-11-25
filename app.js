var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);

// application -------------------------------------------------------------
/*  app.get('*', function(req, res) {
    res.sendFile(__dirname + '/views/index.html'); // load the single view file (angular will handle the page changes on the front-end)
  });*/

app.use(express.static('views'))
    // need to set all of the API calls here
app.all('/*', function ( req, res ) {
        res.sendFile(__dirname + '/views/index.html');
    })
app.on( 'error', function( error ){
       console.log( "Error: \n" + error.message );
       console.log( error.stack );
    });


// socket stuff
var count = 0;

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
  socket.on('increment', function(msg) {
  	count += msg.add;
  	console.log(count);
  	io.emit('chat message', 'count is now at ' + count);
  })
});

// make the server start and listen
server.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Angry Cartels is running on port " + port);
});