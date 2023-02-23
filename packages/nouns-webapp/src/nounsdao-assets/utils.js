const image_data_json_1 = require("./image-data.json");
const { bodies, accessories, heads, glasses } = image_data_json_1.images;
/**
 * Get encoded part and background information using a Noun seed
 * @param seed The Noun seed
 */
const getNounData = (seed) => {
    return {
        parts: [
            bodies[seed.body],
            accessories[seed.accessory],
            heads[seed.head],
            glasses[seed.glasses],
        ],
        background: image_data_json_1.bgcolors[seed.background],
    };
};
exports.getNounData = getNounData;
/**
 * Generate a random Noun seed
 * @param seed The Noun seed
 */
const getRandomNounSeed = () => {
    return {
        background: Math.floor(Math.random() * image_data_json_1.bgcolors.length),
        body: Math.floor(Math.random() * bodies.length),
        accessory: Math.floor(Math.random() * accessories.length),
        head: Math.floor(Math.random() * heads.length),
        glasses: Math.floor(Math.random() * glasses.length),
    };
};
exports.getRandomNounSeed = getRandomNounSeed;