let blockState = false;
let canAttack = true;
let points = 0;

class Character{
    constructor(ctx, x, y, userW, userH, color, hp, name, animation){ // update API
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.userW = userW;
        this.userH = userH;
        this.color = color;
        this.hp = hp;
        this.name = name;
        this.animation = animation;
        this.startPos = {
            x: x,
            y: y,
            w: userW,
            h: userH,
            color: color
        };
        // this.piirraChar();
    }

    async goLeft(amount){
        this.x -= amount;
        const result = await verifyMove(this);
        this.x += amount;
        if(!result) return false;
        this.piirraCanvas();
        if((this.x - amount) > 0) this.x -= amount; //jos haluaa pelaajan kiinni seinään (this.x - amount) > -10
        this.piirraChar();
        return true;
    }
    
    async goRight(amount, botX){
        this.x += amount;
        const result = await verifyMove(this);
        this.x -= amount; // helpompi vaa miinustaa takasi alkuperäseen arvoon. (en jaksa miettii tän toimintaa uudestaa)
        if(!result) return false;
        
        this.piirraCanvas();
        let ogAmount = this.x;
        if((this.x + amount) < (800 - this.userW)) this.x += amount; // canvas width: 800
        if((this.x) == (botX - this.userW)){
            if(ogAmount != this.x) this.x -= amount;
        }
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
        bot.piirraChar();
        this.piirraChar();
        setTimeout(async ()=>{
            this.y += amount;
            const result2 = await verifyMove(this);
            if(!result2) return false;
            
            this.piirraCanvas();
            bot.piirraChar();
            this.piirraChar();
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
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect((this.x + this.userW), (this.y + 40), 70, (this.userH / 3));
        canAttack = false;
        setTimeout(()=>{
            this.piirraCanvas();
            bot.piirraChar();
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
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect((this.x - this.userW + 20), (this.y + 40), 70, (this.userH / 3));
        canAttack = false;
        setTimeout(()=>{
            this.piirraCanvas();
            bot.piirraChar();
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
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect((this.x + this.userW), (this.y + 95), 70, (this.userH / 3));
        canAttack = false;
        setTimeout(()=>{
            this.piirraCanvas();
            bot.piirraChar();
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
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect((this.x - this.userW + 20), (this.y + 95), 70, (this.userH / 3));
        canAttack = false;
        setTimeout(()=>{
            this.piirraCanvas();
            bot.piirraChar();
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

    piirraChar(){
        // this.ctx.fillStyle = this.color;
        // this.ctx.fillRect(this.x, this.y, this.userW, this.userH);
        this.animation.piirra(this.x, this.y);
    }

    piirraCanvas(){
        // this.ctx.fillStyle = "grey"; // tähän taustakuva
        // this.ctx.clearRect(0, 170, 800, 400); // vain canvaksen alaosa piirretään uusiksi
        // this.ctx.fillRect(0, 170, 800, 400);
        this.ctx.clearRect(0, 170, 800, 400);
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