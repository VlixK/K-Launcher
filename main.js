//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                    No BUG no BUG
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const { app, BrowserWindow, ipcMain, globalShortcut, dialog, ipcRenderer, webContents } = require("electron");
const { autoUpdater, AppUpdater } = require('electron-updater');
const Server = require("./Server");
const CFG = require("./config.json");
const Shell = require('node-powershell');
const { download } = require('electron-dl');
const os = require('os');
const fs = require('fs');
const ini = require('ini');
const settingsPath = 'c:/Temporary/Home-Launcher/settings';
let win = null;
let isServerOnline;
let overlayWindow = null;
let aboutWindow = null;
let ipWindow = null;
let nyWindow = null;
let nyWindowConfirm = null;
let playerList = null;
let cacheWindow = null;
let isOverlayOpened = false;
let IMGSRC = null;
let configAddIP;
let configChangeIMG;
let configDeleteIP;
let configPlayersTemp = true;
let configDefault;
let configdownloadServers;
let configAutoUpdate;
let configLanguage;


const createWindow = async () => {
    win = new BrowserWindow({
        width: 1400,
        height: 800,
        resizable: false,
        frame: false,
        icon: 'icon.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false,
        }
    });

    win.loadFile('index.html');

    //OVERLAY IS WORKING BUT YOU MIGHT FIND SOME ISSUES
    // if(CFG.useOverlay){
    //     globalShortcut.register('Alt+Shift+S', () =>{

    //         find('name', 'FiveM', true)
    //         .then(function (list) {
    //           console.log('there are %s FiveM process(es)', list.length);
    //           if(list.length > 0){
    //             isOverlayOpened = !isOverlayOpened;
    //             if(isOverlayOpened){
    //                 createOverlayWin();
    //             }else{
    //                if(overlayWindow != null){
    //                 overlayWindow.destroy();
    //                }
    //             }
    //           }
    //         });
    //     });
    // }

}

const createNYWindow = async () => {
    nyWindow = new BrowserWindow({
        width: 430,
        height: 800,
        title: "Ny",
        parent: win,
        resizable: false,
        frame: false,
        icon: 'icon.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false,
        }
    });

    nyWindow.loadFile('forNy.html');
}
const createNYWindowConfirm = async () => {
    nyWindowConfirm = new BrowserWindow({
        width: 430,
        height: 150,
        title: "Ny",
        parent: win,
        resizable: false,
        frame: false,
        icon: 'icon.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false,
        }
    });

    nyWindowConfirm.loadFile('confirm.html');
}

const createAboutWindow = async () => {
    aboutWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: "Thông tin Launcher",
        parent: win,
        resizable: false,
        frame: false,
        icon: 'icon.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false,
        }
    });

    aboutWindow.loadFile('about.html');
}

const createPlayerListWindow = async () => {
    playerList = new BrowserWindow({
        width: 600,
        height: 600,
        title: "Thông tin Player",
        parent: win,
        resizable: false,
        frame: false,
        icon: 'icon.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false,
        }
    });

    playerList.loadFile('playerlist.html');
}

const createIPWindow = async () => {
    ipWindow = new BrowserWindow({
        width: 500,
        height: 670,
        title: "Đổi thành phố",
        parent: win,
        resizable: false,
        frame: false,
        icon: 'icon.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false,
        }
    });

    ipWindow.loadFile('ip.html');
}

const createCacheWindow = async () => {
    cacheWindow = new BrowserWindow({
        width: 600,
        height: 200,
        title: "Cache",
        parent: win,
        resizable: false,
        frame: false,
        icon: 'icon.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false,
        }
    });

    cacheWindow.loadFile('cache.html');
}

const createOverlayWin = () => {
    overlayWindow = new BrowserWindow({
        width: 800,
        height: 300,
        icon: 'icon.ico',
        titleBarStyle: 'hidden',
        titleBarOverlay: false,
        transparent: true,
        resizable: false,
        fullscreen: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false,
        }
    });

    overlayWindow.loadFile('overlay.html');
}

