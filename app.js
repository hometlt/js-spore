var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('assets'));



var Game = require('./api/game.js');


var c_game = new Game({width: 1000,height: 1000});


c_game.send = function(){
    var data = c_game.getInfo();
    io.emit('chat message',data);
};

//
//app.get('/', function(req, res){
//    res.sendFile(__dirname + '/index.html');
//});

io.on('connection', function(socket){

    //console.log('client connected');
//            agx.initGame(io, socket);


    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});