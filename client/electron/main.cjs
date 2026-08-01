const { app, BrowserWindow, Menu } = require('electron')

const isDev = !app.isPackaged
const APP_URL = isDev ? 'http://localhost:5173' : 'https://lms-main-prod.vercel.app'

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.loadURL(APP_URL)

//   if (isDev) {
//     win.webContents.openDevTools()
//   }
  win.webContents.openDevTools()

  win.once('ready-to-show', () => win.show())
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
