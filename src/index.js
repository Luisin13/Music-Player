const {
  app,
  BrowserWindow,
  ipcRenderer,
  ipcMain,
  webContents,
  Tray,
  Menu,
} = require("electron");
const { homedir } = require("os");
const path = require("path");
const recursiveReadDir = require("./util/recursiveReadDir");
let window = null,
  tray = null,
  trayWindow = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = async () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    enableLargerThanScreen: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      devTools: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "app", "html", "index.html"));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  //send folders to renderer

  mainWindow.webContents.on("did-finish-load", async () => {
    // const folders = readdirSync(new URL(`${homedir()}/Music`).pathname);
    const playlists = await recursiveReadDir(
      new URL(`${homedir()}/Music`).pathname,
      "mp3"
    );
    for (let i = 0; i < playlists.length; i++) {
      const pl = playlists[i];
      pl.tracks.sort((a, b) => a.number - b.number);
    }
    mainWindow.webContents.send("folder", playlists);
  });
  mainWindow.maximize();
  window = mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

//Window control commands
ipcMain.on("close-window", () => {
  app.quit();
});

ipcMain.on("minimize-window", () => {
  BrowserWindow.getFocusedWindow().minimize();
});

ipcMain.on("tray-window", () => {
  BrowserWindow.getFocusedWindow().hide();
});