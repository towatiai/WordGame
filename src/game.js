exports.Challenge = function(id, sender, recipient) {
    this.id = id;
    this.sender = sender;
    this.recipient = recipient;
}

function Board(size) {
    this.size = size;
    this.state = []
    for(let i = 0; i < size; i++) {
        let arr = []
        for(let j = 0; j < size; j++) {
            arr[j] = "";
        }
        this.state.push(arr);
    }
}

function Player(id) {
    this.id = id;
    this.score = 0;
    this.letters = [];
}

Player.prototype.addLetter = function(letter) {
    this.letters.push(letter);
}

var GameStates = Object.freeze({"P1": 1, "P2": 2, "OVER": 3});

exports.Game = function(player1, player2, numOfLetters) {
    this.player1 = new Player(player1);
    this.player2 = new Player(player2);
    this.numOfLetters = numOfLetters;
    this.board = new Board(17);
    this.letters = ['a','b','c','d','e','f','g','a','b','c','d','e','f','g',
                    'a','b','c','d','e','f','g','a','b','c','d','e','f','g']; // put letters here
    this.state = GameStates.P1;
}

exports.Game.prototype.giveLetters = function(player, amount) {
    for(let i = 0; i < amount; i++) {
        let rn = Math.floor(Math.random() * this.letters.length);
        player.addLetter(this.letters[rn]);
        this.letters.splice(rn, 1);
    }
}

exports.Game.prototype.giveStartLetters = function() {
    this.giveLetters(this.player1, this.numOfLetters);
    this.giveLetters(this.player2, this.numOfLetters);
}




