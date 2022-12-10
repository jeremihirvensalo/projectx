let hpWidth = 360;
let botRedBlock = 0;
let playerRedBlock = 0;

class HP{
    constructor(ctx, player, bot){
        this.ctx = ctx;
        this.playerHP = player.getHP();
        this.botHP = bot.getHP();
        this.botStart = 425;
        this.playerStart = 25 + hpWidth;
        this.player = player;
        this.bot = bot;
        this.roundRunning = true;
    }
    drawBarL(name){
        if(!name) name = "Player";
        this.ctx.font = "italic small-caps bold 14px arial";
        this.ctx.fillStyle = "black";
        this.ctx.fillText(name, 20, 20);
        this.ctx.fillStyle = "black"
        this.ctx.fillRect(20, 30, 370, 40);
        this.ctx.fillStyle = "limegreen";
        this.ctx.fillRect(25, 35, hpWidth, 30);
    }

    drawBarR(name){
        if(!name) name = "Player";
        this.ctx.font = "italic small-caps bold 14px arial";
        if(name.length > 8) textWidth -= name.length * 5;
        this.ctx.fillStyle = "black";
        this.ctx.fillText(name, 420, 20);
        this.ctx.fillStyle = "black"
        this.ctx.fillRect(420, 30, 370, 40);
        this.ctx.fillStyle = "limegreen";
        this.ctx.fillRect(425, 35, hpWidth, 30);
    }

    drawDMG(amount, who){ // 360/10 = 36 eli defaulttina damage on 36
        // amount ilmoittaa kuin moninkertaisesti lyönti tapahtuu. 
        let drawingWidth = (36 * amount) - (360 % (36 * amount));
        this.ctx.fillStyle = "red";
        if(who == this.bot.getName()){
            if((drawingWidth + botRedBlock) > hpWidth) drawingWidth = drawingWidth + botRedBlock - hpWidth;
            botRedBlock += drawingWidth;
            this.ctx.fillRect(this.botStart, 35, botRedBlock, 30);
        }else{
            if((drawingWidth + playerRedBlock) > hpWidth) drawingWidth = drawingWidth + playerRedBlock - hpWidth;
            playerRedBlock += drawingWidth;
            this.playerStart -= drawingWidth;
            this.ctx.fillRect(this.playerStart, 35, playerRedBlock, 30);
        }
    }

    takeHit(amount, who){
        if(this.botHP == 0 || this.playerHP == 0){
            if(canvasEvents() == false) this.reset();
            return;
        }
        if(who == this.bot.getName()){
            this.botHP -= amount;
            this.player.awardPoints();
            showPoints(this.player.getPoints());
        }else{
            this.playerHP -= amount;
        }
        this.drawDMG((amount/10), who);
        if(this.botHP == 0 || this.playerHP == 0){
            this.roundRunning = false;
            this.reset();
            return;
        }
    }

    returnHP(){
        return {botHP:this.botHP, playerHP:this.playerHP};
    }

    getRoundStatus(){
        return this.roundRunning;
    }

    async reset(){
        this.player.setAttackStatus(false);
        stopCanvasEvents(true);
        startBot(false);

        const promisePoints = new Promise(async (resolve, reject) =>{
            setInfo("Tallennetaan...");
            try{
                const options = {
                    method:"POST",
                    body:JSON.stringify({
                        username:getCookieValue("username"),
                        token:getCookieValue("token"),
                        points: this.player.getPoints()
                    }),
                    headers:{
                        "Content-Type":"application/json"
                    }
                }

                const data = await fetch("http://localhost:3000/points", options);
                const result = await data.json();
                const check= statusCheck(result); 
                if(!check.info) setInfo(check.details);
                if(result.err){
                    console.log(result.err);
                    setInfo("Pisteiden tallennuksessa virhe. Katso konsolista lisätiedot.");
                }else setInfo("Tallennettu!", "success");
                resolve();
            }catch(e){
                setInfo("Varoitus! Pisteiden tallennuksessa virhe");
                reject(e);
            }
        });

        await promisePoints;

        const playerLost = (this.playerHP <= 0);
        if(playerLost) $("#restart").html("ALOITA ALUSTA");
        else $("#restart").html("JATKA");
        $("#restart").css("display", "block");
        setTimeout(async ()=>{ // Pitää pakottaa odottamaan muuten gameServer saa helposti väärää dataa
            stopCanvasEvents(true);
            hpWidth = 360;
            botRedBlock = 0;
            playerRedBlock = 0;
            this.botHP = 100;
            this.playerHP = 100;
            this.player.reset();
            this.bot.reset();
            this.playerStart = 25 + hpWidth;
            
            document.getElementById("restart").addEventListener("click", async ()=>{
                if(playerLost){
                    $("#points").attr("value", "0");
                    $("#points").html("Points: 0");
                    this.player.setPoints(0);
                }
                this.player.piirraCanvas();
                this.bot.piirraCanvas();
                const result = await nextRound([formatPlayer(this.player, false),formatPlayer(this.bot, true)]);
                if(!result.info){
                    setInfo(result.err, "err", true);
                    return;
                }else setInfo("","err",false);
                await start();
            });
        }, 1000);

    }
}