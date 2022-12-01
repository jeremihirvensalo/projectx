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

    async alusta(imgs){
        this.animation = new Animations(this.canvas, this.ctx, imgs);
        await this.animation.alusta(this);
        this.ukkeli = this.animation.getUkkeli();
    }

    getAnimations(){
        return this.animation;
    }

    async goLeft(amount, playerCRDS={}){ // update API
        this.x -= amount;
        const result = await verifyMove(this);
        if(!result){
            this.x += amount;
            return false;
        }
        
        this.ukkeli.siirryVasen(amount);
        this.piirraCanvas();
        this.piirraChar();
        stopCanvasEvents(false);
        return true;
    }
    
    async goRight(amount){
        this.x += amount;
        const result = await verifyMove(this);
        if(!result){
            this.x -= amount;
            return false;
        } 

        this.ukkeli.siirryOikea(amount);
        const currImg = this.ukkeli.getCurrentImg();
        this.piirraCanvas(this.x- amount, this.y, currImg.leveys, currImg.korkeus);
        await this.piirraChar();
        stopCanvasEvents(false);
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
        bot.piirraCharStill(); // jos on animaatio kesken tulee näyttää kusiselta?
        this.ukkeli.siirryYlos(amount);
        this.piirraChar();
        setTimeout(async ()=>{
            this.y += amount;
            const result2 = await verifyMove(this);
            if(!result2){
                this.y -= amount;
                return false;
            } 
            
            const currImg = this.ukkeli.getCurrentImg();
            this.piirraCanvas(this.x, this.y-amount, currImg.leveys, currImg.korkeus);
            this.piirraCharStill();
            stopCanvasEvents(false);
        }, 300);
        return true;
    }

    block(state){
        blockState = state;
    }

    blockState(){
        return blockState;
    }

    async punch(bot, hp){
        if(!canAttack) return;
        canAttack = false;
        this.ukkeli.siirryAlas();
        await this.piirraChar();
        bot.piirraCharStill();

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
            stopCanvasEvents(false);
            canAttack = true;
        }, 230);
    }
 
    async punchL(bot, hp){
        if(!canAttack) return;
        canAttack = false;
        this.ukkeli.siirryAlas();
        await this.piirraChar();
        bot.piirraCharStill();

        if((this.getCoords().x - bot.getCoords().x) <=160 && (this.getCoords().x - bot.getCoords().x) > 0){
            hp.takeHit(10, bot.getName());
        }
        setTimeout(()=>{
            stopCanvasEvents(false);
            canAttack = true;
        }, 230);
    }

    async kick(bot, hp){
        if(!canAttack) return;
        canAttack = false;
        this.ukkeli.siirryPotku();
        let currImg = this.ukkeli.getCurrentImg();
        this.piirraCanvas(this.x, this.y, currImg.leveys, currImg.korkeus);
        this.y += 30;
        await this.piirraChar();
        setTimeout(()=>{
            currImg = this.ukkeli.getCurrentImg();
            this.piirraCanvas(this.x, this.y, currImg.leveys, currImg.korkeus);
            this.y -= 30;
            this.piirraCharStill();
        }, 100);

        if(this.getCoords().x > bot.getCoords().x){
            setTimeout(()=>{
                stopCanvasEvents(false);
                canAttack = true;
            }, 230);
            return;
        }
        if((bot.getCoords().x - this.x) <= 160){
            hp.takeHit(10, bot.getName()); 
        }
        setTimeout(()=>{
            stopCanvasEvents(false);
            canAttack = true;
        }, 230);
    }

    async kickL(bot, hp){
        if(!canAttack) return;
        canAttack = false;
        this.ukkeli.siirryPotku();
        let currImg = this.ukkeli.getCurrentImg();
        this.piirraCanvas(this.x, this.y, currImg.leveys, currImg.korkeus);
        this.y += 30;
        await this.piirraChar();
        setTimeout(()=>{
            currImg = this.ukkeli.getCurrentImg();
            this.piirraCanvas(this.x, this.y, currImg.leveys, currImg.korkeus);
            this.y -= 30;
            this.piirraCharStill();
        }, 100);
        if((this.getCoords().x - bot.getCoords().x) <= 160 && (this.getCoords().x - bot.getCoords().x) > 0){
            hp.takeHit(10, bot.getName());
        }
        setTimeout(()=>{
            stopCanvasEvents(false);
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
            await this.ukkeli.piirra(this.name !== getCookieValue("username"), this.x, this.y); 
        }
    }

    async piirraCharStill(){
        await this.ukkeli.drawStill(this.name !== getCookieValue("username"), this.x, this.y);
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