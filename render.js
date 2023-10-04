//
//_      `-._     `-.     `.   \      :      /   .'     .-'     _.-'      _
// `--._     `-._    `-.    `.  `.    :    .'  .'    .-'    _.-'     _.--'
//      `--._    `-._   `-.   `.  \   :   /  .'   .-'   _.-'    _.--'
//`--.__     `--._   `-._  `-.  `. `. : .' .'  .-'  _.-'   _.--'     __.--'
//__    `--.__    `--._  `-._ `-. `. \:/ .' .-' _.-'  _.--'    __.--'    __
//  `--..__   `--.__   `--._ `-._`-.`_=_'.-'_.-' _.--'   __.--'   __..--'
//--..__   `--..__  `--.__  `--._`-q(-_-)p-'_.--'  __.--'  __..--'   __..--
//      ``--..__  `--..__ `--.__ `-'_) (_`-' __.--' __..--'  __..--''
//...___        ``--..__ `--..__`--/__/  \--'__..--' __..--''        ___...
//      ```---...___    ``--..__`_(<_   _/)_'__..--''    ___...---'''
//```-----....._____```---...___(__\_\_|_/__)___...---'''_____.....-----'''
//


const ipcRenderer = require("electron").ipcRenderer;
const { remote } = require('electron');
const find = require('find-process');
const CFG = require("./config.json");
const serverJSON = require("c://Temporary//Home-Launcher//settings//servers.json");
const si = require('systeminformation');
var IPServer = CFG.servers[0].ip; // Using if not using add/remove or set default server.
var IPServerJSON = serverJSON[0].code;
var svpos = 0;
const ini = require('ini');
const fs = require('fs');
const regedit = require('regedit');
regedit.setExternalVBSLocation('resources/regedit/vbs')
const Shell = require('node-powershell');
const { table } = require("console");
const { exec } = require('child_process');
const settingsPath = 'c:/Temporary/Home-Launcher/settings';
var DIR_FiveM = "";
var DIR_GTA5 = "";
const dataList = [];
const getSettings = "c://Temporary//Home-Launcher//settings//config.ini";
const iniContent = fs.readFileSync(getSettings, 'utf-8');   // Read file ini
const config = ini.parse(iniContent);                       // Parse file
const databaseConfig = config.Launcher;                     // Read file ini which tag 'Launcher'


const getLang = require(`c://Temporary//Home-Launcher//settings//languages//${databaseConfig.language}.json`);


const openDiscord = () => {
    ipcRenderer.send("opendc"
    );
}

const addNumber = () => {
    ipcRenderer.send(
        "counter",
        document.querySelector("#c").innerText
    );
}

const minimizeApp = () => {
    ipcRenderer.send("minimizeApp")
}

const closeApp = () => {
    ipcRenderer.send("appClose")
    ipcRenderer.send("aboutClose")
    ipcRenderer.send("changeIPClose")
}

const closeAboutApp = () => {
    ipcRenderer.send("aboutClose")
}

const closeIPApp = () => {
    ipcRenderer.send("changeIPClose")
    ipcRenderer.send("reloadwin")
}

const closeNy = () => {
    ipcRenderer.send("forNyClose")
}
const closeConfirmNY = () => {
    ipcRenderer.send("closeConfirmWindow")
}

const closePlayerList = () => {
    ipcRenderer.send("playerListClose")
}


if (serverJSON.length > 1) {
    let container = document.getElementById("cnt");

    let lArrow = document.createElement("span");
    lArrow.id = "la";
    lArrow.style.display = "none";
    lArrow.className = "material-icons";
    lArrow.innerText = "arrow_back_ios";
    lArrow.style.cursor = "pointer";
    container.prepend(lArrow);

    let rArrow = document.createElement("span");
    rArrow.id = "lr";
    rArrow.className = "material-icons";
    rArrow.innerText = "arrow_forward_ios";
    rArrow.style.cursor = "pointer";
    container.appendChild(rArrow);
    lArrow.onclick = () => { serverSwitcher(0, lArrow, rArrow); };
    rArrow.onclick = () => { serverSwitcher(1, lArrow, rArrow); };
    serverSwitcher(null, lArrow, rArrow);
} else {
    serverSwitcher(null, null, null);
}


