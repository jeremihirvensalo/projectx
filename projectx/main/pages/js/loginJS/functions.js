function displayLogin(){
    let newLoginBG = document.getElementById("newLoginBG");
    let loginBG = document.getElementById("loginBG");
    newLoginBG.style.display = "none";
    loginBG.style.display = "flex";
}

function displaySignUp(){
    let newLoginBG = document.getElementById("newLoginBG");
    let loginBG = document.getElementById("loginBG");
    newLoginBG.style.display = "flex";
    loginBG.style.display = "none";
}

function clearLoginInputs(){
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
}

function clearSignUpInputs(){
    document.getElementById("newUsername").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("verifyPassword").value = "";
}

function clearInfo(){
    document.getElementById("infoalue").innerHTML = "";
}