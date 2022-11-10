const { ipcRenderer } = require('electron')
const ipc = ipcRenderer
const date = require('date-and-time');
const axios = require('axios');

const serverIP = localStorage.getItem('serverIP')

function display_c() {
    var refresh = 1000; // Refresh rate in milli seconds
    var mytime = setTimeout('display_ct()', refresh);
    var mybattery = setTimeout('battery()', refresh);


}


/******************* time for the next exam ************************/

var nextExamDate = sessionStorage.getItem('nextExamAt');
var now, seconds;
var time = document.getElementById('currenttime')
const zeroPad = (num, places) => String(num).padStart(places, '0')

function display_ct() {
    if (nextExamDate != '-1') {
        now = new Date();
        seconds = Number(nextExamDate) - (now / 1000);
        var d = Math.floor(seconds / (3600 * 24));
        var h = Math.floor(seconds % (3600 * 24) / 3600);
        var m = Math.floor(seconds % 3600 / 60);
        var s = Math.floor(seconds % 60);
        time.innerHTML = d + ': ' + zeroPad(h, 2) + ': ' + zeroPad(m, 2) + ': ' + zeroPad(s, 2)
    }
    display_c();

}


/*********************** menu selection ****************************/
var btn = document.getElementById("list").getElementsByTagName('li')
var btncount = btn.length;
for (var i = 0; i < btncount; i += 1) {
    btn[i].onclick = function() {
        ipc.send(this.id);
    }
}

/***************** send the disconnections *************************/
if (typeof(Storage) !== "undefined" && localStorage.disconnections) {
    axios({
            method: 'put',
            url: serverIP + '/student/exam_rooms/disconnections',
            responseType: 'json',
            headers: {
                'Authorization': "BEARER " + sessionStorage.getItem('token'),
            },
            data: JSON.parse(localStorage.getItem('disconnections'))

        })
        .then((response) => {
            localStorage.removeItem('disconnections')


        })
        .catch(function(error) {
            if (error.response) {
                console.log(error.response)
                if (error.response.data.error == "TokenExpiredError: jwt expired") {
                    ipc.send('timeOut');
                }

            };

        });
}

/*********************** battery percentage ************************/
function battery() {

    const batteryLevelOutput = document.getElementById('batteryLevelOutput');
    const batteryIndicator = document.getElementById('indicator');
    navigator.getBattery().then(battery => {
        updateBattery();

        battery.addEventListener('chargingchange', () => {
            updateBattery()
        });
        battery.addEventListener('levelchange', () => {
            updateBattery()
        });

        function updateBattery() {
            batteryLevelOutput.innerHTML = `${parseInt(battery.level*100)}%`;
            batteryIndicator.style.width = `${parseInt(battery.level*100)}%`;
            if (battery.charging) {
                batteryIndicator.className = 'charging';
            } else if (battery.level * 100 > 70) {
                batteryIndicator.className = 'battery70';
            } else if (battery.level * 100 > 50) {
                batteryIndicator.className = 'battery50';
            } else if (battery.level * 100 > 20) {
                batteryIndicator.className = 'battery20';
            } else {
                batteryIndicator.className = 'batterylow';


            }
        }
    });

}


/******************* online/offline ***************************/

window.addEventListener('offline', updateOnlineStatus);
window.addEventListener('online', updateOnlineStatus);


function updateOnlineStatus(event) {
    var timeindicator = document.getElementById("timeindicator");
    var status = document.getElementById("status");
    var time = document.getElementById("timestamp");

    var condition = navigator.onLine ? "online" : "offline";
    document.getElementById("avatar").className = condition;


    if (condition == "offline") {
        status.style.display = "";
        time.style.display = "none";
        timeindicator.style.display = "none";

        status.style.background = "rgb(187, 10, 10)";
        status.innerHTML = "YOU ARE OFFLINE !";

    } else {
        status.style.background = "#63cc26";
        status.innerHTML = "YOU ARE ONLINE !";
        setTimeout(function() {
            status.style.display = "none";
            time.style.display = "";
            timeindicator.style.display = ""
        }, 3000)


    }
}

window.addEventListener("load", function() {
    var condition = navigator.onLine ? "online" : "offline";
    document.getElementById("avatar").className = condition;

    var time = document.getElementById("timestamp");
    var timeindicator = document.getElementById("timeindicator");
    var status = document.getElementById("status");

    if (condition == "offline") {
        status.style.display = "";
        time.style.display = "none";
        timeindicator.style.display = "none";

        status.style.background = "rgb(187, 10, 10)";
        status.innerHTML = "YOU ARE OFFLINE";
    }
})



/***************** display user name and avatar *******************/

var username = document.getElementById("user_name");
username.innerHTML = sessionStorage.getItem("name");

var useravatar = document.getElementById("avatar");
if (typeof(Storage) !== "undefined" && sessionStorage.profilepic && navigator.onLine) {
    useravatar.src = sessionStorage.getItem("profilepic");
}

/******************* set dark/light mode ************************/

if (typeof(Storage) !== "undefined" && localStorage.theme) {
    var Theme = localStorage.getItem('theme');
    document.documentElement.setAttribute('data-theme', Theme);
}


/************************** close popup**************************/

function closePopup() {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = '#';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
    }, 200);
}

function closenRefresh() {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = '#';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        location.reload();
    }, 200);

}

function refresh() {
    location.reload();
}