var isOnline = false;
function serverSwitcher(pos, lArrow, rArrow) {
    let helloText = document.getElementById("helloText");

    // Hello text
    helloText.innerText = `${getLang.hello}`;

    let plist = document.getElementById("plist");
    plist.textContent = "";

    let svtotalJSON = serverJSON.length - 1;

    if (pos == 1 || pos == null) {
        if (pos != null) {
            svpos += 1;
        }
        if (svpos > svtotalJSON) {
            //DO NOTHING AND REMOVE RIGHT ARROW (return)
            rArrow.style.display = "none";
            return;
        }
        if (svtotalJSON > 0) {
            if (svpos == svtotalJSON) {
                rArrow.style.display = "none";
            } else {
                rArrow.style.display = "flex";
            }
            if (svpos > 0) {
                lArrow.style.display = "flex";
            } else {
                lArrow.style.display = "none";
            }
        }

        IPServerJSON = serverJSON[svpos].code
    }
    if (pos == 0) {
        svpos -= 1;
        if (svpos < 0) {
            //DO NOTTING AND REMOVE LEFT ARROW (return)
            lArrow.style.display = "none";
            return;
        }
        if (svpos == svtotalJSON) {
            lArrow.style.display = "none";
        } else {
            rArrow.style.display = "flex";
        }

        if (svpos == 0) {
            lArrow.style.display = "none";
        }
        if (svpos < svtotalJSON) {
            rArrow.style.display = "flex";
        } else {
            rArrow.style.display = "none";
        }
        IPServerJSON = serverJSON[svpos].code;
    }

    ipcRenderer.removeAllListeners('serverStatus');
    ipcRenderer.send(
        "serverStatus",
        serverJSON[svpos].code
    );

    let svnamePlaceHolder = document.getElementById("sv-name");
    let svStatusPlaceHolder = document.getElementById("sv-stat");
    let playBtn = document.getElementById("sv-join");
    let imgServer = document.getElementById('imgServer');

    svStatusPlaceHolder.style.backgroundColor = "grey";
    svStatusPlaceHolder.style.boxShadow = "0px 0px 4px 3px rgba(24, 24, 24, 0.25)";
    svStatusPlaceHolder.classList.remove("animStatus");
    svStatusPlaceHolder.title = "Offline";
    playBtn.innerText = "hourglass_empty"
    svnamePlaceHolder.innerText = serverJSON[svpos].svname;
    imgServer.src = serverJSON[svpos].svimage;
    ipcRenderer.removeAllListeners('StatusChecker');
    ipcRenderer.on("StatusChecker", (event, data) => {
        if (data) {
            isOnline = true;
            svStatusPlaceHolder.style.backgroundColor = "var(--green)";
            svStatusPlaceHolder.style.boxShadow = "0px 0px 4px 3px rgba(51, 255, 0, 0.25)";
            svStatusPlaceHolder.classList.add("animStatus");
            svStatusPlaceHolder.title = "Online";
            playBtn.style.cursor = "pointer";
            playBtn.title = getLang.titleBtnPlay;
            //Get Directory FiveM
            regedit.list("HKCU\\SOFTWARE\\CitizenFX\\FiveM", function (err, result) {
                $.each(result, function (index, data) {
                    try {
                        if (data.values["Last Run Location"].value) {
                            DIR_FiveM = data.values["Last Run Location"].value;
                            if (fs.existsSync(DIR_FiveM)) {
                                $("#sv-join").prop("disabled", false).text("play_circle_filled");
                            } else {
                                $("#sv-join").prop("disabled", true).text("close");
                            }
                            return;
                        }
                    } catch (error) {
                        $("#sv-join").prop("disabled", true).text("error").attr("title", `${getLang.notInstallFiveM}`);
                    }

                });
            });

            $("#sv-join").on("click", function () {
                if (fs.existsSync(DIR_FiveM)) {
                    $("#sv-join").prop("disabled", true).text("hourglass_empty").css("pointer-events", "none");

                    StartFiveM(svpos);

                    setTimeout(function () {
                        $("#sv-join").prop("disabled", false).text("play_circle_filled").css("pointer-events", "auto");
                    }, 2000);
                }
            });



            if (isOnline) {
                ipcRenderer.removeAllListeners('getConnectedPlayers');
                ipcRenderer.send(
                    "getConnectedPlayers",
                    serverJSON[svpos].code
                );
                ipcRenderer.removeAllListeners('listPlayers');
                ipcRenderer.on("listPlayers", (event, data) => {
                    const totalplayersText = getLang.totalPlayer.replace('[player]', data.length); // Get and replage how many players in server

                    let totalPlayers = document.getElementById("nguoichoi");
                    totalPlayers.innerText = totalplayersText;
                    let plist = document.getElementById("plist");
                    if (data.length > 0) {
                        for (var y = 0; y <= data.length - 1; y++) {
                            dataList.push({ code: IPServerJSON, name: data[y].name, id: data[y].id });
                        }
                    }
                });
            }

        } else {
            isOnline = false;
            svStatusPlaceHolder.style.backgroundColor = "var(--red)";
            svStatusPlaceHolder.style.boxShadow = "0px 0px 4px 3px rgba(255, 0, 0, 0.25);";
            playBtn.setAttribute("disabled", true);
            playBtn.innerText = "signal_wifi_connected_no_internet_4";
            playBtn.style.cursor = "not-allowed";
            playBtn.title = getLang.serverOffline;
            svStatusPlaceHolder.classList.remove("animStatus");

            let totalPlayers = document.getElementById("nguoichoi");
            totalPlayers.innerText = `${getLang.serverOffline}`;
        }
    });
}

