// Modules to control application life and create native browser window
const { BrowserWindow, Menu, MenuItem, ipcMain, app, screen  } = require('electron')
const path = require('path')
const { download } = require("electron-dl");
const ipc = ipcMain
const { dialog } = require('electron')
const { google } = require('googleapis');
const fs = require('fs');


// Google drive api credentials
const CLIENT_ID = '1030032301297-iu6nhih0fg4p7temv1b653egltob6n6r.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04_lG1cBa7r9JCgYIARAAGAQSNwF-L9IrlKOvW20-lbROSdUnHttqQyFObb4N1gU4RHAiM8igUVa09S8fXmkj5DRW73bYPz2bijc';
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
const drive = google.drive({ version: 'v3', auth: oauth2Client, });


app.disableHardwareAcceleration();

// Create browser window
function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    const mainWindow = new BrowserWindow({
        width: width,
        height: (width/5) * 3,
        
        // minimizable: false,
        maximizable: false,
        resizable: false,
        movable: false,
        icon: path.join(__dirname, "src/img/appicon.ico"),

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            devTools: true,
            //devTools: false,
        }
    })
    //mainWindow.setAlwaysOnTop(true, 'screen');

    createFiles();

    // Main window close confirmation messege
    mainWindow.on('close', function(e) {
        const choice = require('electron').dialog.showMessageBoxSync(this, {
            type: 'none',
            buttons: ['Yes', 'No'],
            noLink: true,
            title: 'Confirm',
            message: 'Are you sure you want to exit?',
            icon: path.join(__dirname, "src/img/appicon.ico"),


        });
        if (choice === 1) {
            e.preventDefault();
        }
        app.quit;
    });

    // Session timout message
    ipcMain.on('timeOut', async() => {
        const confirm = await dialog.showMessageBox(mainWindow, {
            title: "",
            type: 'none',
            noLink: true,
            message: 'The session has timed out. Do you want log in again?',
            buttons: ["Log in", "Cancel"],
            icon: path.join(__dirname, "src/img/appicon.ico"),
        })
        if (confirm.response === 0) {
            mainWindow.loadFile('src/loginpage.html')
        }
    })


    // no default menu
    mainWindow.setMenu(null);

    // load main page
    mainWindow.loadFile('src/loginpage.html');
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    // console.log(app.getAppPath())
    // Load pages
    ipc.on('Login', () => { mainWindow.loadFile('src/loginpage.html') })
    ipc.on('home', () => { mainWindow.loadFile('src/home.html') })
    ipc.on('dashboard', () => { mainWindow.loadFile('src/dashboard.html') })
    ipc.on('course', () => { mainWindow.loadFile('src/courses.html') })
    ipc.on('schedule', () => { mainWindow.loadFile('src/schedule.html') })
    ipc.on('upload', () => { mainWindow.loadFile('src/upload.html') })
    ipc.on('settings', () => { mainWindow.loadFile('src/settings.html') })
    ipc.on('help', () => { mainWindow.loadFile('src/help.html') })
    ipc.on('exam room', () => { mainWindow.loadFile('src/examroom.html') })


    // Download recorded videos
    ipcMain.on("download", async(event, { url, fileName }) => {
        const win = BrowserWindow.getFocusedWindow();

        await download(win, url, {
            filename: fileName + '.mp4',
            directory: app.getPath("documents") + '/Connexa/recordedVideo',
            showBadge: true,
            overwrite: false,
            onCompleted: () => {
                event.reply('done')
            }
        }).then(dl => console.log(dl.getSavePath()))
    });


    // upload videos to google drive
    ipc.on("googleDriveUpload", async(event, { fileName, drivePath }) => {
        console.log(fileName, drivePath)
        uploadFile(event, fileName, drivePath.split('/folders/')[1])
    })

    // send document folder path
    ipc.on("getDocumentPath", async(event) => {
        event.reply("documentPath", {
            documentPath: app.getPath("documents")
        })
    })
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()

    app.on('activate', function() {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})



// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


// method to upload videos to google drive
async function uploadFile(event, file, folderpath) {
    try {
        const filePath = app.getPath("documents") + "\\Connexa\\recordedVideo\\" + file;
        console.log(filePath)
        const response = await drive.files.create({
            media: {
                mimeType: 'application/octet-stream',
                body: fs.createReadStream(filePath),
                resumable: true,
            },
            resource: {
                'name': file,
                parents: [folderpath]
            },
            fields: 'id'
        });
        console.log(response.data);
        event.reply('done', {
            errormsg: 'noError',
        })
    } catch (error) {
        event.reply('done', {
            errormsg: error.message,
        })
    }
}


//create required files if not exists
function createFiles() {
    const src = app.getPath("documents") + '/Connexa'
    const folder1 = app.getPath("documents") + "/Connexa/recordedVideo";
    const folder2 = app.getPath("documents") + "/Connexa/json";
    const file = app.getPath("documents") + "/Connexa/json/user_servers.json"

    if (!fs.existsSync(src)) { //check if folder already exists
        fs.mkdirSync(src); //creating folder
    }

    if (!fs.existsSync(folder1)) { //check if folder already exists
        fs.mkdirSync(folder1); //creating folder
    }
    if (!fs.existsSync(folder2)) { //check if folder already exists
        fs.mkdirSync(folder2); //creating folder
    }
    // Check if the file exists in the current directory.
    fs.access(file, fs.constants.F_OK, (err) => {
        if (err) {
            fs.writeFile(file, '{}', function(err) {
                if (err) throw err;
                console.log('File is created successfully.');
            })
        }
    });
}