// var net = require('net');

// var server = net.createServer(function(socket) {
// 	socket.write('Echo server\r\n');
// 	socket.pipe(socket);
// });

// server.listen(1337, 'localhost');



// //Client
// var net = require('net');

// var client = new net.Socket();
// client.connect(1337, 'localhost', function() {
// 	console.log('Connected');
// 	client.write('Hello, server! Love, Client.');
// });

// client.on('data', function(data) {
// 	console.log('Received: ' + data);
// 	client.destroy(); // kill client after server's response
// });

// client.on('close', function() {
// 	console.log('Connection closed');
// });