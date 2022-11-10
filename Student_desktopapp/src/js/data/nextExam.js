var examArray = [];

function getExam() {
    var serverIP = localStorage.getItem('serverIP')
    axios({
            method: 'get',
            url: serverIP + '/student/exams/self',
            responseType: 'json',
            headers: {
                'Authorization': "BEARER " + sessionStorage.getItem('token'),
            }

        })
        .then((response) => {
            examArray = response.data
            nextExam(examArray);

        })
        .catch(function(error) {
            if (error.response) {
                console.log(error.response)
                if (error.response.data.error == "TokenExpiredError: jwt expired") {
                    ipc.send('timeOut');
                }

            } else {
                alert(error)
            }

        });

}

function nextExam(array) {
    var nextexam, exam, examIndex = -1;
    if (array.length == 0) {
        sessionStorage.setItem('nextExamAt', '-1');
        sessionStorage.setItem('nextExam', 'no exam')
        ipc.send('home')
        return
    }
    var now = new Date()
    nextexam = nextexam = now.getTime() + 60 * 60 * 24 * 365 * 1000;

    for (var i = 0; i < array.length; i++) {
        exam = new Date(array[i][1].startTime)
        if ((exam > now) && (exam < nextexam)) {
            nextexam = exam;
            examIndex = i;
        }
    }

    if (examIndex == -1) {
        sessionStorage.setItem('nextExamAt', '-1');
        sessionStorage.setItem('nextExam', 'no exam')
        ipc.send('home')
        return
    }
    sessionStorage.setItem('nextExamAt', nextexam / 1000);
    sessionStorage.setItem('nextExam', array[examIndex][0].exam);
    ipc.send('home')
}