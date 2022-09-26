(function(){
    document.addEventListener("DOMContentLoaded", ()=>{
        let p = document.getElementById("username");
        const username = getCookieValue("username");
        // jos käyttäjää ei löydy pitäisi hänet lähettää takaisin
        // kirjautumis sivulle
        if(username != null){
            p.innerHTML = username;
        }
    });
})();