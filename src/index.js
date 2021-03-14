const { app, BrowserWindow,ipcRenderer } = require('electron');
const path = require('path');
const osUtils = require('os-utils');
const os = require('os');
const si = require('systeminformation');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}


const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();


  function checkPlatform(platform) {
    switch (platform) {
      case 'darwin':
        return "MacOs";
        break;
      case 'win32':
        return "Windows";
        break;
      default:
        return platform;
        break;
    }
  }
  

  setInterval(() => {
    const datas = {};

    si.system(function(sys){
      datas.system = sys;
      datas.platform = `${os.type()}/${os.release()}/${checkPlatform(os.platform())}`;

      osUtils.cpuUsage(function(v){
        datas.cpuUsage = v*100;
        si.mem(function(mem){
          datas.mem = mem;
          si.cpu().then(cpu=>{
            datas.cpu = cpu;
            si.cpuTemperature().then(cpuTemperature=>{
              datas.cpuTemperature = {main:cpuTemperature.main};
              si.graphics().then(graphics=>{
                datas.graphics = graphics;
                mainWindow.webContents.send('datas',datas);
              }).catch(error=>mainWindow.webContents.send('datas',datas));
            }).catch(error=>mainWindow.webContents.send('datas',datas));
          }).catch(error=>mainWindow.webContents.send('datas',datas));
        });
        //mainWindow.webContents.send('datas',datas);
      });
    });

    
    
  },1500);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


