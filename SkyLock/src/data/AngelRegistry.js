import Angel from "../classes/Angel";

export const AngelRegistry = {
    // Common Angels
    'dog-1': Angel("Pug", "common", "puppy-1.png"),
    'dog-2': Angel("Gold Retriever", "common", "puppy-2.png"),
    'dog-3': Angel("Australian Shepherd", "common", "puppy-3.png"),

    'cat-1': Angel("Cat-1", "common", "cat-1.png"),
    'cat-2': Angel("Cat-2", "common", "cat-2.png"),
    'cat-3': Angel("Cat-3", "common", "cat-3.png"),

    'bunny-1': Angel("White Bunny", "common", "bunny-1.png"),
    'bunny-2': Angel("Brown Bunny", "common", "bunny-2.png"),
    'bunny-3': Angel("Spotted Bunny", "common", "bunny-3.png"),
    
    // Rare Angels
    'seal-1': Angel("Seal", "rare", "seal-1.png"),
    'seal-2': Angel("Snow Seal", "rare", "seal-2.png"),
    'seal-3': Angel("Walrus", "rare", "seal-3.png"),
    'squirrel-1': Angel("Squirrel-1", "rare", "squirrel-1.png"),

    // Epic Angels
    'tiger-1': Angel("Tiger", "epic", "tiger-1.png"),
    'tiger-2': Angel("White Tiger", "epic", "tiger-2.png"),

    // Legendary Angels
    'star-squirrel': Angel("Star Squirrel", "legendary", "star-squirrel.png"),
    'cloud-axolotl': Angel("Cloud Axolotl", "legendary", "cloud-axolotl.png"),
    'cerberus': Angel("Cerberus", "legendary", "cerb.png")
};
