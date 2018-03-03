/************* GLOBALS **************/
let CANVAS_W = 700,
    CANVAS_H = 780;

let TILE_W = 34,
    TILE_H = 34;

let TILE_COUNT = 10;

let BOARD_W = 17;
let BOARD_H = 17;
let BOARD = [];
let GAME;
let LOBBY;
let CONNECTION;

let TILE_COLOR = "0x" + "ffd67d";
let LETTERBOX_COLOR = "0x" + "bf8200";


$(() => {
    let game = new Game();
    //let player = new Player();
    LOBBY = new Lobby();
    CONNECTION = new Connection();


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
            container.addChild(tile.tile);
        }

        GAME.stage.addChild(container);
    }
}




class Connection {

    constructor() {

        this.socket = io();

        this.socket.on('lobby-update', function(msg) {
            console.log("lobby update!");
            let users = JSON.parse(msg);
            console.log(users);
            LOBBY.empty();
            for(let i = 0; i < users.length; i++) {
                LOBBY.addUser(users[i].user, users[i].id).draw(i);
            }
            return false;
        });

        this.socket.on('challenge-msg', function(msg) {
            var data = JSON.parse(msg);
            console.log("Challenge recieved!");
            LOBBY.challenge
            return false;
        });

        $('#join').click(function(event) {
            console.log('moi');
            CONNECTION.socket.emit('join', $("#username").val());
            LOBBY.removeLogin();
            return false;
        });
    }



}



class Lobby {

    constructor() {
        this.users = [];
    }

    addUser(name, id) {
        let user = new User(name, id);
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
        this.users.map((user) => {
           user.container.destroy();
        });
    }
}


class User {

    constructor(user, id) {
        this.name = user;
        this.id = id;

        console.log(user);
    }

    draw(index) {
        this.container = new PIXI.Sprite();
        this.container.x = 200;
        this.container.y = index * (TILE_H + 1) + 150;

        let background = new PIXI.Graphics();
        background.beginFill(TILE_COLOR);
        background.drawRect(0, 0, 200, TILE_H);
        background.endFill();
        this.container.addChild(background);

        let username = new PIXI.Text(this.name);
        username.anchor.y = 0.5;
        username.y = TILE_H / 2;
        username.x = 5;
        this.container.addChild(username);

        GAME.stage.addChild(this.container);

        this.container.interactive = true;
        this.container.buttonMode = true;

        let id = this.id;

        this.container.on('pointerdown', function(e) {
            console.log('Challenge was sent to: ' + id);
            CONNECTION.socket.emit('challenge', id);
            return false;
        });
    }
}

