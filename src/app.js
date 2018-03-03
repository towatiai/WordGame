let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
var game = require('./game');

// Connceted users
var users = []
// Last challenge id
var lastCid = 0;
// Active challenges
var challenges = []

app.use(express.static('client'));

// Remove user by id
function removeUser(id) {
    for(let i = 0; i < users.length; i++) {
        if(users[i]['id'] === id) users.splice(i, 1);
    }
}

// Find wheter user with specified id exists
function findUser(id) {
    for(let i = 0; i < users.length; i++) {
        if(users[i].id == id) return true;
    }
    return false;
}
// Get username by id
function getUsername(id) {
    for(let i = 0; i < users.length; i++) {
        if(users[i].id == id) return users[i].user;
    }
}

// Check wheter a user can be challenged
function canBeChallenged(id) {
    for(let i = 0; i < challenges.length(); i++) {
        if(challenges[i].recipient == id) return false;
    }
    return true;
}

// Check wheter a user can challenge
function canChallenge(id) {
    for(let i = 0; i < users.length(); i++) {
        if(challenges[i].sender == id) return false;
    }
    return true;
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
    socket.on('challenge', function(recipient) {
        console.log( socket.id + " challenged : " + recipient);
        // Create new challenge
        challenge = game.Challenge(lastCid++, socket.id, recipient)
        // Notify challenger is recipient can't be challenged
        if(!canBeChallenged(recipient)) {
            io.sockets.connected[socket.id].emit('challenge-fail',
                JSON.stringify({'reason': 'busy', 'recipient': recipient}));
        }
        // Challenge fails if user has already challenged somebody
        if(!canChallenge(socket.id)) {
            io.sockets.connected[socket.id].emit('challenge-fail',
                JSON.stringify({'reason': 'limit', 'recipient': recipient}));
        }
        else {
            challenges.push(challenge);
            // Send challenge to the user whom it concerns
            io.sockets.connected[recipient].emit('challenge-msg', JSON.stringify({'sender': socket.id, 'recipient': recipient}));
        }
    });
    // When a user responds to a challenge
    socket.on('challenge-response', function(msg) {
        console.log("Challenge response");
        // Challange is accepted
        if(msg.response == 'y') {
            // create game
        }
        // Challenge is rejected
        else {
            if(io.sockets.connected[msg.sender]) {
                io.sockets.connected[msg.sender].emit('challenge-fail', msg);
            }
        }
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});