app.whenReady().then(() => {
    createWindow();
    createLanguages();

    // Looking and saving original config file
    if (!fs.existsSync(`${settingsPath}/config.ini`)) {
        downloadConfig();
    } else {

        // Get setting from disk
        const getSettings = `${settingsPath}/config.ini`;
        const iniContent = fs.readFileSync(getSettings, 'utf-8');   // Read file ini
        const config = ini.parse(iniContent);                       // Parse file
        const databaseConfig = config.Launcher;                     // Read file ini which tag 'Launcher'

        // Checking missing config
        if (iniContent.trim() === '' || !isConfigExists(getSettings, 'configAddIP') || !isConfigExists(getSettings, 'language')
            || !isConfigExists(getSettings, 'configAutoUpdate') || !isConfigExists(getSettings, 'configChangeIMG') || !isConfigExists(getSettings, 'configDeleteIP')
            || !isConfigExists(getSettings, 'configDefault') || !isConfigExists(getSettings, 'configdownloadServers')) {

            if (fs.existsSync(`${settingsPath}/config.ini`)) { fs.unlinkSync(`${settingsPath}/config.ini`); }
            for (let index = 0; index < 10; index++) {
                if (fs.existsSync(`${settingsPath}/config (` + index + `).ini`)) { fs.unlinkSync(`${settingsPath}/config (` + index + `).ini`); }
            }
            download(BrowserWindow.getFocusedWindow(), "https://raw.githubusercontent.com/VlixK/K-Launcher/main/servers/config.ini", { directory: settingsPath })
            win.webContents.executeJavaScript("location.reload()");
        } else {
            configAddIP = databaseConfig.configAddIP;
            configChangeIMG = databaseConfig.configChangeIMG;
            configDeleteIP = databaseConfig.configDeleteIP;
            configDefault = databaseConfig.configDefault;
            configdownloadServers = databaseConfig.configdownloadServers;
            configAutoUpdate = databaseConfig.configAutoUpdate;
            configLanguage = databaseConfig.language;
        }
        // win.webContents.executeJavaScript("location.reload()");
    }

    //Check servers
    if (!fs.existsSync(`${settingsPath}/servers.json`)) {
        copyToLocalServer();
    } else {
        const arrayServer = require(`${settingsPath}/servers.json`);
        const missingSVName = arrayServer.find(item => typeof item.svname === 'undefined');
        const missingCode = arrayServer.find(item => typeof item.code === 'undefined');
        const missingIP = arrayServer.find(item => typeof item.ip === 'undefined');
        const missingSVImage = arrayServer.find(item => typeof item.svimage === 'undefined');
        if (missingSVName || missingCode || missingIP || missingSVImage) {
            //  win.webContents.executeJavaScript(`window.alert("missing");`);
            download(BrowserWindow.getFocusedWindow(), "https://raw.githubusercontent.com/VlixK/K-Launcher/main/servers/servers.json", { directory: settingsPath })
            win.webContents.executeJavaScript("location.reload()");
        } else {

            // Reload Server Config
            if (configdownloadServers) {
                // Looking and downloading new servers
                if (fs.existsSync(`${settingsPath}/servers.json`)) {
                    fs.unlinkSync(`${settingsPath}/servers.json`);
                    download(BrowserWindow.getFocusedWindow(), "https://raw.githubusercontent.com/VlixK/K-Launcher/main/servers/servers.json", { directory: settingsPath })
                    win.webContents.executeJavaScript("location.reload()");
                    for (let index = 0; index < 5; index++) {
                        if (fs.existsSync(`${settingsPath}/servers (` + index + `).json`)) { fs.unlinkSync(`${settingsPath}/servers (` + index + `).json`); }
                    }
                }
                win.webContents.executeJavaScript("location.reload()");
            }
        }
    }

    // win.webContents.executeJavaScript(`window.alert("${configDefault}");`);

    win.webContents.on('did-finish-load', function () {
        serverStatus(JSON.stringify(CFG.servers[0].ip));

        //Delete files duplication
        for (let index = 0; index < 10; index++) {
            // if (fs.existsSync(`${settingsPath}/settings (` + index + `).json`)) { fs.unlinkSync(`${settingsPath}/settings (` + index + `).json`); }
            if (fs.existsSync(`${settingsPath}/servers (` + index + `).json`)) { fs.unlinkSync(`${settingsPath}/servers (` + index + `).json`); }
            if (fs.existsSync(`${settingsPath}/img (` + index + `).json`)) { fs.unlinkSync(`${settingsPath}/img (` + index + `).json`); }
            if (fs.existsSync(`${settingsPath}/players (` + index + `).json`)) { fs.unlinkSync(`${settingsPath}/players (` + index + `).json`); }
            if (fs.existsSync(`${settingsPath}/config (` + index + `).ini`)) { fs.unlinkSync(`${settingsPath}/config (` + index + `).ini`); }
            if (fs.existsSync(`${settingsPath}/languages/vi-VN (` + index + `).json`)) { fs.unlinkSync(`${settingsPath}/languages/vi-VN (` + index + `).json`); }
            if (fs.existsSync(`${settingsPath}/languages/en-US (` + index + `).json`)) { fs.unlinkSync(`${settingsPath}/languages/en-US (` + index + `).json`); }
        }

        //Load cover/video
        if (fs.existsSync(`${settingsPath}/img.json`)) {
            const IMGSRC = require(`${settingsPath}/img.json`);
            win.webContents.send('sendImgURL', IMGSRC.imgPath);
        } else {
            win.webContents.send('sendImgURL', './img/4.gif');
        }

        //Check config
        // if (!fs.existsSync(`${settingsPath}/config.ini`)) {
        //     !fs.existsSync(settingsPath) && fs.mkdirSync(settingsPath, { recursive: true })
        //     download(BrowserWindow.getFocusedWindow(), "https://raw.githubusercontent.com/VlixK/K-Launcher/main/servers/config.ini", { directory: settingsPath })
        //     win.webContents.executeJavaScript("location.reload()");
        // }

    });

    // win.webContents.executeJavaScript("location.reload()");
    //Check update
    if (configAutoUpdate) {
        autoUpdater.checkForUpdates();
    }
});

