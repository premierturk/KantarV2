const electron = require('electron');

// const { ipcMain } = require('electron');
// const { ipcRenderer } = require('electron');
const { ipcMain: ipc } = require('electron');


const path = require('path');
const url = require('url');
const Shortcut = require('electron-shortcut');
const PDFWindow = require('electron-pdf-window');
var nrc = require('node-run-cmd');
const { base64encode, base64decode } = require('nodejs-base64');
const serialport = require('serialport')
const ab2str = require('arraybuffer-to-string');
const config = require("./config");

const app = electron.app
app.allowRendererProcessReuse = false;
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    show: false,
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      backgroundThrottling: false
    }
  });
  mainWindow.setMenu(null);
  mainWindow.maximize();



  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    app.allowRendererProcessReuse = false;
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  });

  var shortcut = new Shortcut('Ctrl+F12', function (e) {

    console.log("openDevTools")
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  });

  //SERIALPORT-------
  const port = new serialport(config.SerialPort.portName, config.SerialPort);
  port.open(function (err) {
    if (err) {
      return console.log('Error opening port: ', err.message)
    }
  });
  port.on('open', function () {
    return console.log('SERIAL PORT OPEN :', port);
  });
  port.on('data', function (data) {

    //console.log('SERIAL PORT DATA : ', ab2str(data));

    var d = {
      Name: config.SerialPortToTcp.tcpName,
      Data: ab2str(data)
    };

    //ipc.send(d);
    mainWindow.webContents.send("comport", JSON.stringify(d));

  });


  window.addEventListener('online', function () { alert("online") });
  window.addEventListener('offline', function () { alert("offline") });

}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);


// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  app.quit()
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.

  if (mainWindow === null)
    createWindow()

})





// Enable live reload for Electron too
// require('electron-reload')(__dirname, {
//   // Note that the path to electron may vary according to the main file
//   // Note that the path to electron may vary according to the main file
//   electron: require(`${__dirname}/node_modules/electron`)
// });

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipc.on('restart', async (event, data) => {
  app.exit();
  app.relaunch();
});

ipc.on('onprint', async (event, data) => {


  const exePath = path.join(__dirname, 'print/PrintFis.exe');

  // fisno: "1155",
  // islemtarihi: "10.10.2010",
  // islemsaat: "10:02",
  // belgeno: "4587-2019",
  // firma: "BAHADIR HAFRİYAT",
  // plakano: "41 GG 4587",
  // tonaj: "45874",
  // dara: "15000",
  // net: "32584",
  // tutar: "1458,36",
  // bakiye: "12898102",
  // belgemik: "1000",
  // belgetopdok: "3221",
  // belgekalmik: "45666",

  const parameter =
    "KENTKONUT_A.Ş " +
    replaceAll(" ", "_", data.fisno) + " " +
    replaceAll(" ", "_", data.islemtarihi) + " " +
    replaceAll(" ", "_", data.islemsaat) + " " +
    replaceAll(" ", "_", data.belgeno) + " " +
    replaceAll(" ", "_", data.firma) + " " +
    replaceAll(" ", "_", data.plakano) + " " +
    replaceAll(" ", "_", data.tonaj) + " " +
    replaceAll(" ", "_", data.dara) + " " +
    replaceAll(" ", "_", data.net) + " " +
    replaceAll(" ", "_", data.tutar) + " " +
    replaceAll(" ", "_", data.bakiye) + " " +
    replaceAll(" ", "_", data.belgemik) + " " +
    replaceAll(" ", "_", data.belgetopdok) + " " +
    replaceAll(" ", "_", data.belgekalmik);


  console.log(exePath + " " + parameter);

  nrc.run(exePath + " " + parameter).then(function (exitCodes) {
    console.log('printed', parameter + " " + exitCodes);
  }, function (err) {
    console.log('Command failed to run with error: ', err);
  });

});



function replaceAll(find, replace, str) {
  while (str.indexOf(find) > -1) {
    str = str.replace(find, replace);
  }
  return str;
}


process.on('uncaughtException', (err) => {
  console.log("uncaughtException")
});
process.on('warning', (warning) => {
  console.warn(warning.name);    // Print the warning name
  console.warn(warning.message); // Print the warning message
  console.warn(warning.stack);   // Print the stack trace
});