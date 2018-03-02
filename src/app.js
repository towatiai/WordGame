var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var game = require('./game');

var Game = new game.Game();

var users = []

function removeUser(id) {
    for(let i = 0; i < users.length; i++) {
        if(users[i]['id'] == id) users.splice(i, 1);
    }
}
function findUser(id) {
    for(let i = 0; i < users.length; i++) {
        if(users[i]['id'] == id) return true;
    }
    return false;
}


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    socket.on('join', function(user) {
        if(!findUser(socket.id)) {
            console.log(user + ' joined!');
            users.push({'user': user, 'id': socket.id});
            io.emit('lobby-update', JSON.stringify(users));
        }
        else console.log("User has already joined");
    });
    socket.on('disconnect', function() {
        removeUser(socket.id);
        console.log(JSON.stringify(users));
        io.emit('lobby-update', JSON.stringify(users));
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});