// Check config
function isConfigExists(filePath, configName) {
    try {
        // Reading .ini
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        // Finding to check
        const configRegex = new RegExp(`\\b${configName}\\b`, 'i');
        return configRegex.test(fileContent);
    } catch (error) {
        // If error return false
        return false;
    }
}

//Downloading server
const copyToLocalServer = () => {
    !fs.existsSync(settingsPath) && fs.mkdirSync(settingsPath, { recursive: true })
    //dowload servers from github
    if (!fs.existsSync(`${settingsPath}/servers.json`)) {
        download(BrowserWindow.getFocusedWindow(), "https://raw.githubusercontent.com/VlixK/K-Launcher/main/servers/servers.json", { directory: settingsPath })
        win.webContents.executeJavaScript("location.reload()");
    }
}


// Downloading Config
const downloadConfig = () => {
    !fs.existsSync(`${settingsPath}`) && fs.mkdirSync(`${settingsPath}`, { recursive: true })
    //dowload servers from github
    if (!fs.existsSync(`${settingsPath}/config.ini`)) {
        download(BrowserWindow.getFocusedWindow(), "https://raw.githubusercontent.com/VlixK/K-Launcher/main/servers/config.ini", { directory: settingsPath })
        win.webContents.executeJavaScript("location.reload()");
    }
}

