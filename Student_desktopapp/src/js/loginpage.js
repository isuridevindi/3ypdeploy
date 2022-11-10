const { ipcRenderer } = require('electron')
const ipc = ipcRenderer
const axios = require('axios');


const textBoxes = document.getElementsByTagName("input");

var check = document.querySelector("input[name=checkbox]");

var loginpage = document.getElementById('sign-in');
var regpage = document.getElementById('sign-up')
var logerror = document.getElementById('log-error');
var regerror = document.getElementById('reg-error');

check.addEventListener('change', function() {
    if (this.checked) {
        setTimeout(function() {
            loginpage.style.display = 'none';
            regpage.style.display = 'block'
        }, 300)

    } else {
        setTimeout(function() {
            loginpage.style.display = 'block';
            regpage.style.display = 'none'
        }, 300)
    }
});

/********* user input validation ***********/
function validatePassword(p) {

    if (p.value.length == 0) {
        return false
    }
    if (p.value.length < 8) {
        return false
    }
    if (p.value.search(/[a-z]/i) < 0) {
        return false
    }
    if (p.value.search(/[0-9]/) < 0) {
        return false
    }
    return true;
}

function validateEmail(e) {
    if (e.length > 320) return false;
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(e).toLowerCase());
}

/************** check user input before login ******************/

var login = document.getElementById("login");

login.addEventListener('click', function(e) {
    e.preventDefault()

    if (!(navigator.onLine)) {
        logerror.innerText = "You are offline"
        return;
    }

    if (!localStorage.serverIP) {
        logerror.innerText = "select the server you want to log in"
        return
    }

    var logemail = document.getElementById("log-email");
    if (!(validateEmail(logemail.value))) {
        logerror.innerText = "Enter a valid email";
        return;
    }

    var logpassword = document.getElementById("log-password");
    if (!(validatePassword(logpassword))) {
        logerror.innerText = "Incorrect password";
        return;
    }

    /******************* save token and direct to home page ************************/
    var serverIP = localStorage.getItem('serverIP')

    axios({
            method: 'post',
            url:  serverIP + '/student/login',
            responseType: 'json',
            data: {
                "email": logemail.value,
                "password": logpassword.value,
            },
        })
        .then((response) => {
            sessionStorage.setItem("email", logemail.value);
            sessionStorage.setItem('token', response.data.token);

            saveData();
        })
        .catch(function(error) {
            console.log(error)
            if (error.response) {
                logerror.innerHTML = "* " + error.response.data.message;

            } else {
                logerror.innerHTML = "* " + error
            }
        });



});
/************** registration validation ****************/

var register = document.getElementById("register");

register.addEventListener('click', function(e) {
    e.preventDefault()

    if (!(navigator.onLine)) {
        regerror.innerText = "You are offline"
        return;
    }
    if (!localStorage.serverIP) {
        regerror.innerText = "select the server you want to sign in"
        return
    }
    var regemail = document.getElementById("reg-email");
    var regpassword = document.getElementById("reg-password");
    var confirmpassword = document.getElementById("confirm-password");

    if (!(validateEmail(regemail.value))) {
        regerror.innerText = "Enter a valid Email"
        return;
    }

    if (!(validatePassword(regpassword))) {
        regerror.innerText = "Password should contain atleast 8 characters and one number"
        return;
    }

    if (confirmpassword.value.length == 0) {
        regerror.innerText = "Re-enter your password"
        return;
    }
    if (regpassword.value != confirmpassword.value) {
        regerror.innerText = "Passwords don't match";
        return;
    }
    /******************* save token and direct to home page ************************/
    var serverIP = localStorage.getItem('serverIP')
    axios({
            method: 'post',
            url:  serverIP + '/student/register',
            responseType: 'json',
            data: {
                "email": regemail.value,
                "password0": regpassword.value,
                "password1": regpassword.value,
            },
        })
        .then((response) => {
            localStorage.setItem('email', regemail.value);
            ipc.send('Login');
        })
        .catch(function(error) {
            if (error.response) {
                console.log(error.response)
                regerror.innerHTML = "* " + error.response.data.message;
            } else {
                regerror.innerHTML = "* " + error
            }
        });





})

/**************** toggle password **************/


function togglePassword(id, eyeid) {
    var password = document.getElementById(id);
    var eye = document.getElementById(eyeid);
    var type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    eye.classList.toggle('bi-eye');
}



/*****************Remember me***********************/
const rmCheck = document.getElementById("staylogged"),
    emailInput = document.getElementById("log-email");

if (localStorage.checkbox && localStorage.checkbox !== "") {
    rmCheck.setAttribute("checked", "checked");
    emailInput.value = localStorage.email;
} else {
    rmCheck.removeAttribute("checked");
    emailInput.value = "";
}

function lsRememberMe() {
    if (rmCheck.checked && emailInput.value !== "") {
        localStorage.email = emailInput.value;
        localStorage.checkbox = rmCheck.value;
    } else {
        localStorage.email = "";
        localStorage.checkbox = "";
    }
}