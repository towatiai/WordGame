var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Connceted users
var users = []

// Remove user by id
function removeUser(id) {
    for(let i = 0; i < users.length; i++) {
        if(users[i]['id'] == id) users.splice(i, 1);
    }
}

// Find wheter user with specified id exists
function findUser(id) {
    for(let i = 0; i < users.length; i++) {
        if(users[i]['id'] == id) return true;
    }
    return false;
}

// Serve the html page
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

// When a client connects
io.on('connection', function(socket){
    // When a client joins the lobby with a username
    socket.on('join', function(user) {
        if(!findUser(socket.id)) {
            console.log(user + ' joined!');
            // Add user to users list
            users.push({'user': user, 'id': socket.id});
            console.log(JSON.stringify(users));
            // Send update message to clients
            io.emit('lobby-update', JSON.stringify(users));
        }
        else console.log("User has already joined");
    });
    // When a client disconnects
    socket.on('disconnect', function() {
        // Remove the user from users list
        removeUser(socket.id);
        console.log(JSON.stringify(users));
        // Send update message to clients
        io.emit('lobby-update', JSON.stringify(users));
    });
    // When a user challenges another user
    socket.on('challenge', function(msg) {
        console.log("Challenge recieved, to; " + msg);
        // Send challenge to the user whom it concerns
        if(io.sockets.connected[msg]) {
            io.sockets.connected[msg].emit('challenge-msg', 'You were challenged!');
        }
    })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});