// Run FiveM using PowerShell
function runPowerShellCommand(command) {
    const ps = new Shell({ executionPolicy: 'Bypass', noProfile: true });

    return ps.addCommand(command)
        .then(() => ps.invoke()
            .then(output => {
                setTimeout(function () {
                    ps.dispose();
                }, 20000);
                return output;
            }))
        .catch(error => {
            setTimeout(function () {
                ps.dispose();
            }, 20000);
            throw error;
        });
}

// Same like name
function StartFiveM(number) {
    if (serverJSON[number].ip !== '') {
        runPowerShellCommand(`start fivem://connect/${serverJSON[number].ip}`);
    } else {
        runPowerShellCommand(`start fivem://connect/${serverJSON[number].code}`);
    }
}

// Same like name
function deleteCacheFiveM() {
    //testcache.innerText = "dc ne";
    regedit.list("HKCU\\Software\\CitizenFX\\FiveM", function (err, result) {
        $.each(result, function (index, data) {
            try {
                if (data.values["Last Run Location"].value) {
                    DIR_FiveM = data.values["Last Run Location"].value;

                    if (fs.existsSync(DIR_FiveM)) {
                        //testcache.innerText = DIR_FiveM;
                        const ps = new Shell({
                            executionPolicy: 'Bypass',
                            noProfile: true
                        });

                        ps.addCommand(`Remove-Item -Recurse -Force "${DIR_FiveM}\\data\\cache"`);
                        ps.addCommand(`Remove-Item -Recurse -Force "${DIR_FiveM}\\data\\server-cache"`);
                        ps.addCommand(`Remove-Item -Recurse -Force "${DIR_FiveM}\\data\\server-cache-priv"`);

                        ps.invoke().then(output => {
                            console.log(output);
                        }).catch(err => {
                            console.log(err);
                        });

                    } else {
                        $("#sv-join").prop("disabled", true).text("close");
                    }
                    return;
                }
            } catch (error) {
                $("#sv-join").prop("disabled", true).text("error").attr("title", `${getLang.notInstallFiveM}`);
            }

        });
    });
}
function deleteMoreCacheFiveM() {
    //testcache.innerText = "dc ne";
    regedit.list("HKCU\\Software\\CitizenFX\\FiveM", function (err, result) {
        $.each(result, function (index, data) {
            try {
                if (data.values["Last Run Location"].value) {
                    DIR_FiveM = data.values["Last Run Location"].value;

                    if (fs.existsSync(DIR_FiveM)) {
                        //testcache.innerText = DIR_FiveM;
                        const ps = new Shell({
                            executionPolicy: 'Bypass',
                            noProfile: true
                        });

                        ps.addCommand(`Remove-Item -Recurse -Force "${DIR_FiveM}\\data\\cache"`);
                        ps.addCommand(`Remove-Item -Recurse -Force "${DIR_FiveM}\\data\\server-cache"`);
                        ps.addCommand(`Remove-Item -Recurse -Force "${DIR_FiveM}\\data\\server-cache-priv"`);
                        ps.addCommand(`Remove-Item -Recurse -Force $env:appdata\\CitizenFX`);
                        // alert('more');

                        ps.invoke().then(output => {
                            console.log(output);
                        }).catch(err => {
                            console.log(err);
                        });

                    } else {
                        $("#sv-join").prop("disabled", true).text("close");
                    }
                    return;
                }
            } catch (error) {
                $("#sv-join").prop("disabled", true).text("error").attr("title", `${getLang.notInstallFiveM}`);
            }

        });
    });
}
function deleteEverythingFiveM() {
    //testcache.innerText = "dc ne";
    regedit.list("HKCU\\Software\\CitizenFX\\FiveM", function (err, result) {
        $.each(result, function (index, data) {
            try {
                if (data.values["Last Run Location"].value) {
                    DIR_FiveM = data.values["Last Run Location"].value;

                    if (fs.existsSync(DIR_FiveM)) {
                        //testcache.innerText = DIR_FiveM;
                        const ps = new Shell({
                            executionPolicy: 'Bypass',
                            noProfile: true
                        });

                        ps.addCommand(`Remove-Item -Recurse -Force "${DIR_FiveM}"`);
                        ps.addCommand(`Remove-Item -Recurse -Force $env:appdata\\CitizenFX`);
                        // alert('everything');

                        ps.invoke().then(output => {
                            console.log(output);
                        }).catch(err => {
                            console.log(err);
                        });

                    } else {
                        $("#sv-join").prop("disabled", true).text("close");
                    }
                    return;
                }
            } catch (error) {
                $("#sv-join").prop("disabled", true).text("error").attr("title", `${getLang.notInstallFiveM}`);
            }

        });
    });
}

