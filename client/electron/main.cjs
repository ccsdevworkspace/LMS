const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'

const isDev = !app.isPackaged

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  win.once('ready-to-show', () => win.show())
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  createWindow()
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})