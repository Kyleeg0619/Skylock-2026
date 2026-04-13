import Phaser from "phaser";
import { IslandRegistry } from "../data/IslandRegistry.js";

const colorPalette = {
    "royal-purple": "#a27ad4",
    "dark-purple": "#6654c0",
    "off-white": "#fffbe6",
    "gold": "#e3b969",
    "honey": "#d08e64"
};

export default class IslandShopScene extends Phaser.Scene {
    constructor() {
        super("IslandShopScene");
    }

    preload() {
        for (const [id, island] of Object.entries(IslandRegistry)) {
            this.load.image(id, `/assets/islands/${island.sprite}`);
        }
    }

    create() {
        this.add.rectangle(300, 400, 600, 800, colorPalette["royal-purple"]);

        this.createToggleBar();

        this.grouped = this.groupIslands();

        this.createShelf(this.grouped.tier1, 440);
        this.createShelf(this.grouped.tier2, 620);
    }

    createToggleBar() {
        const bg = this.add.rectangle(300, 60, 600, 80, colorPalette["dark-purple"])
            .setStrokeStyle(4, colorPalette["gold"]);

        const angels = this.add.text(180, 60, "ANGELS", {
            fontSize: "36px",
            color: colorPalette["off-white"],
            fontFamily: "fields",
            fontWeight: "900"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const islands = this.add.text(420, 60, "ISLANDS", {
            fontSize: "36px",
            color: colorPalette["gold"],
            fontFamily: "fields",
            fontWeight: "900"
        }).setOrigin(0.5);

        angels.on("pointerdown", () => {
            this.scene.start("ShopScene");
        });
    }

    groupIslands() {
        const tier1 = [];
        const tier2 = [];

        for (const [id, island] of Object.entries(IslandRegistry)) {
            const entry = { id, ...island };

            if(island.price === 100) tier1.push(entry);
            else tier2.push(entry);
        }
        return { tier1, tier2 };
    }

    createShelf(items, yOffset, label) {
        this.add.rectangle(300, yOffset, 550, 160, colorPalette["dark-purple"])
            .setStrokeStyle(4, colorPalette["royal-purple"])
            .setOrigin(0.5);

        this.add.text(40, yOffset - 90, label, {
            fontSize: "36px",
            color: colorPalette["off-white"],
            fontFamily: "fields",
            fontWeight: "900"
        });

        const startX = 140;
        const spacingX = 180;

        items.forEach((item, i) => {
            const x = startX + i * spacingX;

            const card = this.add.image(x, yOffset, item.id)
                .setScale(0.25)
                .setInteractive({ useHandCursor: true });

            this.add.text(x, yOffset + 50, `${item.price}`, {
                fontSize: "28px",
                color: colorPalette["gold"],
                fontWeight: "bold",
                fontFamily: "fields"
            }).setOrigin(0.5);

            card.on("pointerdown", () => this.openConfirmPopup(item));
        });
    }

    openConfirmPopup(item) {
        const overlay = this.add.rectangle(300, 400, 600, 800, 0x000000, 0.4);

        const box = this.add.rectangle(300, 400, 420, 300, colorPalette["royal-purple"])
            .setStrokeStyle(6, colorPalette["dark-purple"]);

        const sprite = this.add.image(300, 340, item.id).setScale(0.15);

        const text = this.add.text(300, 420, `Buy ${item.name} for ${item.price}?`, {
            fontSize: "26px",
            color: colorPalette["off-white"],
            align: "center",
            fontFamily: "fields"
        }).setOrigin(0.5);

        const buy = this.add.text(240, 480, "BUY", {
            fontSize: "32px",
            color: colorPalette["gold"],
            fontWeight: "bold",
            fontFamily: "fields"
        }).setInteractive();

        const cancel = this.add.text(360, 480, "CANCEL", {
            fontSize: "32px",
            color: colorPalette["off-white"],
            fontFamily: "fields"
        }).setInteractive();

        const close = () => {
            overlay.destroy();
            box.destroy();
            sprite.destroy();
            text.destroy();
            buy.destroy();
            cancel.destroy();
        };

        buy.on("pointerdown", () => {
            console.log("Purchased island:", item.id);
            close();
        });

        cancel.on("pointerdown", close);
    }
}
