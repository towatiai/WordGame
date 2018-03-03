exports.Challenge = function(id, sender, recipient) {
    this.id = id;
    this.sender = sender;
    this.recipient = recipient;
}

function Board(size) {
    this.size = size;
    this.state = []
    for(let i = 0; i < size; i++) {
        for(let j = 0; j < size; j++) {
            this.state[i][j] = "";
        }
    }
}

function Player(id) {
    this.id = id;
    this.score = 0;
    this.letters = [];
}

exports.Game = function(player1, player2) {
    this.player1 = new Player(player1);
    this.player2 = new Player(player2);
    this.board = new Board(17);
    this.letters = []; // put letters here
}




