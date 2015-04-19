
export default (TILE_SIZE) => {

    function checkCollisions(map, prevY, newY, entity) {

        function pointToTile(p) {
            return Math.floor(p / TILE_SIZE);
        }
        function tileFromPoint(px, py) {
            const x = pointToTile(px);
            const y = pointToTile(py);
            const tile = map.get(x, y);
            return { x, y, tile };
        }

        if (entity.width > TILE_SIZE) throw "Entity to wide";

        var collision = { isCollision: false, y: 0, entity: null };

        if (prevY > newY) return collision;

        if (newY >= entity.groundLevel - entity.height) {

            collision.isCollision = true;
            collision.y = entity.groundLevel;
            return collision;
        }

        const flat = prevY == newY;

        const jumpOn = (x) => (flat || !tileFromPoint(x, prevY + entity.height).tile) &&
                              tileFromPoint(x, newY + entity.height).tile;

        
        const jumpLeft = jumpOn(entity.x);
        const jumpRight = jumpOn(entity.x + entity.width);
        if (jumpLeft || jumpRight) {
            const tileX = jumpLeft ? pointToTile(entity.x) : pointToTile(entity.x + entity.width);
            const tileY = pointToTile(newY + entity.height);
            collision.isCollision = true;
            collision.tileX = tileX;
            collision.tileY = tileY;
            collision.y = tileY * TILE_SIZE;
            return collision;
        }

        return collision;

    }

    return checkCollisions;
}