/************* GLOBALS **************/
let CANVAS_W = 700,
    CANVAS_H = 780;

let TILE_W = 34,
    TILE_H = 34;

let TILE_COUNT = 10;

let BOARD_W = 17;
let BOARD_H = 17;
let BOARD = [];

let PLAYER;
let GAME;
let LOBBY;
let CONNECTION;

let TILE_COLOR = "0x" + "ffd67d";
let LETTERBOX_COLOR = "0x" + "bf8200";


$(() => {
    new Game();
    LOBBY = new Lobby();
    CONNECTION = new Connection();
    /*new Board();
    LOBBY.removeLogin();*/


    /*let board = new Board();*/
});




class Game {

    constructor() {
        this.type = "WebGL";
        if(!PIXI.utils.isWebGLSupported()){
            this.type = "canvas";
        }

        PIXI.utils.sayHello(this.type);

        GAME = new PIXI.Application({width: CANVAS_W, height: CANVAS_H});
        GAME.renderer.backgroundColor = 0xFFFFFF;
        document.getElementById('container').appendChild(GAME.view);
    }
}


class Tile {

    constructor (x, y, w, h, letter) {
        this.tile = new PIXI.Sprite();
        this.tile.x = x;
        this.tile.y = y;

        let rect = new PIXI.Graphics();
        rect.beginFill(TILE_COLOR);
        rect.drawRect(0, 0, w, h);
        rect.endFill();
        this.tile.addChild(rect);

        let char = new PIXI.Text(letter);
        char.anchor.set(0.5);
        char.position.set(w/2, h/2);
        this.tile.addChild(char);
    }
}




class Board {

    constructor () {

        for ( let x = 0; x < BOARD_W; x++) {
            let arr = [];
            for ( let y = 0; y < BOARD_H; y++) {
                arr.push('');
                let tile = new Tile(x * (TILE_W + 1), y * (TILE_H + 1), TILE_W, TILE_H, arr[y]);
                GAME.stage.addChild(tile.tile);
            }
            BOARD.push(arr);
        }

        this.letterbox = new PIXI.Sprite();
        this.letterbox.x = 40;
        this.letterbox.y = CANVAS_H - 40;

        let letter_background = new PIXI.Graphics();
        letter_background.beginFill(LETTERBOX_COLOR);
        letter_background.drawRect(0, 0, TILE_COUNT * (TILE_W + 8), TILE_H + 10);
        letter_background.endFill();
        this.letterbox.addChild(letter_background);

        this.letters = ['K', 'A', 'L', 'L', 'E'];

        for ( let i = 0; i < this.letters.length; i++ ) {
            let tile = new Tile( i * ( TILE_W + 2 ) + 4, 4, TILE_W, TILE_H, this.letters[i] );
            this.letterbox.addChild(tile.tile);
        }

        GAME.stage.addChild(this.letterbox);
    }
}




class Connection {

    constructor() {

        this.socket = io();

        this.socket.on('lobby-update', function(msg) {
            console.log("lobby update!");
            let users = JSON.parse(msg);
            LOBBY.empty();
            for(let i = 0; i < users.length; i++) {
                if (PLAYER !== undefined && users[i].user === PLAYER.name) {
                    PLAYER.id = users[i].id;
                    continue;
                }
                LOBBY.addUser(users[i].user, users[i].id, false);
            }
            LOBBY.draw();
            return false;
        });

        this.socket.on('challenge-msg', function(msg) {
            let data = JSON.parse(msg);
            console.log("Challenge received!");
            LOBBY.challenge(data);
            return false;
        });

        this.socket.on('challenge-fail', function(msg) {
            let data = JSON.parse(msg);
            console.log("Challenge response!");
            LOBBY.challenge(data);
            return false;
        });

        $('#join').click(function(event) {
            let username = $("#username").val();

            PLAYER = new User(username, null, true);
            PLAYER.draw();
            CONNECTION.socket.emit('join', username);
            LOBBY.removeLogin();
            return false;
        });
    }

    challengeSend(id) {
        console.log('Challenge was sent to: ' + id);
        CONNECTION.socket.emit('challenge', id);
        return false;
    }

    challengeResponse(YorN, sender) {
        CONNECTION.socket.emit('challenge-response', JSON.stringify(
            {
                'response': YorN,
                'sender': sender
            }
        ));
        return false;
    }

}



class Lobby {

    constructor() {
        this.users = [];
    }

    addUser(name, id, isPlayer) {
        let user = new User(name, id, isPlayer);
        this.users.push(user);
        return user;
    }

    removeLogin() {
        $( '#username_input' ).remove();
    }

    findFromUsers(id) {
        for ( let i = 0; i < this.users.length; i++) {
            if (this.users[i].id === id) return i;
        }
        return -1;
    }

    empty() {
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].isPlayer) continue;
            this.users[i].userContainer.destroy();
            this.users.splice(i, 1);
            i--;
        }
    }

    challenge(data) {
        let challengeText = "You were challenged by: " + this.nameFromID(data.sender);
        console.log(challengeText);
        createContainer(100, 400, 0, 50,
            challengeText);
        let accept = createContainer(120, 500, 0, 50, "ACCEPT!");
        let reject = createContainer(320, 500, 0, 50, "REJECT");

        accept.interactive = true;
        accept.buttonMode = true;

        accept.on('pointerdown', function(e) {
            CONNECTION.challengeResponse('y', data.sender);
        });

        reject.interactive = true;
        reject.buttonMode = true;

        reject.on('pointerdown', function(e) {
            CONNECTION.challengeResponse('n', data.sender);
        });
    }

    nameFromID (id) {
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].id === id) {
                return this.users[i].name;
            }
        }
    }

    draw() {
        for ( let i = 0; i < this.users.length; i++) {
            this.users[i].draw(i);
        }
    }
}


class User {

    constructor(user, id, isPlayer) {
        this.name = user;
        this.id = id;
        this.isPlayer = isPlayer;

        console.log(user);
    }

    draw(index) {
        if (this.isPlayer) {
            console.log("drawing player");
            this.userContainer = createContainer(200, 100, 200, TILE_H, this.name);
            return;
        }

        this.userContainer = createContainer(200,
                        index * (TILE_H + 1) + 150,
                        200, TILE_H, this.name);

        this.userContainer.interactive = true;
        this.userContainer.buttonMode = true;

        let id = this.id;

        this.userContainer.on('pointerdown', function(e) {
            CONNECTION.challengeSend(id);
        });
    }
}





function createContainer(x, y, w, h, text) {
    this.container = new PIXI.Sprite();
    this.container.x = x;
    this.container.y = y;

    let username = new PIXI.Text(text);

    let background = new PIXI.Graphics();
    background.beginFill(TILE_COLOR);

    if (username.width > w)
        background.drawRect(0, 0, username.width + 20, h);
    else background.drawRect(0, 0, w, h);
    background.endFill();
    this.container.addChild(background);

    username.anchor.y = 0.5;
    username.y = background.height / 2;
    username.x = 5;

    this.container.addChild(username);

    GAME.stage.addChild(this.container);

    return this.container;
}

