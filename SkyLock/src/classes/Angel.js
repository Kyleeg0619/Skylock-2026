export default class Angel {
    constructor(name, rarity, sprite) {
        this.name = name;
        this.rarity = rarity;
        this.sprite = sprite;
        switch (rarity) {
            case "common":
                this.buff = { coins: 0.1 };
                this.sellValue = 10;
                break;
            case "rare":
                this.buff = { coins: 0.2 };
                this.sellValue = 20;
                break;
            case "epic":
                this.buff = { coins: 0.5 };
                this.sellValue = 50;
                break;
            case "legendary":
                this.buff = { coins: 1.0 };
                this.sellValue = 100;
                break;
            default:
                this.buff = { coins: 0 };
                this.sellValue = 0;
        }
    }
}