// Tää on bonari botti joka ei 100% oo vaa pelaaja - score ja pari outoo global variablee, (tee random ja lisää canvaksee)
class Bot extends Character{
    
    async doRandomAction(player, hp) {

        let moveAmount = 20;

        let moveActions = [
            ()=>{this.goLeft(moveAmount, player.getCoords()).then(()=>{player.piirraCharStill()})},
            ()=>{this.goRight(moveAmount).then(()=>{player.piirraCharStill()})},
            ()=>{this.jump(75, player).then(()=>{player.piirraCharStill()})}
        ];

        let attackActions = [
            ()=>{this.punch(player, hp)},
            ()=>{this.punchL(player, hp)},
            ()=>{this.kick(player, hp)},
            ()=>{this.kickL(player, hp)}
        ];

        let actions = [
            ()=>{}, // Do nothing,
            ()=>{}, // Do nothing,
            ...moveActions, // Näil on isompi tsäännssi tulla valituks
            ...moveActions,
            ...moveActions,
            ...attackActions

        ];
        let actionIndex = Math.floor(Math.random() * actions.length);
        console.log("action index", actionIndex);
        let action = actions[actionIndex];
        console.log("action", action);
        await action(); // väittää ettei awaitilla oo effectiä mut se on kusetusta
    }

    // Overloads

    punch(player, hp){
        if(!canAttack) return;
        this.ctx.fillStyle = "rgba(0, 0, 200, 0)";
        this.ctx.fillRect((this.x + this.userW), (this.y + 40), 70, (this.userH / 3));
        canAttack = false;
        setTimeout(()=>{
            this.piirraCanvas();
            player.piirraCharStill();
            this.piirraChar();
        }, 100);

        if(this.getCoords().x > player.getCoords().x){
            setTimeout(()=>{
                canAttack = true;
            }, 230);
            return;
        } 
        if((player.getCoords().x - this.x) <= 160){
            hp.takeHit(10, player.getName());
        }
        setTimeout(()=>{
            canAttack = true;
        }, 230);
    }
 
    punchL(player, hp){
        if(!canAttack) return;
        this.ctx.fillStyle = "rgba(0, 0, 200, 0)";
        this.ctx.fillRect((this.x - this.userW + 20), (this.y + 40), 70, (this.userH / 3));
        canAttack = false;
        setTimeout(()=>{
            this.piirraCanvas();
            player.piirraCharStill();
            this.piirraChar()
        }, 100);
        if((this.getCoords().x - player.getCoords().x) <=160 && (this.getCoords().x - player.getCoords().x) > 0){
            hp.takeHit(10, player.getName());
        }
        setTimeout(()=>{
            canAttack = true;
        }, 230);
    }

    

    kick(player, hp){
        if(!canAttack) return;
        this.ctx.fillStyle = "rgba(0, 0, 200, 0)";
        this.ctx.fillRect((this.x + this.userW), (this.y + 95), 70, (this.userH / 3));
        canAttack = false;
        setTimeout(()=>{
            this.piirraCanvas();
            player.piirraCharStill();
            this.piirraChar();
        }, 100);

        if(this.getCoords().x > player.getCoords().x){
            setTimeout(()=>{
                canAttack = true;
            }, 230);
            return;
        }
        if((player.getCoords().x - this.x) <= 160){
            hp.takeHit(10, player.getName()); 
        }
        setTimeout(()=>{
            canAttack = true;
        }, 230);
    }

    kickL(player, hp){
        if(!canAttack) return;
        this.ctx.fillStyle = "rgba(0, 0, 200, 0)";
        this.ctx.fillRect((this.x - this.userW + 20), (this.y + 95), 70, (this.userH / 3));
        canAttack = false;
        setTimeout(()=>{
            this.piirraCanvas();
            player.piirraCharStill();
            this.piirraChar();
        }, 100);
        if((this.getCoords().x - player.getCoords().x) <= 160 && (this.getCoords().x - player.getCoords().x) > 0){
            hp.takeHit(10, player.getName());
        }
        setTimeout(()=>{
            canAttack = true;
        }, 230);
    }
}