// Download languages files
const createLanguages = () => {
    if (fs.existsSync(`${settingsPath}/languages/vi-VN.json`)) { fs.unlinkSync(`${settingsPath}/languages/vi-VN.json`); }
    if (fs.existsSync(`${settingsPath}/languages/en-US.json`)) { fs.unlinkSync(`${settingsPath}/languages/en-US.json`); }
    !fs.existsSync(`${settingsPath}/languages`) && fs.mkdirSync(`${settingsPath}/languages`, { recursive: true })
    const mainLangFileVN = require('./settings/vi-VN.json');
    const mainLangFileUS = require('./settings/en-US.json');
    let sDataVN = JSON.stringify(mainLangFileVN);
    let sDataUS = JSON.stringify(mainLangFileUS);
    fs.writeFileSync(`${settingsPath}/languages/vi-VN.json`, sDataVN);
    fs.writeFileSync(`${settingsPath}/languages/en-US.json`, sDataUS);
    win.webContents.executeJavaScript("location.reload()");
}

// Load languages files but not working
const createConfigFile = () => {
    !fs.existsSync(`${settingsPath}`) && fs.mkdirSync(`${settingsPath}`, { recursive: true })
    const iniPath = './settings/config.ini';
    const iniData = fs.readFileSync(iniPath, 'utf-8');
    const config = ini.parse(iniData);
    fs.writeFileSync(`${settingsPath}/config.ini`, config, 'utf-8');;
    win.webContents.executeJavaScript("location.reload()");
}

//Tải lại server
ipcMain.on('reloadSV', (event, data) => {
    !fs.existsSync(settingsPath) && fs.mkdirSync(settingsPath, { recursive: true })
    if (!fs.existsSync(`${settingsPath}/server.json`)) {
        download(BrowserWindow.getFocusedWindow(), "https://raw.githubusercontent.com/VlixK/K-Launcher/main/servers/servers.json", { directory: settingsPath })
        win.webContents.executeJavaScript("location.reload()");
    } else {
        fs.unlinkSync(`${settingsPath}/server.json`);
        download(BrowserWindow.getFocusedWindow(), "https://raw.githubusercontent.com/VlixK/K-Launcher/main/servers/servers.json", { directory: settingsPath })
        for (let index = 0; index < 5; index++) {
            if (fs.existsSync(`${settingsPath}/servers (` + index + `).json`)) { fs.unlinkSync(`${settingsPath}/servers (` + index + `).json`); }
        }
        win.webContents.executeJavaScript("location.reload()");
    }
})

ipcMain.on('removeImg', (event, data) => {
    !fs.existsSync(settingsPath) && fs.mkdirSync(settingsPath, { recursive: true })
    if (fs.existsSync(`${settingsPath}/img.json`)) {
        fs.unlinkSync(`${settingsPath}/img.json`);
        win.webContents.executeJavaScript("location.reload()");
    }
})

ipcMain.on('appClose', (event, data) => {
    win.close();
    aboutWindow = null;
    ipWindow = null;
    nyWindow = null;
    nyWindowConfirm = null;
    playerList = null;
    if (fs.existsSync(`${settingsPath}/players.json`)) { fs.unlinkSync(`${settingsPath}/players.json`); }
})

ipcMain.on('overlayClose', (event, data) => {
    overlayWindow.close();
    overlayWindow = null;
})

ipcMain.on('aboutOpen', (event, data) => {
    if (!aboutWindow) {
        createAboutWindow();
    } else {
        aboutWindow.close();
        aboutWindow = null;
        createAboutWindow();
    }
})
ipcMain.on('aboutClose', (event, data) => {
    if (aboutWindow) {
        aboutWindow.close();
        aboutWindow = null;
    }
})

ipcMain.on('playerListOpen', (event, data) => {
    if (!playerList) {
        createPlayerListWindow();
        ipcMain.on('getListPlayers', (event, data) => {
            if (playerList) {
                playerList.webContents.send("listPlayers", data);
            }
        });
    } else {
        playerList.close();
        playerList = null;
        createPlayerListWindow();
        ipcMain.on('getListPlayers', (event, data) => {
            if (playerList) {
                playerList.webContents.send("listPlayers", data);
            }
        });
    }

})
ipcMain.on('playerListClose', (event, data) => {

    playerList.close();
    if (fs.existsSync(`${settingsPath}/players.json`)) { fs.unlinkSync(`${settingsPath}/players.json`); }
    playerList = null;

})

