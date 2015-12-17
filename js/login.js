/**
 * Created by alexs on 12/16/2015.
 */
$(document).ready(function(){
    var but  = document.getElementById("submit_form");
    but.addEventListener("click", loginValidate);

    var show = document.getElementById("show");
    show.addEventListener("click", showCreate);

    var hide = document.getElementById('hide');
    hide.addEventListener("click", showHide);

    document.getElementById("submit_user").addEventListener("click", createUser);

    /* validate inputs
     * username and password must be alphanumeric only and more than 6 characters in length
     */
    $("input").each(function(){
        $(this).blur(function(evt){
            var val = $(this).val(),
                pat = new RegExp("^[a-zA-Z0-9]+$");
            if(!pat.test(val) || val.length < 6) {
                $(this).toggleClass("form-control-danger");
                evt.target.parentNode.classList.toggle("has-danger");
            }
            else {
                $(this).toggleClass("form-control-success");
                evt.target.parentNode.classList.toggle("has-success");
            }
        });
    });
});

function showCreate(evt){
    evt.target.style.display = "none";
    document.getElementById("login_form").style.display = "none";
    document.getElementById("create_user").style.display = "block";
    document.getElementById("hide").style.display = "block";
}

function showHide(evt){
    evt.target.style.display = "none";
    document.getElementById("login_form").style.display = "block";
    document.getElementById("create_user").style.display = "none";
    document.getElementById("show").style.display = "block";
}

function loginValidate(){
    var n = document.getElementById("uName").value;
    var p = document.getElementById("pWord").value;
    var json = '{ "n" : "' + n + '", "p" : "' + p + '"}';

    ajaxCall("POST",{method:"login",a:"login", data: json}, callbackLogin);
}

function callbackLogin(data, status){
    if(data != -1){
        location.href = "./room.html";
    }
    else{
        failedLogin();
    }
}

function createUser(){
    var u = document.getElementById("newUser").value,
        p = document.getElementById("pass").value,
        cp = document.getElementById("cPass").value;

    var json = '{ "u" : "' + u + '" , "p" : "' + p + '" , "cp" : "' + cp + '"}';

    ajaxCall("POST", {method: "createUser", a: "login", data: json}, callbackCreateUser);
}

function callbackCreateUser(data, status) {
    if(data === 1){
        location.href = "./room.html";
    }
    else  {
        //failed at creating
        $("#form_warn").html("There was a problem creating your account. Please try again");
    }
}

function ajaxCall(GetPost,d,callback){
    $.ajax({
        type: GetPost,
        async: true,
        cache:false,
        url: "mid.php",
        data: d,
        dataType: "json",
        success: callback
    });
}

//handle failed login
function failedLogin(){
    $("#form_warn").html("There was a problem processing your login. " +
        "Please ensure your username and password contain only letters and numbers " +
        "and are at least 6 characters in length.");
}