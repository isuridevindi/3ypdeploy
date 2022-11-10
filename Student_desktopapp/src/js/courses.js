//var courseJSON = '[{"shortname": "E20-2023","fullname": "CO321-2021 : Embedded systems","department": "CO", "coordinator": "Dr.ABC EFG","semester": 5,"hasExam": true},{"shortname": "E17-2021","fullname": "CO322-2021 : Data Structure and Algorithms","department": "CO", "coordinator": "Dr.ABC EFG","semester": 5,"hasExam": true}]'
var courseArray //= JSON.parse(courseJSON);
var popup = document.getElementById("popup");
var span = popup.getElementsByTagName('span');
var link = document.getElementById("show");
var preloader = document.querySelector('.preloader');
var btn, btncount

/******************* save token and direct to home page ************************/
if (navigator.onLine) {
    axios({
            method: 'get',
            url: serverIP + '/student/courses/self',
            responseType: 'json',
            headers: {
                'Authorization': "BEARER " + sessionStorage.getItem('token'),
            }

        })
        .then((response) => {
            console.log(response);
            courseArray = response.data
            preloader.style.visibility = 'hidden'
            makeCourseList();
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

function sortCourse() {
    var list, i, switching, b, shouldSwitch, dir, switchcount = 0;
    list = document.getElementById("cards");
    b = document.getElementsByTagName("Li");

    switching = true;
    dir = "asc";

    if (!b) return

    while (switching) {
        switching = false;
        b = list.getElementsByTagName("LI");
        for (i = 0; i < (b.length - 1); i++) {
            shouldSwitch = false;

            if (dir == "asc") {
                if (b[i].innerHTML.toLowerCase() > b[i + 1].innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (b[i].innerHTML.toLowerCase() < b[i + 1].innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            b[i].parentNode.insertBefore(b[i + 1], b[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}


function findCourse() {
    // Declare variables
    var input, filter, ul, li, name, i, txtValue;
    input = document.getElementById('myInput');
    filter = input.value.toUpperCase();
    ul = document.getElementById("cards");
    li = ul.getElementsByTagName('li');

    //if (!b) return;
    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        name = li[i].getElementsByTagName("p")[1];
        txtValue = name.textContent || name.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

function makeCourseList() {
    var list = document.getElementById('cards');

    for (var i = 0; i < courseArray.length; i++) {
        // Create the list item:
        var item = document.createElement('li');
        var code = document.createElement('p');
        var name = document.createElement('p');
        //item.id = i.toString();
        item.setAttribute("id", i.toString());
        // Set its contents:
        item.className = 'card waves-effect waves-light'
        code.innerHTML = courseArray[i].shortname;
        name.innerHTML = courseArray[i].fullname;
        item.appendChild(code);
        item.appendChild(name);

        // Add it to the list:
        list.appendChild(item);
    }


    /********************** popup details ****************************/
    btn = document.getElementById("cards").getElementsByTagName('li')
    btncount = btn.length
    for (var i = 0; i < btncount; i += 1) {
        btn[i].onclick = function() {
            span[0].innerHTML = courseArray[this.id].fullname;
            span[1].innerHTML = courseArray[this.id].department;
            span[2].innerHTML = courseArray[this.id].semester;
            span[3].innerHTML = courseArray[this.id].coordinator;
            link.click()

        }
    }

}