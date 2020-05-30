const http = require('http');
const os = require('os');

console.log("Unhealthy web server starting...");

var requestCount = 0;

var handler = function(request, response) {
    console.log("Received request from " + request.connection.remoteAddress);
    requestCount++;

    if (requestCount > 5) {
        response.writeHead(500);
        response.end("Service is unhealthy. Please maintain me!");
        return;
    }
    response.writeHead(200);
    response.end("My hostname is " + os.hostname() + "\n");
};

var www = http.createServer(handler);
www.listen(8088);