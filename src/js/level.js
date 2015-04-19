export default (TILE_SIZE, BROADPHASE_SIZE) => class Level {

    entitiesByBlock: []
    mapByBlock: []

    currentBlock: { max: -10, min: -10 }

    createBlock(blockId) {
        entitiesByBlock[blockId] = [];
        mapByBlock[blockId] = [];
    }

    updatePosition(positionX) {
        const playerBroadphase = Math.floor(positionX / (BROADPHASE_SIZE * TILE_SIZE));
        const maxBlock = playerBroadphase + 1;
        const minBlock = playerBroadphase - 1;

        if (this.currentBlock.max < maxBlock) {

            this.currentBlock.max = maxBlock;

            const { entities, map } = this.generate(maxBlock);
            entitiesByBlock[maxBlock] = entities;
            mapByBlock[maxBlock] = map;

        }

        if (this.currentBlock.min < minBlock) {

            const prevMinBlock = this.currentBlock.min;
            this.currentBlock.min = minBlock;

            if (entitiesByBlock[prevMinBlock]) {
                entitiesByBlock[prevMinBlock].forEach((entity) => entity.kill());
                delete entitiesByBlock[prevMinBlock];
            }

        }


    }

}