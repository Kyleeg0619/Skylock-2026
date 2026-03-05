export default class Angel {
    constructor(id, data) {
        this.id = id;
        this.name = data.name;
        this.rarity = data.rarity;
        this.sprite = data.sprite;
        this.buff = data.buff;
        this.sellValue = data.sellValue;
    }
}