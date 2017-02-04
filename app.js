var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
var synchronizer = require('./backend/synchronizer');
var mongoose = require('mongoose');

// application -------------------------------------------------------------
app.use(express.static('views'))

// TODO account stuff, and client only connect to socket if logged in
    
app.all('/*', function ( req, res ) {
        res.sendFile(__dirname + '/views/index.html');
    })
app.on( 'error', function( error ){
       console.log( "Error: \n" + error.message );
       console.log( error.stack );
    });

// database setup
// mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/test');
// var db = mongoose.connection;
// db.on('error', function() {console.log('connection error'); });
// db.once('open', function (callback) {
//     console.log("database connected");
// });

// socket stuff
io.on('connection', function(socket) {synchronizer(io, socket);});

// make the server start and listen
server.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Angry Cartels is running on port " + port);
});