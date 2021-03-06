"use strict";


const fs = require('fs');

var OGS_SERI = [
  { Il: "DİYARBAKIR", Seri: 100 },
  { Il: "BURSA", Seri: 126 },
];

var config_giris = {
  GirisCikis: "Giris", //Giriş|Çıkış
  KantarVarMi: true,
  UsePrinter: false,
  UseOffline: false,
  TcpPort: 5555, //anten remote pc port
  TcpPortAntenCikis: 5554, //anten remote pc port
  OgsEtiketStart: OGS_SERI[1].Seri,
  MinTonaj: 1000,
  //WebApiUrl: "http://bursa.premierturk.com/HYS.WebApi/",
  WebApiUrl: "http://localhost:2023/HYS.WebApi/",
  //WebApiUrl: "http://hybs.diyarbakir.bel.tr//HYS.WebApi/",
  SignalR: {
    //host: "http://bursa.premierturk.com/HYS.SingnalR/signalr",
    host: 'http://localhost:2023/HYS.SingnalR/signalr'
    //host: 'http://hybs.diyarbakir.bel.tr/HYS.SingnalR/signalr'
  },
  SerialPort: {
    //serial porttan veri okumak için gerekli parametreler
    portName: "COM1",
    autoOpen: false,
    baudRate: 9600,
    // dataBits: 8,
    // stopBits: 1,
    // parity: 'none'
  },
  // mongodb: {
  //     server: '10.100.8.58:27017',
  //     database: 'HYBS',
  // }
};

var config_cikis = {
  GirisCikis: "Çıkış", //Giriş|Çıkış
  KantarVarMi: true,
  UsePrinter: false,
  UseOffline: false,
  TcpPort: 5555, //anten remote pc port
  TcpPortAntenCikis: 5554, //anten remote pc port
  OgsEtiketStart: OGS_SERI[1].Seri,
  MinTonaj: 1000,
  WebApiUrl: "http://bursa.premierturk.com/HYS.WebApi/",
  //WebApiUrl: "http://localhost:2023/HYS.WebApi/",
  //WebApiUrl: "http://hybs.diyarbakir.bel.tr//HYS.WebApi/",
  SignalR: {
    host: "http://bursa.premierturk.com/HYS.SingnalR/signalr",
    //host: 'http://localhost:2023/HYS.SingnalR/signalr'
    //host: 'http://hybs.diyarbakir.bel.tr/HYS.SingnalR/signalr'
  },
  SerialPort: {
    //serial porttan veri okumak için gerekli parametreler
    portName: "COM6",
    autoOpen: false,
    baudRate: 9600,
    // dataBits: 8,
    // stopBits: 1,
    // parity: 'none'
  },
  // mongodb: {
  //     server: '10.100.8.58:27017',
  //     database: 'HYBS',
  // }
};



let rawdata = fs.readFileSync('c://hybs_kantar_config.json');
let config = JSON.parse(rawdata);
module.exports = config;

//module.exports = config_giris;


