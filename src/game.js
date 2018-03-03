exports.Challenge = function(sender, recipent) {
    this.sender = sender;
    this.recipent = recipent;
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

function Player() {
    this.score = 0;
    this.letters = [];
}

exports.Game = function() {
    this.board = new Board(17);
    this.letters = []; // put letters here
}




