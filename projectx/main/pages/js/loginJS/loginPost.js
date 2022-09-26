(function () {
    document.addEventListener("DOMContentLoaded", () => {
        document.getElementById("submit").addEventListener("click", async () => {
            let password = document.getElementById("password").value;
            let username = document.getElementById("username").value;
            if(validateLogin(username, password)){
                try{
                    const options = {
                        method:"POST",
                        body:JSON.stringify({username:username, password:password}),
                        headers:{
                            "Content-Type":"application/json"
                        }
                    };
                    const data = await fetch("http://localhost:3000/", options).then(async (result)=>{
                        return await result.json();
                    });
                    if(data.info){
                        document.getElementById("infoalue").innerHTML = data.info;
                        createCookie(username, data.token);
                        window.location.href = "http://localhost:3000/main";

                    }else{
                        document.getElementById("infoalue").innerHTML = data.err;
                    }
                    
                }catch(e){
                    document.getElementById("infoalue").innerHTML = "Virhe ohjelmassa";
                }
            }
        });
        document.getElementById("submitNewLogin").addEventListener("click",async () => {
            const u = document.getElementById("newUsername").value;
            const p = document.getElementById("newPassword").value;
            const p2 = document.getElementById("verifyPassword").value;
            if(p == p2){
                if(validateLogin(u, p)){
                    try{
                        const options = {
                            method:"POST",
                            body:JSON.stringify({username:u,password:p}),
                            headers:{
                                "Content-Type":"application/json"
                            }
                        };
                        const data = await fetch("http://localhost:3000/newLogin", options).then(async (result)=>{
                            return await result.json();
                        });
                        
                        if(data.info){
                            document.getElementById("infoalue").innerHTML = data.info;
                            displayLogin();
                            clearSignUpInputs();
                        }else{
                            document.getElementById("infoalue").innerHTML = data.err;
                        }
                    }catch(e){
                        document.getElementById("infoalue").innerHTML = "Virhe ohjelmassa";
                    }
                }
            }else{
                document.getElementById("infoalue").innerHTML = "Salasanat eivät täsmää";
            }
        });
    });
})();

function validateLogin(username, password) {
    if (password.length < 4) {
        document.getElementById("infoalue").innerHTML = "Salasana liian lyhyt";
        return false;
    }else if(password.length > 30){
        document.getElementById("infoalue").innerHTML = "Salasana liian pitkä"
    } else if (!username.length) {
        document.getElementById("infoalue").innerHTML = "Käyttäjätunnus liian lyhyt";
        return false;
    } else {
        if (document.getElementById("infoalue").innerHTML) {
            document.getElementById("infoalue").innerHTML = ""; 
        }
        return true;
    }
}