

exports.start = function () {

    const net = require('net');
    const serialport = require('serialport');
    const config = require("./config");
    const ab2str = require('arraybuffer-to-string');
    const signalr = require('node-signalr');

    let sockets = [];

    console.log("SIGNALR URL : " + config.SignalR.host);
    let signalr_client = new signalr.client(config.SignalR.host, ['dokum']);

    signalr_client.on('connected', () => {
        console.log('SignalR client connected.');
    });

    signalr_client.on('reconnecting', (count) => {
        console.log(`SignalR client reconnecting(${count}).`);
    });

    signalr_client.on('disconnected', (code) => {
        console.log(`SignalR client disconnected(${code}).`);
    });

    signalr_client.on('error', (code, ex) => {
        console.log(`SignalR client connect error: ${code}.`);
    });

    signalr_client.start();


    const port = new serialport(config.SerialPort.portName, config.SerialPort);

    port.open(function (err) {
        if (err) {
            return console.log('Error opening port: ', err.message)
        }
    })
    port.on('open', function () {
        return console.log('SERIAL PORT OPEN :', port);
    })

    port.on('data', function (data) {

        console.log('SERIAL PORT DATA : ', ab2str(data));

        var d = {
            Name: config.SerialPortToTcp.tcpName,
            Data: ab2str(data)
        }


        sockets.forEach((client) => {
            client.write(" " + JSON.stringify(d) + " ");
        });

        if (signalr_client.connection.state == 1)
            signalr_client.connection.hub.invoke('hubs', 'kantarveri', d.Name, d.Data);

    })


    var server = net.createServer(function (sock) {

        console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

        sockets.push(sock);

        sock.on('end', () => {
            console.log('DISCONNECTED: ');
            // remove the client for list
            let index = sockets.indexOf(sock);
            if (index !== -1) {
                console.log(sockets.length);
                sockets.splice(index, 1);
                console.log(sockets.length);
            }
        });


        sock.on('data', function (data) {
            console.log('DATA ' + sock.remoteAddress);
            console.log('DATA ' + data.toString());
            console.log('DATE ' + new Date().toString());
        });

        sock.on('close', function (data) {
            console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
        });

        sock.on('error', function (err) {
            console.error('Socket error: ' + err);
        });

        sock.setTimeout(8000000, function () {
            console.log('Socket timed out');
        });


        sock.on('drain', function () {
            console.log('drain');
            sock.resume();
        });

        sock.on('timeout', function () {
            console.log('Socket timed out !');
            sock.end('Timed out!');
            server.close();
            server.listen(config.SerialPortToTcp.port, config.SerialPortToTcp.host);
        });

        sock.on('end', function (data) {
            console.log('Socket ended from other end!');
            console.log('End data : ' + data);
        });

        sock.on('close', function (error) {
            console.log('Socket was closed coz of transmission error');
            server.close();
            server.listen(config.SerialPortToTcp.port, config.SerialPortToTcp.host);
        });

    });

    server.getConnections(function (error, count) {
        console.log('Number of concurrent connections to the server : ' + count);
    });

    server.on('error', function (error) {
        console.log('Server Error: ' + error);
    });

    server.on('listening', function () {
        console.log('Server listening on ' + config.SerialPortToTcp.port + ":" + config.SerialPortToTcp.host);
    });
    server.on('close', function () {
        console.log('Server is close!');
    });

    server.listen(config.SerialPortToTcp.port, config.SerialPortToTcp.host);




};