function openCacheWindow(){
    ipcRenderer.send('cacheOpen');
}
ipcRenderer.on('getDeleteCache', (event, data)=>{

    // window.alert(getLang.messDeletedCache);
    // window.alert(data);
    if (data === 'cacheOnly') {
        deleteCacheFiveM();
    } else if (data === 'deleteMoreCache') {
        deleteMoreCacheFiveM();
    } else if (data === 'deleteEverythingCache') {
        deleteEverythingFiveM();
    } else {

    }
});

function alertFunction(char) {
    if (char === "deleteCache") {
        if (confirm(getLang.messAlertDeleteCache)) {
            deleteCacheFiveM();
            setTimeout(function () {
                window.alert(getLang.messDeletedCache);
            }, 500);
        }
    }
}


// Open folder FiveM Mods
function fiveMMod() {
    regedit.list("HKCU\\Software\\CitizenFX\\FiveM", function (err, result) {
        $.each(result, function (index, data) {
            try {
                if (data.values["Last Run Location"].value) {
                    DIR_FiveM = data.values["Last Run Location"].value;
                    console.log(DIR_FiveM)
                    if (fs.existsSync(DIR_FiveM)) {
                        const ps = new Shell({
                            executionPolicy: 'Bypass',
                            noProfile: true
                        });

                        ps.addCommand(`Invoke-Item -Path "${DIR_FiveM}\\mods"`);

                        ps.invoke().then(output => {
                            console.log(output);
                        }).catch(err => {
                            console.log(err);
                        });

                    } else {
                        $("#sv-join").prop("disabled", true).text("close");
                    }
                    return;
                }
            } catch (error) {
                $("#sv-join").prop("disabled", true).text("error").attr("title", `${getLang.notInstallFiveM}`);
            }

        });
    });
}

