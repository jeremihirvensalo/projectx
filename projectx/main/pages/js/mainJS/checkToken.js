(async function(){
    const userToken = getCookieValue("token");
    const username = getCookieValue("username");
    
    try{
        const options = {
            method:"POST",
            body:JSON.stringify({username:username, token:userToken}),
            headers:{
                "Content-Type":"application/json"
            }
        }
        console.log("Token check requested");
        const result = await fetch("http://localhost:3000/token", options);
        const data = await result.json();
        console.log("Token check answered");
        if(!data.info) window.location.href = "http://localhost:3000";
        
    }catch(e){
        console.log(e);
        $("#infoalue").html("Virhe ohjelmassa");
    }
})();

function getCookieValue(cookie){
    let name = cookie + "=";
    let decodedCookies = decodeURIComponent(document.cookie);
    let cookieArr = decodedCookies.split(";");
    for(let i  = 0; i < cookieArr.length; i++){
        let c = cookieArr[i];
        while(c.charAt(0) == " "){
            c = c.substring(1);
        }

        if(c.indexOf(name) == 0){
            const tempArr = c.substring(name.length, c.length).split(" ");
            return tempArr[0];
        }
    }
    return null;
}