let blockState = false;
let canAttack = true;
let points = 0;

class Character{
    constructor(ctx, x, y, userW, userH, color, hp){
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.userW = userW;
        this.userH = userH;
        this.color = color;
        this.hp = hp;
        this.startPos = {
            x: x,
            y: y,
            w: userW,
            h: userH,
            color: color
        };
        this.piirraChar();
    }
    goLeft(amount){
        if((this.x - amount) > 0) this.x -= amount; //jos haluaa pelaajan kiinni seinään (this.x - amount) > -10
        this.piirraChar();
    }
    
    goRight(amount, botX){
        let ogAmount = this.x;
        if((this.x + amount) < (800 - this.userW)) this.x += amount; // canvas width: 800
        if((this.x) == (botX - this.userW)){
            if(ogAmount != this.x) this.x -= amount;
        }
        this.piirraChar();
    }

    jump(amount, bot){
        this.y -= amount;
        this.piirraChar();
        setTimeout(()=>{
            this.y += amount;
            this.piirraCanvas();
            bot.piirraChar();
            this.piirraChar();
        }, 300);
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
        if((bot.getCoords().x - this.x) <= 160){
            hp.takeHit(10, "bot"); //kovakoodattu eli aina botti ottaa osuman
        }
        setTimeout(()=>{
            canAttack = true;
        }, 230)
    }
 
    punchL(bot, hp){ // tätä ei testattu
        if(!canAttack) return;
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect((this.userH.w - this.x), (this.y + 40), 70, (this.userH / 3));
        canAttack = false;
        setTimeout(()=>{
            this.piirraCanvas();
            bot.piirraChar();
            this.piirraChar()
        }, 100);
        if((bot.getCoords().x - this.x) <=160){ // tää if varmaa vääri. kannattaa testaa
            hp.takeHit(10, "bot"); // kovakoodattu eli aina botti ottaa osuman
        }
        setTimeout(()=>{
            canAttack = false;
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
        if((bot.getCoords().x - this.x) <= 160){
            hp.takeHit(10, "bot"); // kovakoodattu eli aina botti ottaa osuman
        }
        setTimeout(()=>{
            canAttack = true;
        }, 230);
    }

    kickL(bot, hp){
        if(!canAttack) return;
        this.fillStyle = this.color;
        this.ctx.fillRect((this.userW - this.x), (this.y + 95), 70, (this.userH / 3));
        canAttack = false;
        setTimeout(()=>{
            this.piirraCanvas();
            bot.piirraChar();
            this.piirraChar();
        }, 100);
        if((bot.getCoords().x - this.x) <= 160){
            hp.takeHit(10, "bot") // kovakoodattu eli aina botti ottaa osuman
        }
        setTimeout(()=>{
            canAttack = false;
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
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.userW, this.userH);
    }

    piirraCanvas(){
        this.ctx.fillStyle = "grey"; // tähän taustakuva
        this.ctx.clearRect(0, 170, 800, 400); // vain canvaksen alaosa piirretään uusiksi
        this.ctx.fillRect(0, 170, 800, 400);
    }

    getHP(){
        return this.hp;
    }

    getAttackStatus(){
        return canAttack;
    }

    reset(){
        this.x = this.startPos.x;
        this.y = this.startPos.y;
        this.userW = this.startPos.w;
        this.userH = this.startPos.h;
    }
}