// Open folder GTA5
function gta5Location() {
    regedit.list("HKCU\\Software\\CitizenFX\\FiveM", function (err, result) {
        $.each(result, function (index, data) {
            try {
                if (data.values["Last Run Location"].value) {
                    DIR_GTA5 = data.values["Last Run Location"].value;
                    const fiveMini = `${DIR_GTA5}\\CitizenFX.ini`;          //Check Path của GTA5 trong FiveM Folder
                    const iniContent = fs.readFileSync(fiveMini, 'utf-8');  // Đọc file ini
                    const config = ini.parse(iniContent);                   // Parse file
                    const databaseConfig = config.Game;                     // Đọc file ini với tag 'Game'
                    const gtaPath = databaseConfig.IVPath;                  // Chọn config

                    if (gtaPath !== null) {
                        // window.alert(gtaPath); //GTA5 Path
                        const ps = new Shell({
                            executionPolicy: 'Bypass',
                            noProfile: true
                        });

                        ps.addCommand(`Invoke-Item -Path "${gtaPath}"`);

                        ps.invoke().then(output => {
                            console.log(output);
                        }).catch(err => {
                            console.log(err);
                        });

                    } else {
                        $("#sv-join").prop("disabled", true).text("close");
                    }
                    return;
                }
            } catch (error) {
                $("#sv-join").prop("disabled", true).text("error").attr("title", `${getLang.notInstallFiveM}`);
            }

        });
    });
}

ipcRenderer.send('app_version');

ipcRenderer.on('app_version', (event, arg) => {
    ipcRenderer.removeAllListeners('app_version');
    version.innerText = arg.version;
});

const notification = document.getElementById('notification');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');

ipcRenderer.on('update_available', () => {
    ipcRenderer.removeAllListeners('update_available');
    message.innerText = `${getLang.newUpdate}`;
    notification.classList.remove('hidden');
});
ipcRenderer.on('update_downloaded', () => {
    ipcRenderer.removeAllListeners('update_downloaded');
    message.innerText = `${getLang.downloadedUpdate}`;
    restartButton.classList.remove('hidden');
    restartButton.classList.add('button-3');
    notification.classList.remove('hidden');
});

function closeNotification() {
    notification.classList.add('hidden');
}

function restartApp() {
    ipcRenderer.send('restart_app');
}

// Format for RAM
function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

// Checking client information (Working and using for fun)
function Btn_About_Click() {
    //window.alert("get path");
    let a;
    si.cpu().then(data => {
        si.graphics().then(data1 => {
            si.osInfo().then(data2 => {
                si.mem().then(data3 => {
                    //Tim card chinh
                    if (data1.controllers[0].model.indexOf("UHD Graphics") > -1) {
                        // window.alert(`
                        a = `
                        Bạn đang dùng: \n
                        Win: ${data2.distro}\n
                        CPU: ${data.brand} \n
                        GPU: ${data1.controllers[1].model} \n
                        RAM: ${formatBytes(data3.total)}
                        `;
                    } else {
                        a = `
                        Bạn đang dùng: \n
                        Win: ${data2.distro}\n
                        CPU: ${data.brand} \n
                        GPU: ${data1.controllers[0].model} \n
                        RAM: ${formatBytes(data3.total)}
                        `;
                    }
                })
            })
        })
    })

    window.alert(a);
}

// Get path for saving
const btnGetPath = document.getElementById('getPathImage');
btnGetPath.addEventListener('click', function (event) {
    ipcRenderer.send('open-file');
    //window.alert("click");
})

// Save path to computer client
ipcRenderer.on('selected-file', function (event, fullpath) {
    document.getElementById("image-preview").src = fullpath;
    // window.alert(fullpath);
    saveJSONImage(fullpath);
})

//Get link ảnh/video to save
function saveJSONImage(imgPath) {
    // window.alert(imgPath);
    const imgShow = document.getElementById("image-preview");
    const videoShow = document.getElementById("video-preview");
    let lowercaseimgPath = imgPath.toLowerCase();
    if (databaseConfig.configChangeIMG) {
        if (lowercaseimgPath.includes('.jpg') || lowercaseimgPath.includes('.png') || lowercaseimgPath.includes('.gif')) {
            window.alert(`${getLang.changedIMG}`);
            videoShow.style.display = "none";
            document.getElementById("image-preview").src = imgPath;
            ipcRenderer.send('saveDataIMG', imgPath);
            ipcRenderer.send('relaunchApp');
        } else if (lowercaseimgPath.includes('https://')) { // Not working yet
            imgShow.style.display = "none";
            document.getElementById("video-preview").src = imgPath;
        } else {
            window.alert(`${getLang.changedVideo}`);
            imgShow.style.display = "none";
            document.getElementById("video-preview").src = imgPath;
            ipcRenderer.send('saveDataIMG', imgPath);
            ipcRenderer.send('relaunchApp');
        }
    } else {
        window.alert(`${getLang.alertconfigChangeIMGOff}`);
        ipcRenderer.send('reloadwin');
    }
}

