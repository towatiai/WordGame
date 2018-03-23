Challenge = function(id, sender, recipient) {
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

// Give letter to player
Player.prototype.addLetter = function(letter) {
    this.letters.push(letter);
}

/**
 * Remove given letter from player
 * @param {string} letter - Letter to remove
 */
Player.prototype.removeLetter = function(letter) {
    let index = this.letters.find(letter);
    this.letters.splice(index, 1);
}

Player.prototype.hasLetter = function(letter) {
    if (this.letters.find(letter)) return true;
    else return false;
}

// Possible game states
var GameStates = Object.freeze({"P1": 1, "P2": 2, "OVER": 3});

Game = function(player1, player2, numOfLetters) {
    this.player1 = new Player(player1);
    this.player2 = new Player(player2);
    this.numOfLetters = numOfLetters;
    this.board = new Board(17);
    // "Bag" holding the letters
    this.letters = ['a','b','c','d','e','f','g','a','b','c','d','e','f','g',
                    'a','b','c','d','e','f','g','a','b','c','d','e','f','g']; // put letters here
    this.state = GameStates.P1;
}

// Give letters to a player
Game.prototype.giveLetters = function(player, amount) {
    for(let i = 0; i < amount; i++) {
        let rn = Math.floor(Math.random() * this.letters.length);
        player.addLetter(this.letters[rn]);
        this.letters.splice(rn, 1);
    }
}

// Give starting letters to players
Game.prototype.giveStartLetters = function() {
    this.giveLetters(this.player1, this.numOfLetters);
    this.giveLetters(this.player2, this.numOfLetters);
}

/**
 * Change given letters for a player
 * @param {Player} player - The player who changes letters
 * @param {string[]} letters - Letters the player wants to change
 */
Game.prototype.changeLetters = function(player, letters) {
    // Give error if player tries to change more letters than there are in the bag
    if(letters.length > this.letters.length) return false; // Report failure
    // Check wheter the player has all the letters they wish to change
    for(let i = 0; i < letters.length; i++) {
        if(!player.hasLetter(letters[i])) return false; // Report failure
    }
    // Remove the letters
    for(let i = 0; i < letters.length; i++) {
        player.removeLetter(letters[i]);
    }
    // Give new letters
    giveLetters(player, letters.length);
    // Put letters back to the "bag"
    for(let i = 0; i < letters.length; i++) {
        this.letters.push(letters[i]);
    }
    return true; // Report success
}

module.exports = {
    Game: Game,
    Challenge: Challenge
} 



