const { app, BrowserWindow, globalShortcut, Menu } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');

let mainWindow = null;
let debugOn    = isDev;

const instanceLock = app.requestSingleInstanceLock();

if (!instanceLock) {
  app.quit();
}
else {
  app.on('second-instance', (event, argv, workingDirectory) => {
    if (mainWindow) {
      console.log('Second instance launched. Focus on currently running instance if minimized.');

      if (mainWindow.isMinimized()) {
        mainWindow.restore();
        mainWindow.focus();
      }
    }
  });
}

function createWindow() {
  if (mainWindow) {
    return; // nop: already created
  }

  console.log('Create main window');
  
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
    backgroundColor: '#2e2c29',
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  })

  if (debugOn) {
    enableDebugTools();
  }
}

function createMenu() {
  var template = [{
        label: "Application",
        submenu: [
          { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
          { type: "separator" },
          { label: "Quit", accelerator: "CmdOrCtrl+Q", click: function() { app.quit(); }}
        ]}, {
        label: "Edit",
        submenu: [
          { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
          { label: "Redo", accelerator: "CmdOrCtrl+Shift+Z", selector: "redo:" },
          { type: "separator" },
          { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
          { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
          { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
          { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]}
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on('ready', () => {
  const result = globalShortcut.register('CommandOrControl+Shift+I', enableDebugTools);

  if (!result) {
    console.log('Failed registering ctrl+shift+I keyboard binding for debug tools');
  }
  else if (globalShortcut.isRegistered('CommandOrControl+Shift+I')) {
    console.log('Successfully registered ctrl+shift+I keyboard binding for debug tools')
  }
  else {
    console.log('Failed registering ctrl+shift+I keyboard binding for debug tools');
  }

  createWindow();
  createMenu();
});

app.on('activate', () => {
  // Handle MacOS-ism. Typically, apps create a window when the icon on
  // the dock is pressed and no other window is open
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  // Handle MacOS-ism. Typically, apps leave their menu bar active until
  // the user explicitly quits the app with Cmd+Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function enableDebugTools() {
  debugOn = true;

  if (mainWindow) {
    mainWindow.webContents.openDevTools({ mode: 'undocked' });
  }
}
