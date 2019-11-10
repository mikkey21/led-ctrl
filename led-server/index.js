const webSocketsServerPort = 8000;
const webSocketServer = require('websocket').server;
const http = require('http');
// Spinning the http server and the websocket server.
const server = http.createServer();
server.listen(webSocketsServerPort);
const wsServer = new webSocketServer({
  httpServer: server
});

// Generates unique ID for every new connection
const getUniqueID = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4();
};

// I'm maintaining all active connections in this object
const clients = {};
// I'm maintaining all active users in this object
const users = {};
// The current editor content is maintained here.
let editorContent = null;


const sendMessage = (json) => {
  // We are sending the current data to all connected clients
  Object.keys(clients).map((client) => {
    clients[client].sendUTF(json);
  });
}

const typesDef = {
  USER_EVENT: "userevent",
  CONTENT_CHANGE: "contentchange"
}

wsServer.on('request', function(request) {
  var userID = getUniqueID();
  console.log((new Date()) + ' Received a new connection from origin ' + request.origin + '.');
  // You can rewrite this part of the code to accept only the requests from allowed origin
  const connection = request.accept(null, request.origin);
  clients[userID] = connection;
  console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients));
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      const dataFromClient = JSON.parse(message.utf8Data);
      const json = { type: dataFromClient.type };
      if (dataFromClient.type === typesDef.USER_EVENT) {
        users[userID] = dataFromClient;
        json.data = { users};
      } else if (dataFromClient.type === typesDef.CONTENT_CHANGE) {
        editorContent = dataFromClient.content;
	var ledColor = parseInt(dataFromClient.ledColor,10);
        json.data = { ledColor };
	console.log(dataFromClient);

	const spawn = require("child_process").spawn;
	const pythonProcess = spawn('python',["/home/pi/rpi_ws281x/python/examples/setColor.py", ledColor]);
	
      }
      //sendMessage(JSON.stringify(json));
      sendMessage(JSON.stringify({ledColor}));
    }
  });
  // user disconnected
  connection.on('close', function(connection) {
    console.log((new Date()) + " Peer " + userID + " disconnected.");
    const json = { type: typesDef.USER_EVENT };
    json.data = { users};
    delete clients[userID];
    delete users[userID];
    sendMessage(JSON.stringify(json));
  });
});
