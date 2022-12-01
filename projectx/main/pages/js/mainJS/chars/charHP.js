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
        // amount ilmoittaa kuin moninkertaisesti lyönti tapahtuu. Default=1
        this.ctx.fillStyle = "red";
        if(who == this.bot.getName()){
            // this.botStart += 36*amount;
            botRedBlock += 36;
            this.ctx.fillRect(this.botStart, 35, botRedBlock, 30);
        }else{
            playerRedBlock += 36;
            this.playerStart -= 36;
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
            this.reset();
            return;
        }
    }

    returnHP(){
        return {botHP:this.botHP, playerHP:this.playerHP};
    }

    reset(){
        stopCanvasEvents(true);
        startBot(false);
        document.getElementById("restart").style.display = "block";
        hpWidth = 360;
        botRedBlock = 0;
        playerRedBlock = 0;
        this.botHP = 100;
        this.playerHP = 100;
        this.player.reset();
        this.bot.reset();
        this.playerStart = 25 + hpWidth;
        
        document.getElementById("restart").addEventListener("click", async ()=>{
            this.player.piirraCanvas(0, 0, 800, 400);
            const result = await nextRound([formatPlayer(this.player, false),formatPlayer(this.bot, true)]);
            if(!result.info){
                $("#infoalue").html(result.err);
                return;
            }
            start();
        });
    }
}