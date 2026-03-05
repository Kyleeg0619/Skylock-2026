export default class Island {
    constructor(id, data) {
        this.id = id;
        this.name = data.name;
        this.sprite = data.sprite;
        this.price = data.price;
        this.buff = data.buff;
        this.sellValue = data.sellValue;
        this.angels = [];
    }
}