ipcMain.on('changeIPOpen', (event, data) => {
    if (!ipWindow) {
        createIPWindow();
    } else {
        ipWindow.close();
        ipWindow = null;
        createIPWindow();
    }

})
ipcMain.on('changeIPClose', (event, data) => {
    if (ipWindow) {
        ipWindow.close();
        ipWindow = null;
    }

})

ipcMain.on('cacheOpen', (event, data) => {
    if (!cacheWindow) {
        createCacheWindow();
    } else {
        cacheWindow.close();
        cacheWindow = null;
        createCacheWindow();
    }
})
ipcMain.on('cacheClose', (event, data) => {
    if (cacheWindow) {
        cacheWindow.close();
        cacheWindow = null;
    }
})

ipcMain.on('openForNy', (event, data) => {
    if (!nyWindow) {
        createNYWindow();
    } else {
        nyWindow.close();
        nyWindow = null;
        createNYWindow();
    }

})
ipcMain.on('forNyClose', (event, data) => {
    nyWindow.close();
    nyWindow = null;
})


ipcMain.on('openConfirmWindow', (event, data) => {
    if (!nyWindowConfirm) {
        createNYWindowConfirm();
    } else {
        nyWindowConfirm.close();
        nyWindowConfirm = null;
        createNYWindowConfirm();
    }

})
ipcMain.on('closeConfirmWindow', (event, data) => {
    nyWindowConfirm.close();
    nyWindowConfirm = null;
})


ipcMain.on('reloadwin', (e, data) => {
    win.webContents.executeJavaScript("location.reload()");
})

//Check and send url local file
ipcMain.on('open-file', function (event) {
    const types = [{ name: 'Files', extensions: ['jpg', 'png', 'gif', 'mp4', 'webm', 'ogg'] }];
    const properties = os.platform() === 'linux' || os.platform() === 'win32' ? ['openFile'] : ['openFile', 'openDirectory'];

    dialog.showOpenDialog({ properties, filters: types }, types).then((data) => {
        if (data.filePaths.length > 0) {
            //window.alert(`Path: ${data.filePaths[0]}`); 
            event.sender.send('selected-file', data.filePaths[0])
        }
    })
})

//Check and send url local file
ipcMain.on('open-fileIP', function (event) {
    const types = [{ name: 'Files', extensions: ['jpg', 'png', 'gif', 'bmp', 'webp', 'ico'] }];
    const properties = os.platform() === 'linux' || os.platform() === 'win32' ? ['openFile'] : ['openFile', 'openDirectory'];

    dialog.showOpenDialog({ properties, filters: types }, types).then((data) => {
        if (data.filePaths.length > 0) {
            //window.alert(`Path: ${data.filePaths[0]}`); 
            event.sender.send('selected-fileIP', data.filePaths[0])
        }
    })
})

//Save IMG/Video to local disk
ipcMain.on('saveDataIMG', (sender, data) => {
    let a = { imgPath: data }
    let sData = JSON.stringify(a);
    !fs.existsSync(settingsPath) && fs.mkdirSync(settingsPath, { recursive: true })
    // save cover
    fs.writeFileSync(`${settingsPath}/img.json`, sData);
});

// Delete TP FINAL
ipcMain.on('getSVNameToDelete', (sender, data) => {
    const getLang = require(`${settingsPath}/languages/${configLanguage}.json`);
    const tServer = require(`${settingsPath}/servers.json`);
    const a = tServer.filter(x => x.svname !== data);
    let sData = JSON.stringify(a);
    if (configDeleteIP) {
        fs.writeFileSync(`${settingsPath}/servers.json`, sData);
        // win.webContents.executeJavaScript(`window.alert("${getLang.deletedServer}");`);
        app.relaunch();
        app.quit();

    } else {
        win.webContents.executeJavaScript(`window.alert("${getLang.alertconfigDeleteIP}");`);
    }
})

