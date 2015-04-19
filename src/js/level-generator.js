const templates = [
    ["             2 ",
     "          1 13",
     "      1    ",
     "   1     ",
     "1       "],

    ["          ",
     "      2  ",
     "     2    ",
     " 3 1 3  3 ",
     "1        "],

    ["  3      ",
     "     2    ",
     " 3 1 3  3 ",
     "1111111"],

    ["1",
     "1",
     "1",
     "1"],
];


function pasteTemplate(template, x, y, array, entities) {
    template.forEach((line, iy) => {
        line.forEach((c, ix) => {
            ix = Number(ix), iy = Number(iy);
            if (!array[x + ix]) return;

            if (c == '1') {
                array[x + ix][y + iy] = 1;
            } else if (c == ' ') {
                array[x + ix][y + iy] = 0
            }
            
            if (c == '2') {
                entities.push({ x: x + ix, y: y + iy, type: 'point'})
            }
            if (c == '3') {
                entities.push({ x: x + ix, y: y + iy, type: 'enemy'})
            }

        })

    })
}

function generateLevel(width, height, groundRotation) {
    const array = new Array(width);

    for (let i = 0; i < width; i++) {
        array[i] = {};
    }

    for (let i = 0; i < width; i++) {
        const offsetY = Math.floor(Math.sin(groundRotation) * i);

        for (let j = 0; j < height; j++) {
            // const idx = j * w + i;
            const tile = Math.random() > 0.9 ? 1 : 0;

            if (tile) {
                array[i][j + offsetY] = tile;
            }
        }
    }


    const entities = [];

    for (let i = 0; i < 50; i++ ) {
        const type = "point";
        const x = Math.floor(Math.random() * width);
        const offsetY = Math.floor(Math.sin(groundRotation) * x);
        const y = Math.floor(Math.random() * height) + offsetY;
        entities.push({ type, x, y });
    }

    for (let i = 0; i < 50; i++ ) {
        const type = "enemy";
        const x = Math.floor(Math.random() * width);
        const offsetY = Math.floor(Math.sin(groundRotation) * x);
        const y = Math.floor(Math.random() * height) + offsetY;
        entities.push({ type, x, y });
    }


    for (let i = 0; i < 100; i++) {

        const offsetY = Math.floor(Math.sin(groundRotation) * i);

        if (Math.random() > 0.8) {
            const templateId = Math.floor(Math.random() * templates.length);

            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height) + offsetY;
            pasteTemplate(templates[templateId], x, y, array, entities);
        }

    }







    return {
        width, height,
        array,
        entities,
        get: (x, y) => array[x] && array[x][y],
        iterate: (f) => array.forEach((arr, x) => arr.forEach((_, y) => f(x, Number(y))))
    };
}

export default generateLevel;