(function(){
    document.addEventListener("DOMContentLoaded", ()=>{
        document.getElementById("logout").addEventListener("click", async ()=>{
            startBot(false);
            const username = getCookieValue("username");
            const token = getCookieValue("token");
            if(token == null) window.location.replace("http://localhost:3000");
            try{
                await resetServer();
                const options = {
                    method:"POST",
                    body: JSON.stringify({username:username,token:token}),
                    headers:{
                        "Content-Type":"application/json"
                    }
                };
                console.log("Logout request sent");
                const data = await fetch("http://localhost:3000/logout", options).then(async (result)=>{
                    return await result.json();
                });
                console.log("Logout answer received");
                if(data.logoutURL) window.location.replace(`${data.logoutURL}`);
                else setInfo(data.err);

            }catch(e){
                setInfo(e.message);
            }
        });

        $("#user").on("mouseover", function(){
            $("#userContent").slideDown({
                start: function(){
                    $(this).css("display","grid");
                },
                duration:200
            });
            $(this).on("mouseleave", function(){
                $("#userContent").slideUp(100);
            });
        });
    });

    document.getElementById("settings").addEventListener("click", ()=>{
        stopCanvasEvents(true);
        let main = document.getElementById("main");
        let navWrap = document.getElementById("navWrap");

        main.style.opacity = "18%";
        main.style.pointerEvents = "none"
        navWrap.style.opacity = "18%";
        navWrap.style.pointerEvents = "none";
        main.style.userSelect = "none";
        navWrap.style.userSelect = "none";
        
        document.getElementById("userSettings").style.display = "flex";

        // adding settings button listeners
        document.getElementById("changePWBtn").addEventListener("click", async ()=>{
            const oldPW = document.getElementById("changePWOld");
            const newPW = document.getElementById("changePW");
            const verifyNewPW = document.getElementById("changePWVerify");
            const username = getCookieValue("username");
            const token = getCookieValue("token");
            if(oldPW.value && newPW.value && verifyNewPW.value && username && token){
                if(oldPW.value.length < 4 || verifyNewPW.value.length < 4){
                    document.getElementById("info").innerHTML = "Salasana liian lyhyt";
                    return;
                }else if(newPW.value != verifyNewPW.value){
                    document.getElementById("info").innerHTML = "Salasanat eivät täsmää";
                    return;
                }
                try{
                    const options = {
                        method:"POST",
                        body:JSON.stringify({username:username,oldPW:oldPW.value,newPW:newPW.value}),
                        headers:{
                            "Content-Type":"application/json"
                        }
                    };
                    const data = await fetch("http://localhost:3000/changePW", options).then(async (result)=>{
                        return await result.json();
                    });
                    if(data.newURL){
                        window.location.replace(data.newURL);
                    }
                    oldPW.value = "";
                    newPW.value = "";
                    verifyNewPW.value = "";
 
                    if(data.info){
                        document.getElementById("info").innerHTML = data.info;
                    }else{
                        document.getElementById("info").innerHTML = data.err;
                    }
                }catch(e){
                    document.getElementById("info").innerHTML = "Virhe salasanan muutoksessa!";
                }
            }else if(username == null){
                document.getElementById("info").innerHTML = "Käyttäjätunnusta ei löydy. Kirjaudu ulos ja yritä uudelleen.";
                return;
            }else if(token == null){
                window.location.replace("http://localhost:3000");
            }
        });

        document.getElementById("deleteUser").addEventListener("click", async ()=>{
            const username = document.getElementById("username").innerHTML;
            const pw = document.getElementById("deleteUserPW").value;
            const token = getCookieValue("token");
            if(username && pw){
                if(token == null) window.location.replace("http://localhost:3000");
                try{
                    const options = {
                        method:"POST",
                        body:JSON.stringify({username:username,password:pw, token:token}),
                        headers:{
                            "Content-Type":"application/json"
                        }
                    }

                    const data = await fetch("http://localhost:3000/delete", options).then(async (result) =>{
                        return await result.json()
                    });
                    if(data.newURL){
                        window.location.replace(data.newURL);
                    }
                    if(data.info){
                        document.getElementById("info").innerHTML = data.info;
                        window.location.replace(data.newURL);
                    }else{
                        document.getElementById("info").innerHTML = data.err;
                    }
                }catch(e){
                    document.getElementById("info").innerHTML = "Virhe palvelimen kanssa";
                }
            }else if(!pw){
                document.getElementById("info").innerHTML = "Salasana puuttuu!";
            }

        });

    });

    document.getElementById("closeSettings").addEventListener("click", ()=>{
        stopCanvasEvents(false);
        let main = document.getElementById("main");
        let navWrap = document.getElementById("navWrap");
        document.getElementById("userSettings").style.display = "none";
        main.style.opacity = "100%";
        main.style.pointerEvents = "auto"
        navWrap.style.opacity = "100%";
        navWrap.style.pointerEvents = "auto";
        main.style.userSelect = "auto";
        navWrap.style.userSelect = "auto";
        document.getElementById("info").innerHTML = "";
    });

})();

    $(window).on("unload", async function(){
        const result = await resetServer();
        console.log(result);
        return ":(";
    });

function setInfo(msg, cssClass="err", display=true){ // write API
    if($("#infoalue").attr("class") !== cssClass){
        $("#infoalue").removeClass((cssClass==="err" ? "err" : "success"));
        $("#infoalue").addClass(cssClass);
    }
    if($("#infoalue").css("display") === "block" && !display) $("#infoalue").css("display", "none");
    else $("#infoalue").css("display", "block");
    $("#infoalue").html(msg);
}