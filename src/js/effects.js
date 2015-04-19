import * as util from './util.js'

export function createPounceEffect(entity, dx, dy, finalScale=2, alpha=0.4) {
    const spr = entity.pounceEffect || entity.cloneSprite();
    spr.alpha = alpha;
    spr.scale.set(1);

    const finalX = entity.x + (entity.width - entity.width * finalScale) / 2;
    const finalY = entity.y + (entity.height - entity.height * finalScale);
    entity.game.add.tween(spr).to({ scaleXY: finalScale, alpha: 0, x: finalX, y: finalY }, 1000, Phaser.Easing.Circular.Out, true)
}

export function createPounceEffectSpin(entity, dx, dy, finalScale=2, alpha=0.4) {
    const spr = entity.pounceEffect = entity.pounceEffect || entity.cloneSprite();
    spr.alpha = alpha;
    spr.scale.set(1);
    spr.rotation = 0;

    const finalX = entity.x + (entity.width - entity.width * finalScale) / 2;
    const finalY = entity.y + (entity.height - entity.height * finalScale);
    entity.game.add.tween(spr).to({ 
        scaleXY: finalScale, 
        alpha: 0, 
        x: finalX, 
        y: finalY,
        rotation: 15
    }, 1000, Phaser.Easing.Circular.Out, true)
}

export function createGlowEffect(entity) {
    const spr = entity.glowEffect = entity.glowEffect || entity.cloneSprite();
    spr.revive();
    spr.scaleXY = 1.5;
    spr.tint = 0xAF5A5A;
    spr.alpha = 0.5;
    util.centerSpriteAt(spr, entity.width / 2, entity.height / 2)

    entity.game.add.tween(spr).to({ 
        scaleXY: 2, 
        alpha: 0, 
    }, 1000, Phaser.Easing.Circular.Out, true)

    return spr;
}

export function createDeathEffect(entity) {
    const deathEffects = entity.deathEffects = entity.deathEffects || (() => {
        const arr = []
        for (let i = 1; i <= 5; i++) {
            const spr = entity.cloneSprite();
            spr.loadTexture("player-d" + i);
            arr.push(spr);
        }
        return arr;
    })();

    const dir = [
        [0, -1],
        [-1, -1],
        [1, 0],
        [0, 1],
        [0, 1.5]
    ]
    deathEffects.forEach((eff, idx) => {
        eff.anchor.set(0.5, 0.5);
        eff.alpha = 1;
        eff.scaleXY = 1;
        eff.x = entity.x + entity.width / 2;
        eff.y = entity.y + entity.height / 2;



        entity.game.add.tween(eff).to({ 
            scaleXY: 3, 
            alpha: 0.3, 
            x: eff.x + dir[idx][0] * 20,
            y: eff.y + dir[idx][1] * 20,
        }, 5000, Phaser.Easing.Circular.Out, true)
    });

    entity.kill();
}

export function createJumpEffect(entity) {
    if (entity.jumpEffect) return;

    const spr = entity.jumpEffect = entity.cloneSprite();
    util.moveSiblingToChild(spr, entity);

    spr.tint = 0x4E4D7C;
    spr.alpha = 1;

    entity.game.add.tween(spr).to({ 
        alpha: 0.3
    }, 1000, Phaser.Easing.Circular.Out, true)
}