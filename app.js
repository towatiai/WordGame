//  Required npm-libraries:
const http = require("http");
const fs = require('fs');

//const port = process.env.PORT;
const port = 3000;

/**
 * Creates http-server that handles GET and POST commands.
 *
 */
const server = http.createServer((req, res) => {
    if (req.method.toLocaleLowerCase() === 'get') {
        if (req.url === '/') {
            init(req, res);
        } else {
            let type = req.url.split('.')[1];
            switch (type) {
                case 'css':
                    load(req, res, '.' + req.url, 'text/css');
                    break;
                case 'js':
                    load(req, res, '.' + req.url, 'text/javascript');
                    break;
                case 'json':
                    load(req, res, './data/weathers.json', 'application/json');
                    break;
                case 'png':
                    load(req, res, '.' + req.url, 'image/png');
                    break;
                default:
                    console.log("Unknown file format: " + type);
            }
        }
    } else if (req.method.toLocaleLowerCase() === 'post') {
        let body = '';

        req.on('data', (data) => {
            body += data;
        });

        req.on('end', () => {
            let data = body.split('|');

            if (data[0] == "add") saveData(JSON.parse(data[2]), data[1]);
            else if (data[0] == "remove") removeData(JSON.parse(data[2]), data[1]);
            else console.log("Unknown command: " + data[0]);
        });

        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('Data received.');

    }
}).listen(port, () => {
    console.log("Server running at localhost:" + port);
});


/**
 * Loads file from given directory (url).
 * @param req Request: Received http-package.
 * @param res Respond: http-package, that will be sent back.
 * @param filename URL to wanted file.
 * @param type File type that is needed when sending data back to client.
 */
function load (req, res, filename, type) {
    if (req.method.toLocaleLowerCase() === "get") {
        res.statusCode = 200;
        res.setHeader('Content-Type', type);
        let file = fs.readFileSync(filename);
        res.write(file);
        res.end();
    }
    console.log("Loaded: " + filename);
}

/**
 * Sends html-file to client.
 * @param req Request: Received http-package.
 * @param res Respond: http-package, that will be sent back.
 */
function init(req, res) {
    load(req, res, './index.html', 'html');
}
