const http = require('http');
const os = require('os');

console.log("Debain base web server starting...");

var handler = function(request, response) {
    console.log("Received request from " + request.connection.remoteAddress);
    response.writeHead(200);
    response.end("My hostname is " + os.hostname() + "\n");
};

var www = http.createServer(handler);
www.listen(8088);