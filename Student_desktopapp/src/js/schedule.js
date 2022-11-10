var displayName = document.getElementById('display-name');
var showevent = document.getElementById("show-event");
var popup = document.getElementById("popup");
var span = popup.getElementsByTagName('span');
var preloader = document.querySelector('.preloader');
var joinbtn = document.getElementById('join-exam');
var msg = document.getElementById('msg');

var timenow;
var examArray = [];
var eventArray = [];

if (navigator.onLine) {
    axios({
            method: 'get',
            url:  serverIP + '/student/exams/self',
            responseType: 'json',
            headers: {
                'Authorization': "BEARER " + sessionStorage.getItem('token'),
            }

        })
        .then((response) => {
            examArray = response.data
            preloader.style.visibility = 'hidden'
            addEvents(examArray);
            nextExam(examArray);


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


function createEvents() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        height: 350,
        initialView: 'dayGridMonth',
        eventColor: 'orange',
        events: eventArray,
        //eventDisplay: 'block',
        eventClick: function(info) {
            var id = info.event.id
            span[0].innerHTML = examArray[id][0].exam
            span[1].innerHTML = examArray[id][1].course
            span[2].innerHTML = info.event.start
            span[3].innerHTML = examArray[id][1].duration
            span[4].innerHTML = examArray[id][0].room_name
            span[5].innerHTML = examArray[id][0].chief_invigilator
            span[6].innerHTML = examArray[id][0].invigilator
            displayName.value = sessionStorage.getItem('name')
            sessionStorage.setItem('roomName', examArray[id][0].room_name)
            sessionStorage.setItem('videoPath', examArray[id][0].recordedStudentVideosAt)
            timenow = new Date();

            if (info.event.start - now > 3600 * 1000 * 1 * 1) {
                displayName.style.display = 'none';
                joinbtn.style.display = 'none';
                msg.innerHTML = "Link will be displayed one hour before the exam"
            } else {
                displayName.style.display = '';
                joinbtn.style.display = '';
                msg.innerHTML = ""
            }
            showevent.click()

        },
        headerToolbar: {
            left: '',
            center: 'title',
            right: 'today prev,next',
        }
    });
    calendar.render();
};

/************** add events to calendar event array ****************/

function addEvents(array) {
    for (var i = 0; i < array.length; i++) {
        timenow = new Date();
        timenow = timenow.getTime() - 1 * 3600 * 1000
        var examtime = new Date(array[i][1].startTime.split('Z')[0])
        examtime = examtime.getTime()
        console.log(examtime)
        if (examtime > timenow) {
            eventArray.push({ title: array[i][0].exam, start: array[i][1].startTime.split('Z')[0], id: i, allDay: false });
        }
    }
    createEvents();
}

/********************** join exam room *******************/
function joinExam() {
    if (!(navigator.onLine)) return;
    sessionStorage.setItem('displayName', displayName.value);
    ipc.send('exam room')
}

/************** update next exam ************************/

function nextExam(array) {
    var now = new Date()
    var examIndex = -1;
    var nextexam, exam;

    if (array.length == 0) {
        sessionStorage.setItem('nextExamAt', '-1');
        sessionStorage.setItem('nextExam', 'no exam');
        return
    }

    nextexam = now.getTime() + 60 * 60 * 24 * 365 * 1000;

    for (var i = 0; i < array.length; i++) {
        exam = new Date(array[i][1].startTime.split('Z')[0])
        if (exam > now && exam < nextexam) {
            nextexam = exam;
            examIndex = i;
        }
    }

    if (examIndex == -1) {
        sessionStorage.setItem('nextExamAt', '-1');
        sessionStorage.sertItem('nextExam', 'no exam')
        return
    }

    sessionStorage.setItem('nextExamAt', nextexam / 1000);
    sessionStorage.setItem('nextExam', array[examIndex][0].exam)
}