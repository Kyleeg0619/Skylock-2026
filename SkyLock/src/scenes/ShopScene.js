import { AngelRegistry } from "../data/AngelRegistry.js";

const colorPalette = {
    "royal-purple": 0xa27ad4,
    "dark-purple": 0x6654c0,
    "off-white": 0xfffbe6,
    "gold": 0xe3b969,
    "honey": 0xd08e64
};


export default class ShopScene extends Phaser.Scene {
    constructor() {
        super("ShopScene");
    }

    preload() {
        for (const [id, angel] of Object.entries(AngelRegistry)) {
            this.load.image(id, `/assets/angels/${angel.sprite}`);
        }
    }

    create() {
        this.cameras.main.setBackgroundColor("#4f2e95");
        this.scrollContainer = this.add.container(0, 80);

        this.categorized = this.sortAngels();

        this.createToggleBar();
        this.gachaButton();
        this.createShelf(this.categorized.dogs, 420, "Dogs");
        this.createShelf(this.categorized.cats, 620, "Cats");
        this.createShelf(this.categorized.buns, 820, "Buns");
        

        this.input.on("wheel", (pointer, gameObjects, dx, dy) => {
            this.scrollContainer.y -= dy * 0.5;
            this.scrollContainer.y = Phaser.Math.Clamp(
                this.scrollContainer.y,
                -120, // how far down you can scroll
                120     // top limit
            );
        });
    }
    createToggleBar() {
        const bg = this.add.rectangle(300, 60, 600, 80, colorPalette["dark-purple"])
            .setStrokeStyle(4, colorPalette["off-white"]);

        const angels = this.add.text(180, 60, "ANGELS", {
            fontSize: "36px",
            color: colorPalette["dark-purple"],
            fontFamily: "fields",
            fontWeight: "900"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const islands = this.add.text(420, 60, "ISLANDS", {
            fontSize: "36px",
            color: colorPalette["off-white"],
            fontFamily: "fields",
            fontWeight: "900"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        islands.on("pointerdown", () => {
            this.scene.start("IslandShopScene");
        });

        this.scrollContainer.add([bg, angels, islands]);
    }

    sortAngels() {
        const dogs = [], cats = [], buns = [];

        for (const [id, angel] of Object.entries(AngelRegistry)) {
            const entry = { id, ...angel };
            if (id.startsWith("dog")) dogs.push(entry);
            else if (id.startsWith("cat")) cats.push(entry);
            else if (id.startsWith("bunny")) buns.push(entry);
        }

        return { dogs, cats, buns };
    }

    gachaButton() {
        const bg = this.add.rectangle(300, 220, 500, 140, colorPalette["royal-purple"])
            .setStrokeStyle(6, colorPalette["dark-purple"])
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        const text = this.add.text(300, 220, "GACHA\n100", {
            fontSize: "48px",
            color: colorPalette["off-white"],
            align: "center",
            fontFamily: "fields",
            fontWeight: "900"
        }).setOrigin(0.5);

        this.scrollContainer.add([bg, text]);
    }
    
    createShelf(items, yOffset, label) {
    // Shelf background
    const shelf = this.add.rectangle(300, yOffset, 550, 160, colorPalette["dark-purple"])
        .setStrokeStyle(4, colorPalette["royal-purple"])
        .setOrigin(0.5);

    const title = this.add.text(300, yOffset - 110, label, {
        fontSize: "40px",
        color: colorPalette["off-white"],
        fontFamily: "fields",
        fontWeight: "900"
    }).setOrigin(0.5);

    this.scrollContainer.add([shelf, title]);

    // positions
    const startX = 140;
    const spacingX = 180;

    items.forEach((item, i) => {
        const x = startX + i * spacingX;

        // angel sprites
        const card = this.add.image(x, yOffset - 10, item.id)
            .setScale(0.22)
            .setInteractive({ useHandCursor: true });

        const price = this.add.text(x + 20, yOffset + 55, `${item.buyValue}`, {
            fontSize: "28px",
            color: colorPalette["off-white"],
            fontWeight: "bold",
            fontFamily: "fields"
        }).setOrigin(0, 0.5);


        const coin = this.add.image(x - 20, yOffset + 55, "cloud-coin.PNG")
            .setScale(0.12)
            .setOrigin(1, 0.5);

        card.on("pointerdown", () => this.confirmPopup(item));

        this.scrollContainer.add([card, price, coin]);
    });
}

    confirmPopup(item) {
    const overlay = this.add.rectangle(300, 400, 600, 800, 0x000000, 0.45)
        .setDepth(50);
    const box = this.add.rectangle(300, 400, 420, 320, colorPalette["royal-purple"])
        .setStrokeStyle(6, colorPalette["dark-purple"])
        .setOrigin(0.5)
        .setDepth(51);

    const sprite = this.add.image(300, 330, item.id)
        .setScale(0.20)
        .setDepth(52);

    const text = this.add.text(300, 420, `Adopt ${item.name} for ${item.buyValue}?`, {
        fontSize: "28px",
        color: colorPalette["off-white"],
        fontFamily: "fields",
        fontWeight: "900",
        align: "center"
    })
    .setOrigin(0.5)
    .setDepth(52);

    const adopt = this.add.text(180, 480, "ADOPT", {
        fontSize: "34px",
        color: colorPalette["off-white"],
        fontFamily: "fields",
        fontWeight: "900"
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .setDepth(52);

    adopt.on("pointerover", () => adopt.setScale(1.12));
    adopt.on("pointerout", () => adopt.setScale(1));

    const cancel = this.add.text(410, 480, "CANCEL", {
        fontSize: "34px",
        color: colorPalette["off-white"],
        fontFamily: "fields",
        fontWeight: "900"
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .setDepth(52);

    cancel.on("pointerover", () => cancel.setScale(1.12));
    cancel.on("pointerout", () => cancel.setScale(1));
    const close = () => {
        overlay.destroy();
        box.destroy();
        sprite.destroy();
        text.destroy();
        adopt.destroy();
        cancel.destroy();
    };

    adopt.on("pointerdown", () => {
        this.purchaseItem(item);
        close();
    });

    cancel.on("pointerdown", close);
}


    purchaseItem(item) {
        console.log("Purchased:", item.id);
    }
}
