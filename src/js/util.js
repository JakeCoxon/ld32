Object.defineProperty(Object.prototype, 'forEach', {
    enumerable: false,
    configurable: false,
    writable: true,
    value: function(f) {
        Object.keys(this).forEach(key => {
            var value = this[key];
            f(value, key);
        });
    }
});

Object.defineProperty(Phaser.Sprite.prototype, 'scaleXY', {
    get: function() {
        return this.scale.x;
    },
    set: function(v) {
        this.scale.set(v, v);
    }
});

Phaser.Sprite.prototype.cloneSprite = function() {
    const spr = new Phaser.Sprite(this.game, this.x, this.y, this.key);
    spr.width = this.width;
    spr.height = this.height;
    spr.tint = this.tint;
    spr.alpha = this.alpha;
    spr.scaleXY = this.scaleXY;
    spr.anchor.set(this.anchor.x, this.anchor.y);
    spr.rotation = this.rotation;
    this.parent.addChild(spr);
    return spr;
}

export function centerSpriteOnSprite(spr1, spr2) {
    spr1.x = spr2.x + (spr2.width - spr1.width) / 2;
    spr1.y = spr2.y + (spr2.height - spr1.height) / 2;
}

export function centerSpriteAt(spr, x, y) {
    spr.x = x - spr.width / 2;
    spr.y = y - spr.height / 2;
}

export function moveSiblingToChild(sprite, child) {
    if (sprite.parent !== child.parent) throw "Not siblings";
    sprite.parent.removeChild(sprite);
    child.addChild(sprite);
    sprite.x -= child.x;
    sprite.y -= child.y;
}

export function createBitmap(game, colour, width, height) {
    var data = game.add.bitmapData(width, height);

    data.ctx.beginPath();
    data.ctx.rect(0, 0, width, height);
    data.ctx.fillStyle = colour;
    data.ctx.fill();

    return data;
}