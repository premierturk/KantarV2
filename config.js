'use strict';

var OGS_SERI = [{ Il: "DİYARBAKIR", Seri: 1001 }, { Il: "BURSA", Seri: 1261 }];

var config = {
    GirisCikis: "Giriş",//Giriş|Çıkış
    KantarVarMi: false,
    UsePrinter: false,
    UseOffline: false,
    TcpPort: 5555,//anten remote pc port
    OgsEtiketStart: OGS_SERI[1].Seri,
    MinTonaj: 1000,
    WebApiUrl: "http://localhost:2023/HYS.WebApi/",
    //WebApiUrl: "http://hybs.diyarbakir.bel.tr//HYS.WebApi/",
    SignalR: {
        host: 'http://localhost:2023/HYS.SingnalR/signalr'
        //host: 'http://hybs.diyarbakir.bel.tr/HYS.SingnalR/signalr'
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
        host: '192.168.1.131',//localhost
        port: 6632
    },
    mongodb: {
        server: '10.100.8.58:27017',
        database: 'HYBS',
    }
};

module.exports = config;