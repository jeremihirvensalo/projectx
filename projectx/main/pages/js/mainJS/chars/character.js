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
        this.blockstate = false;
        this.canBlock = true;
        this.animation;
        this.ukkeli;
        this.canAttack = true;
        this.startPos = {
            x: x,
            y: y,
            w: userW,
            h: userH,
            color: color
        };
    }

    async alusta(imgs){
        this.animation = new Animations(this.canvas, this.ctx, imgs);
        await this.animation.alusta(this);
        this.ukkeli = this.animation.getUkkeli();
    }

    getAnimations(){
        return this.animation;
    }

    async goLeft(amount, affectCanvasEvents=false){
        this.x -= amount;
        const result = await verifyMove(this);
        if(!result){
            this.x += amount;
            return false;
        }
        this.clearCurrentImg(this.x + amount);
        this.ukkeli.siirryVasen(amount);
        await this.piirraChar();
        if(affectCanvasEvents){
            setTimeout(()=>{
                stopCanvasEvents(false);
                return true;
            },50);
        }else return true;
        
    }
    
    async goRight(amount, affectCanvasEvents=false){
        this.x += amount;
        const result = await verifyMove(this);
        if(!result){
            this.x -= amount;
            return false;
        }

        this.clearCurrentImg(this.x - amount);
        this.ukkeli.siirryOikea(amount);
        await this.piirraChar();
        if(affectCanvasEvents){
            setTimeout(()=>{
                stopCanvasEvents(false);
                return true;
            },50);
        }else return true;
    }

    async jump(amount, affectCanvasEvents=false){
        this.y -= amount;
        const result = await verifyMove(this);
        if(!result){
            this.y += amount;
            return false;
        }
        this.clearCurrentImg(this.x, this.y + amount);
        this.ukkeli.siirryYlos(amount);
        await this.piirraChar();
        setTimeout(async ()=>{
            this.y += amount;
            const result2 = await verifyMove(this);
            if(!result2){
                this.y -= amount;
                return;
            }
            this.clearCurrentImg(this.x, this.y - amount);
            this.ukkeli.siirryDefault();
            await this.piirraChar();
            if(affectCanvasEvents){
                setTimeout(()=>{
                    stopCanvasEvents(false);
                },100);
            } 
        }, 300);
        return true;
    }

    async block(){ // update API
        if(!this.canBlock) return false;
        if(!this.blockstate){
            stopCanvasEvents(true);
            this.blockstate = true;
            this.canBlock = false;
        } 
        this.ukkeli.siirryBlock();
        await this.ukkeli.piirra(getCookieValue("username") !== this.name, this.x, this.y);
        setTimeout(async ()=>{
            await this.ukkeli.drawStill(getCookieValue("username") !== this.name, this.x, this.y);
        }, 240);
        setTimeout(()=>{
            stopCanvasEvents(false);
            this.blockstate = false;
            this.canBlock = true;
        }, 800);

        return true;
    }

    blockState(){
        return this.blockstate;
    }

    async punch(bot, hp){
        if(!this.canAttack) return;
        this.canAttack = false;
        this.ukkeli.siirryAlas();
        await this.piirraChar();        
        if((bot.getCoords().x - this.x) <= 160){
            bot.piirraCharStill();
            if(!bot.blockState()) hp.takeHit(10, bot.getName());
        }
        setTimeout(()=>{
            stopCanvasEvents(false);
            this.canAttack = true;
        }, 230);
        return true;
    }
 
    async punchL(bot, hp){
        if(!this.canAttack) return;
        this.canAttack = false;
        this.ukkeli.siirryAlas();
        await this.piirraChar();
        if((this.x - bot.getCoords().x) <= 160){
            bot.piirraCharStill();
            if(!bot.blockState()) hp.takeHit(10, bot.getName());
        }
        setTimeout(()=>{
            this.canAttack = true;
        }, 230);
    }

    async kick(bot, hp){
        if(!this.canAttack) return;
        this.canAttack = false;
        this.ukkeli.siirryPotku();
        this.clearCurrentImg();
        this.y += 30;
        await this.piirraChar();
        setTimeout(async ()=>{
            this.clearCurrentImg();
            this.y -= 30;
            this.ukkeli.siirryDefault();
            await this.piirraChar();
        }, 100);

        if((bot.getCoords().x - this.x) <= 160){
            bot.piirraCharStill();
            if(bot.getCoords().y >= 255) hp.takeHit(10, bot.getName()); 
        }
        setTimeout(()=>{
            stopCanvasEvents(false);
            this.canAttack = true;
        }, 230);
    }

    async kickL(bot, hp){
        if(!this.canAttack) return;
        this.canAttack = false;
        this.ukkeli.siirryPotku();
        this.clearCurrentImg();
        this.y += 30;
        await this.piirraChar();
        setTimeout(async ()=>{
            this.clearCurrentImg();
            this.y -= 30;
            this.ukkeli.siirryDefault();
            await this.piirraChar();
        }, 100);
        if((this.x - bot.getCoords().x) <= 160){
            bot.piirraCharStill();
            if(bot.getCoords().y >= 255) hp.takeHit(10, bot.getName());
        }
        setTimeout(()=>{
            this.canAttack = true;
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
            await this.ukkeli.piirra(this.name !== getCookieValue("username"), this.x, this.y); 
        }
    }

    async piirraCharStill(){
        await this.ukkeli.drawStill(this.name !== getCookieValue("username"), this.x, this.y);
    }

    piirraCanvas(x=0,y=170,w=800,h=400){ // update API
        this.ctx.clearRect(x, y, w, h);
    }

    clearCurrentImg(x=this.x, y=this.y){ // write API
        const currImg = this.ukkeli.getCurrentImg();
        this.piirraCanvas(x, y, currImg.leveys, currImg.korkeus);
    }

    getHP(){
        return this.hp;
    }

    getAttackStatus(){
        return this.canAttack;
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