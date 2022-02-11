const electron = require("electron");
const { ipcMain: ipc } = require("electron");
const path = require("path");
const url = require("url");
const Shortcut = require("electron-shortcut");
var nrc = require("node-run-cmd");
// const ab2str = require("arraybuffer-to-string");
const config = require("./config");

const serialport = require("serialport");

// const Readline = require("@serialport/parser-readline");
// const { isNumber, parseInt } = require("lodash");

const { killPortProcess } = require("kill-port-process");
const { autoUpdater } = require("electron-updater");

const screenshot = require('screenshot-desktop');
const signalr = require('node-signalr');

const app = electron.app;
app.allowRendererProcessReuse = false;
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;


function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    //frame: false,

    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      backgroundThrottling: false,
    },
  });
  mainWindow.setMenu(null);

  var splash = new BrowserWindow({
    width: 500,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
  });
  splash.loadFile(path.join(__dirname, "app/splash.html"));
  splash.center();

  // and load the index.html of the app.
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "app/index.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  mainWindow.once("ready-to-show", () => {
    autoUpdater.checkForUpdatesAndNotify();

    setTimeout(function () {
      splash.close();

      mainWindow.maximize();
      mainWindow.show();
      // mainWindow.alwaysOnTop(true);
    }, 1000);

    app.allowRendererProcessReuse = false;
  });

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  var shortcut = new Shortcut("Ctrl+F12", function (e) {
    console.log("openDevTools");
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  });

  //SERIALPORT-------
  if (config.KantarVarMi) {
    const port = new serialport(config.SerialPort.portName, config.SerialPort);

    //const parser = port.pipe(new Readline({ delimiter: '\n' }))
    port.open(function (err) {
      if (err) {
        return console.log("Error opening port: ", err.message);
      }
    });
    port.on("open", function () {
      return console.log("SERIAL PORT OPEN :", port);
    });

    port.on("data", function (data) {
      mainWindow.webContents.send("comport", data);
    });
  }

  var hub = "ScreenShut";
  let client = new signalr.client(config.SignalR.host, [hub]);
  client.qs = { "tip": "kantar" };
  client.start();


  var i = 0;
  var b = 0;
  setInterval(async function () {
    i++;

    var img = await screenshot({ format: 'png' });
    b += img.length;

    var imgStr = new Buffer(img).toString('base64');
    client.connection.hub.invoke(hub, 'send', imgStr);

    console.log(i + " - " + formatBytes(b));

  }, 4000);

}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q

  killPortProcess(config.TcpPort).then(console.log).catch(console.log);

  app.quit();
});

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

function replaceAll(find, replace, str) {
  while (str.indexOf(find) > -1) {
    str = str.replace(find, replace);
  }
  return str;
}

process.on("uncaughtException", (err) => {
  console.log("uncaughtException" + err);
});
process.on("warning", (warning) => {
  console.warn(warning.name); // Print the warning name
  console.warn(warning.message); // Print the warning message
  console.warn(warning.stack); // Print the stack trace
});

autoUpdater.on("update-available", () => {
  mainWindow.webContents.send("update_available");
});

autoUpdater.on("update-downloaded", () => {

  mainWindow.webContents.send("update_downloaded");
});

autoUpdater.on("error", (message) => {
  console.error("There was a problem updating the application");
  console.error(message);
});

ipc.on("app_version", (event) => {
  event.sender.send("app_version", { version: app.getVersion() });
});

ipc.on("restart_app", () => {
  autoUpdater.quitAndInstall();
});

ipc.on("restart", async (event, data) => {
  app.exit();
  app.relaunch();
});

ipc.on("onprint", async (event, data) => {
  const exePath = path.join(__dirname, "print/PrintFis.exe");

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
    replaceAll(" ", "_", data.fisno) +
    " " +
    replaceAll(" ", "_", data.islemtarihi) +
    " " +
    replaceAll(" ", "_", data.islemsaat) +
    " " +
    replaceAll(" ", "_", data.belgeno) +
    " " +
    replaceAll(" ", "_", data.firma) +
    " " +
    replaceAll(" ", "_", data.plakano) +
    " " +
    replaceAll(" ", "_", data.tonaj) +
    " " +
    replaceAll(" ", "_", data.dara) +
    " " +
    replaceAll(" ", "_", data.net) +
    " " +
    replaceAll(" ", "_", data.tutar) +
    " " +
    replaceAll(" ", "_", data.bakiye) +
    " " +
    replaceAll(" ", "_", data.belgemik) +
    " " +
    replaceAll(" ", "_", data.belgetopdok) +
    " " +
    replaceAll(" ", "_", data.belgekalmik);

  console.log(exePath + " " + parameter);

  nrc.run(exePath + " " + parameter).then(
    function (exitCodes) {
      console.log("printed", parameter + " " + exitCodes);
    },
    function (err) {
      console.log("Command failed to run with error: ", err);
    }
  );
});

setInterval(() => {
  autoUpdater.checkForUpdatesAndNotify();
}, 60000);
