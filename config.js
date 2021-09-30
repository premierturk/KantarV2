'use strict';

var config = {
    UsePrinter: false,
    TcpPort: 5555,//anten remote pc port
    OgsEtiketStart: "1001",
    MinTonaj: 1000,
    WebApiUrl: "http://hybs.diyarbakir.bel.tr//HYS.WebApi/",
    SignalR: {
        host: 'http://hybs.diyarbakir.bel.tr//HYS.SingnalR/signalr'
    },
    SerialPort: {//serial porttan veri okumak için gerekli parametreler
        portName: "COM3",
        autoOpen: false,
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
    },
    SerialPortToTcp: {//serial porttan veriyi alıp tcp den yayınlamak için kullanılıyor
        tcpName: "KANTAR 1",
        host: '10.210.210.27',//localhost
        port: 6633
    },
    mongodb: {
        server: '10.100.8.58:27017',
        database: 'HYBS',
    },
};

module.exports = config;