//Load image local
ipcRenderer.on('sendImgURL', function (event, imgURL) {
    // window.alert(imgURL);
    createCover(imgURL);

});

//Checking and loading Video or Image to showing at main page.
function createCover(pathURL) {
    const imgShow = document.getElementById("image-preview");
    const videoShow = document.getElementById("video-preview");
    const volumeVideo = document.getElementById('volumeSlider');
    const seekSliderVideo = document.getElementById('seekSlider');
    const playPauseButton = document.getElementById("playPauseButton");
    const currentTime = document.getElementById("current-time-video");
    const totalTime = document.getElementById("time-video");
    const soundButton = document.getElementById("soundButton");

    if (pathURL.includes('.jpg') || pathURL.includes('.png') || pathURL.includes('.gif')) {
        videoShow.style.display = "none";
        volumeVideo.style.display = "none";
        seekSliderVideo.style.display = "none";
        playPauseButton.style.display = "none";
        currentTime.style.display = "none";
        totalTime.style.display = "none";
        soundButton.style.display = "none";
        document.getElementById("image-preview").src = pathURL;
    } else {
        imgShow.style.display = "none";
        document.getElementById("video-preview").src = pathURL;

    }
}

//Btn About at main page
const btnAbout = document.getElementById('aboutclick');
btnAbout.addEventListener('click', function (event) {
    ipcRenderer.send('aboutOpen');
})

//Btn IP at main page
const btnIP = document.getElementById('changeIP');
btnIP.addEventListener('click', function (event) {
    ipcRenderer.send('changeIPOpen');
    loadIPSv();
})

//Btn View Players
const btnPlayerList = document.getElementById('sv-players');
btnPlayerList.addEventListener('click', function (event) {
    ipcRenderer.send('playerListOpen');
    const ipSVFilter = IPServerJSON;
    const filtered = dataList.filter((svIP) => ipSVFilter.includes(svIP.code));
    ipcRenderer.send('saveTempList', filtered);
})

document.getElementById('reloadSV').addEventListener('click', function (event) {
    ipcRenderer.send('reloadSV');
})

document.getElementById('removeImg').addEventListener('click', function (event) {
    ipcRenderer.send('removeImg');
})

function forNY() {
    ipcRenderer.send('openForNy');
    ipcRenderer.send('closeConfirmWindow');
}
function confirmNY() {
    ipcRenderer.send('openConfirmWindow');
}

function renewLanguagesFile() {

    //Delete old files
    if (fs.existsSync(`${settingsPath}/languages/vi-VN.json`)) { fs.unlinkSync(`${settingsPath}/languages/vi-VN.json`); }
    if (fs.existsSync(`${settingsPath}/languages/en-US.json`)) { fs.unlinkSync(`${settingsPath}/languages/en-US.json`); }
    for (let index = 0; index < 10; index++) {
        if (fs.existsSync(`${settingsPath}/languages/vi-VN (` + index + `).json`)) { fs.unlinkSync(`${settingsPath}/languages/vi-VN (` + index + `).json`); }
        if (fs.existsSync(`${settingsPath}/languages/en-US (` + index + `).json`)) { fs.unlinkSync(`${settingsPath}/languages/en-US (` + index + `).json`); }
    }

    !fs.existsSync(`${settingsPath}/languages`) && fs.mkdirSync(`${settingsPath}/languages`, { recursive: true }) // checking Path
    // Reading and writing files
    const mainLangFileVN = require('./settings/vi-VN.json');
    const mainLangFileUS = require('./settings/en-US.json');
    let sDataVN = JSON.stringify(mainLangFileVN);
    let sDataUS = JSON.stringify(mainLangFileUS);
    fs.writeFileSync(`${settingsPath}/languages/vi-VN.json`, sDataVN);
    fs.writeFileSync(`${settingsPath}/languages/en-US.json`, sDataUS);
}


