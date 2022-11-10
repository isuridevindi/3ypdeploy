/******************** user info *****************/
var username = sessionStorage.getItem("name");
var useremail = sessionStorage.getItem("email");
var regno = sessionStorage.getItem('regNo');
var department = sessionStorage.getItem("department");
var device = sessionStorage.getItem("device");

document.getElementById("name").defaultValue = username;
document.getElementById("username").innerHTML = username;
document.getElementById("emailaddr").innerHTML = useremail;
document.getElementById("regno").innerHTML = regno;

var userpic = document.getElementById("profilepic");
if (sessionStorage.profilepic) {
    userpic.src = sessionStorage.getItem('profilepic')
    preview.src = sessionStorage.getItem('profilepic')
}


/*global media recorder */
let mediaRecorder;
let recordedBlobs;

const errorMsgElement = document.querySelector('span#errorMsg');
const recordedVideo = document.querySelector('video#recorded');
const recordButton = document.querySelector('button#record');
const playButton = document.querySelector('button#play');

recordButton.addEventListener('click', () => {
    if (recordButton.textContent === 'Record') {
        startRecording();
    } else {
        stopRecording();
        recordButton.textContent = 'Record';
        playButton.disabled = false;

    }
});


playButton.addEventListener('click', () => {
    const superBuffer = new Blob(recordedBlobs, {
        type: 'video/webm'
    });
    recordedVideo.src = null;
    recordedVideo.srcObject = null;
    recordedVideo.src = window.URL.createObjectURL(superBuffer);
    recordedVideo.controls = true;
    recordedVideo.play();
});


function handleDataAvailable(event) {
    console.log('handleDataAvailable', event);
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
    }
}

function startRecording() {
    recordedBlobs = [];
    let options = {
        mimeType: 'video/webm;codecs=vp9,opus'
    };
    try {
        mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (e) {
        console.error('Exception while creating MediaRecorder:', e);
        errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
        return;
    }

    console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
    recordButton.textContent = 'Stop Recording';
    playButton.disabled = true;

    mediaRecorder.onstop = (event) => {
        console.log('Recorder stopped: ', event);
        console.log('Recorded Blobs: ', recordedBlobs);
    };
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
    console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
    mediaRecorder.stop();
}

function handleSuccess(stream) {
    recordButton.disabled = false;
    console.log('getUserMedia() got stream:', stream);
    window.stream = stream;

    const gumVideo = document.querySelector('video#gum');
    gumVideo.srcObject = stream;
}

async function init(constraints) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        handleSuccess(stream);
    } catch (e) {
        console.error('navigator.getUserMedia error:', e);
        errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
    }
}


document.querySelector('#start').addEventListener('click', async() => {

    const constraints = {
        audio: {
            echoCancellation: {
                exact: true
            }
        },
        video: {
            width: 1280,
            height: 720
        }
    };
    console.log('Using media constraints:', constraints);
    await init(constraints);

});

document.querySelector('#close').addEventListener('click', async() => {
    const video = document.querySelector('video#gum');
    const mediaStream = video.srcObject;
    const tracks = mediaStream.getTracks();
    tracks.forEach(track => track.stop());
    recordedVideo.pause();
    recordedVideo.currentTime = 0;
    recordedVideo.srcObject = null;
    closenRefresh();

});



/************ change avatar image ******************/
// const img = document.getElementById("cards");
const def = document.getElementById("defavatar");

// img.addEventListener('click', function(event) {
//     var isImg = event.target.nodeName === 'IMG';
//     if (isImg) {
//         def.src = event.target.src;
//     }

// });

// document.getElementById("changeavtr").addEventListener("click", () => {
//     localStorage.setItem("useravatar", def.src);
//     closenRefresh();
// })


/********* toggle dark/light mode *************/

var toggleSwitch = document.querySelector('.toggle-btn input[type="checkbox"]');

if (typeof(Storage) !== "undefined" && localStorage.theme) {
    var currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);

        if (currentTheme === 'dark') {
            toggleSwitch.checked = true;
        }
    }
}

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

toggleSwitch.addEventListener('change', switchTheme, false);





/*********** user name ****************/


function countlength() {
    var name = document.getElementById("name");
    var remaininglength = document.getElementById("namelength")

    var length = name.value.length;
    var left = 30 - length;
    remaininglength.innerHTML = left.toString() + "/30"

}

/*************** change name *******************************/
document.getElementById("entername").addEventListener("click", () => {

    if (!(navigator.onLine)) {
        closePopup();
        return;
    }
    var newname = document.getElementById("name").value;
    if (newname.length != 0) {
        console.log(newname);
        sessionStorage.setItem("name", newname);
        axios({
                method: 'put',
                url: serverIP + '/student/students/self',
                responseType: 'json',
                headers: {
                    'Authorization': "BEARER " + sessionStorage.getItem('token'),
                },
                data: {
                    "name": newname,
                    "regNo": sessionStorage.getItem('regNo'),
                    "email": useremail,
                    "department": department,
                    "device": device,
                },
            })
            .then((response) => {
                console.log(response);
            })
            .catch(function(error) {
                if (error.response) {
                    console.log(error.response.message);
                    if (error.response.data.error == "TokenExpiredError: jwt expired") {
                        ipc.send('timeOut');
                    }
                };

            });

    }
    closenRefresh();

})

var picture = document.getElementById('picture')
picture.onchange = evt => {
    const [file] = picture.files
    if (file) {
        preview.src = URL.createObjectURL(file)
    }
}

uploadpicture.onsubmit = async(e) => {
    e.preventDefault();
    console.log(body)
    var body = new FormData(uploadpicture)
    console.log(body)
    if (picture.value == "") {
        closePopup();
        return;
    }
    var send = new FormData()

    send.append('profile_picture', body.get('picture'))
        // console.log(send)
        // console.log(body)
    axios({
            method: 'post',
            url:  serverIP + '/student/profilePicture',
            contentType: 'multipart/form-data',
            responseType: 'json',
            headers: {
                'Authorization': "BEARER " + sessionStorage.getItem('token'),
            },
            data: send,
        })
        .then((response) => {
            console.log(response);
            updateProfile();
        })
        .catch(function(error) {
            if (error.response) {
                console.log(error.response.message);
                if (error.response.data.error == "TokenExpiredError: jwt expired") {
                    ipc.send('timeOut');
                } else {
                    alert(error.response.data.error)
                }

            } else {
                alert(error)
            };

        });
};

function updateProfile() {
    var serverIP = localStorage.getItem('serverIP')
    axios({
            method: 'get',
            url:  serverIP + '/student/students/self',
            responseType: 'json',
            headers: {
                'Authorization': "BEARER " + sessionStorage.getItem('token'),
            }

        })
        .then((response) => {
            console.log(response)
            sessionStorage.setItem('name', response.data.name);
            sessionStorage.setItem('regNo', response.data.regNo);
            sessionStorage.setItem('department', response.data.department);
            sessionStorage.setItem('device', response.data.device);
            sessionStorage.setItem('profilepic', "https://" + "connexa.space/api" + response.data.profile_picture);
            closenRefresh();

        })
        .catch(function(error) {
            if (error.response) {
                console.log(error.response.message);
                if (error.response.data.error == "TokenExpiredError: jwt expired") {
                    ipc.send('timeOut');
                } else {
                    alert(error.response.data.error)
                }

            }

        });
}