// Set Default
ipcMain.on('getSVNameToDefault', (sender, data) => {
    const getLang = require(`${settingsPath}/languages/${configLanguage}.json`);
    const tServer = require(`${settingsPath}/servers.json`);
    const nameIndex = tServer.findIndex(x => x.svname === data);
    tServer.push(...tServer.splice(0, nameIndex));

    let sData = JSON.stringify(tServer);
    if (configDefault) {
        fs.writeFileSync(`${settingsPath}/servers.json`, sData);
        win.webContents.executeJavaScript(`window.alert("${getLang.setDefault}");`);
    } else {
        win.webContents.executeJavaScript(`window.alert("${getLang.alertconfigSetDefault}");`);
    }

})

//Add Server FINAL
ipcMain.on('addNewIP', (sender, data) => {
    const getLang = require(`${settingsPath}/languages/${configLanguage}.json`);
    const tServer = require(`${settingsPath}/servers.json`);

    Array.prototype.unshift.apply(tServer, data);
    let sData = JSON.stringify(tServer);

    if (configdownloadServers) {
        win.webContents.executeJavaScript(`window.alert("${getLang.addIPDisableTempMess}");`);
        fs.writeFileSync(`${settingsPath}/servers.json`, sData);
    } else {
        if (configAddIP) {
            fs.writeFileSync(`${settingsPath}/servers.json`, sData);
            app.relaunch();
            // win.webContents.executeJavaScript(`window.alert("${getLang.addedServer}");`);
            app.quit();
        } else {
            win.webContents.executeJavaScript(`window.alert("${getLang.alertconfigAddIP}");`);
        }
    }
})

//Save Data Player Temp
ipcMain.on('saveTempList', (sender, data) => {
    !fs.existsSync(settingsPath) && fs.mkdirSync(settingsPath, { recursive: true })
    let sData = JSON.stringify(data);
    if (configPlayersTemp) {
        fs.writeFileSync(`${settingsPath}/players.json`, sData);
    }
})

ipcMain.on('deleteCache', (sender, data) =>{
    win.webContents.send('getDeleteCache', data);
})

ipcMain.on('minimizeApp', (event, data) => {
    win.minimize();
})

ipcMain.on('opendc', (event, data) => {
    const ps = new Shell();
    ps.addCommand("start " + JSON.stringify(CFG.discord));
    ps.invoke();
});

ipcMain.on('counter', (event, data) => {
    const incrementedNumber = parseInt(data) + 1;
    win.webContents.send('updateNumber', incrementedNumber);
});

ipcMain.on('counterMinus', (event, data) => {
    if (parseInt(data) < 1) return;
    const decrementedNumber = parseInt(data) - 1;
    win.webContents.send('updateNumber', decrementedNumber);
});

ipcMain.on('fivemOpened', (event, data) => {
    win.webContents.send('fivemCheck', data);
});

ipcMain.on('serverStatus', (event, data) => {
    const API = new Server(data);
    API.getServerStatus().then((val) => {
        isServerOnline = val.online;
        win.webContents.send("StatusChecker", isServerOnline);
    });
});

ipcMain.on('serverStatusOv', (event, data) => {
    const API = new Server(data);
    API.getServerStatus().then((val) => {
        isServerOnline = val.online;
        overlayWindow.webContents.send("StatusCheckerOv", isServerOnline);
    });
});

const serverStatus = async (ip) => {
    const API = new Server(ip);
    API.getServerStatus().then((val) => {
        isServerOnline = val.online;
        win.webContents.send("updateStatus", isServerOnline);
    });
}

ipcMain.on('getConnectedPlayers', (event, data) => {
    const API = new Server(data);
    API.getPlayersList().then((val) => {
        win.webContents.send("listPlayers", val);
        // if(playerList){ playerList.webContents.send("listPlayersView",val); }

    });
});
ipcMain.on('getConnectedPlayersShow1', (event, data) => {
    playerList.webContents.send("getConnectedPlayersShow", data);
});

ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
    win.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});

ipcMain.on('relaunchApp', () => {
    app.relaunch();
    app.quit();
})