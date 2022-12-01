// Tää on bonari botti joka ei 100% oo vaa pelaaja - score ja pari outoo global variablee, (tee random ja lisää canvaksee)
class Bot extends Character{
    
    async doRandomAction(player, hp) {

        let moveAmount = 20;

        let moveActions = [
            ()=>{this.goLeft(moveAmount).then(()=>{player.piirraCharStill()})},
            ()=>{this.goLeft(moveAmount).then(()=>{player.piirraCharStill()})},
            ()=>{this.goLeft(moveAmount).then(()=>{player.piirraCharStill()})},
            ()=>{this.goRight(moveAmount).then(()=>{player.piirraCharStill()})},
            ()=>{this.jump(75, player).then(()=>{player.piirraCharStill()})}
        ];

        let attackActions = [
            ()=>{this.punchL(player, hp)},
            ()=>{this.kickR(player, hp)},
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
}