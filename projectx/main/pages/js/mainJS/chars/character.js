let blockState = false;
let canAttack = true;
let points = 0;

class Character{
    constructor(canvas, ctx, x, y, userW, userH, color, hp, name){ // update API
        this.canvas = canvas;
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.userW = userW;
        this.userH = userH;
        this.color = color;
        this.hp = hp;
        this.name = name;
        this.animation;
        this.ukkeli;
        this.startPos = {
            x: x,
            y: y,
            w: userW,
            h: userH,
            color: color
        };
        // this.alusta();
    }

    async alusta(){
        this.animation = new Animations(this.canvas, this.ctx);
        await this.animation.alusta(this);
        this.ukkeli = this.animation.getUkkeli();
    }

    getAnimations(){
        return this.animation;
    }

    async goLeft(amount, playerCRDS){
        this.x -= amount;
        const result = await verifyMove(this);
        this.x += amount;
        if(!result) return false;
        this.piirraCanvas();
        if((this.x - amount) > (playerCRDS ? playerCRDS.x + playerCRDS.w : 0)) this.x -= amount;
        this.ukkeli.siirryVasen(amount);
        this.piirraChar();
        return true;
    }
    
    async goRight(amount, botX=-1){
        this.x += amount;
        const result = await verifyMove(this);
        this.x -= amount; // helpompi vaa miinustaa takasi alkuperäseen arvoon. (en jaksa miettii tän toimintaa uudestaa)
        if(!result) return false;
        
        this.piirraCanvas();
        let ogAmount = this.x;
        if((this.x + amount) < (800 - this.userW)) this.x += amount; // canvas width: 800
        if(botX != -1 && (this.x) == (botX - this.userW)){
            if(ogAmount != this.x) this.x -= amount;
        }
        this.ukkeli.siirryOikea(amount);
        this.piirraChar();
        return true;

    }

    async jump(amount, bot){
        this.y -= amount;
        const result = await verifyMove(this);
        if(!result){
            this.y += amount;
            return false;
        }
        this.piirraCanvas();
        bot.piirraCharStill();
        this.ukkeli.siirryYlos(amount);
        this.piirraChar();
        setTimeout(async ()=>{
            this.y += amount;
            const result2 = await verifyMove(this);
            if(!result2) return false;
            
            this.piirraCanvas();
            bot.piirraCharStill();
            this.piirraCharStill();
        }, 300);
        return true;
    }

    block(state){
        blockState = state;
    }

    blockState(){
        return blockState;
    }

    punch(bot, hp){
        if(!canAttack) return;
        this.ctx.fillStyle = "rgba(0, 0, 200, 0)";
        this.ctx.fillRect((this.x + this.userW), (this.y + 40), 70, (this.userH / 3));
        canAttack = false;
        this.ukkeli.siirryAlas();
        this.piirraChar();
        setTimeout(()=>{
            this.piirraCanvas();
            bot.piirraCharStill();
            this.piirraChar();
        }, 100);

        if(this.getCoords().x > bot.getCoords().x){
            setTimeout(()=>{
                canAttack = true;
            }, 230);
            return;
        } 
        if((bot.getCoords().x - this.x) <= 160){
            hp.takeHit(10, bot.getName());
        }
        setTimeout(()=>{
            canAttack = true;
        }, 230);
    }
 
    punchL(bot, hp){
        if(!canAttack) return;
        this.ctx.fillStyle = "rgba(0, 0, 200, 0)";
        this.ctx.fillRect((this.x - this.userW + 20), (this.y + 40), 70, (this.userH / 3));
        canAttack = false;

        // vasen lyönti kutsu tähän

        setTimeout(()=>{
            this.piirraCanvas();
            bot.piirraCharStill();
            this.piirraChar()
        }, 100);
        if((this.getCoords().x - bot.getCoords().x) <=160 && (this.getCoords().x - bot.getCoords().x) > 0){
            hp.takeHit(10, bot.getName());
        }
        setTimeout(()=>{
            canAttack = true;
        }, 230);
    }

    kick(bot, hp){
        if(!canAttack) return;
        this.ctx.fillStyle = "rgba(0, 0, 200, 0)";
        this.ctx.fillRect((this.x + this.userW), (this.y + 95), 70, (this.userH / 3));
        canAttack = false;

        // potku animaatio kutsu tähän
    
        setTimeout(()=>{
            this.piirraCanvas();
            bot.piirraCharStill();
            this.piirraChar();
        }, 100);

        if(this.getCoords().x > bot.getCoords().x){
            setTimeout(()=>{
                canAttack = true;
            }, 230);
            return;
        }
        if((bot.getCoords().x - this.x) <= 160){
            hp.takeHit(10, bot.getName()); 
        }
        setTimeout(()=>{
            canAttack = true;
        }, 230);
    }

    kickL(bot, hp){
        if(!canAttack) return;
        this.ctx.fillStyle = "rgba(0, 0, 200, 0)";
        this.ctx.fillRect((this.x - this.userW + 20), (this.y + 95), 70, (this.userH / 3));
        canAttack = false;

        // vasen potku animaatio tähän

        setTimeout(()=>{
            this.piirraCanvas();
            bot.piirraCharStill();
            this.piirraChar();
        }, 100);
        if((this.getCoords().x - bot.getCoords().x) <= 160 && (this.getCoords().x - bot.getCoords().x) > 0){
            hp.takeHit(10, bot.getName());
        }
        setTimeout(()=>{
            canAttack = true;
        }, 230);
    }

    awardPoints(){
        points += 100;
    }

    getPoints(){
        return points;
    }

    getCoords(){
        return {x:this.x, y:this.y, w:this.userW, h:this.userH};
    }

    async piirraChar(){
        for(let i = 0; i < this.ukkeli.getActiveImgs().length; i++){
            await this.ukkeli.piirra(this.x, this.y, this.name !== getCookieValue("username")); 
        }
        stopCanvasEvents(false);
    }

    piirraCharStill(){
        this.ukkeli.drawStill(this.x, this.y, this.name !== getCookieValue("username"));
    }

    piirraCanvas(x=0,y=170,w=800,h=400){ // update API
        this.ctx.clearRect(x, y, w, h);
    }

    getHP(){
        return this.hp;
    }

    getAttackStatus(){
        return canAttack;
    }

    getName(){
        return this.name;
    }

    reset(){
        this.x = this.startPos.x;
        this.y = this.startPos.y;
        this.userW = this.startPos.w;
        this.userH = this.startPos.h;
    }
}