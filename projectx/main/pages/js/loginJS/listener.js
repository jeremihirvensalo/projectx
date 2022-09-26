(function(){
    document.addEventListener("DOMContentLoaded", ()=>{
        newLoginBG.style.display = "none";
        document.getElementById("newLogin").addEventListener("click", ()=>{
            clearInfo();
            displaySignUp();
            clearLoginInputs();
        });
        document.getElementById("backToLog").addEventListener("click", ()=>{
            clearInfo();
            displayLogin();
            clearSignUpInputs();
        });
    });
})();

