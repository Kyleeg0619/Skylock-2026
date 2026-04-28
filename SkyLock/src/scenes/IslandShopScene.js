import Phaser from "phaser";
import { IslandRegistry } from "../data/IslandRegistry.js";
import { showUI, updateCoinCount } from "../services/ui.js";
import { verifyPurchase } from "../classes/Player.js";

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

    init() {
        this.player = this.registry.get("player");
    }

    preload() {
        for (const [id, island] of Object.entries(IslandRegistry)) {
            this.load.image(id, `/assets/islands/${island.sprite}`);
        }

        this.load.image('bg','assets/backgrounds/island_bg.png');

        this.load.image('angel-shop-icon', 'assets/icons/angel-shop-icon.png');
        this.load.image('island-shop-icon', 'assets/icons/island-shop-icon.png');

        this.load.image('coin','assets/icons/cloud-coin.png');
        this.load.image('rounded','assets/icons/rounded-rect.png');
    }

    create() {
        showUI({
            settings: true,
            home: true,
            shop: true,
            edit: false,
            info: false,
            coins: true,
            excursion: false,
        });

        updateCoinCount(this.registry.get("player").coins);
        
        const bg = this.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        this.scrollContainer = this.add.container(0,135);

        this.createToggleBar();

        this.generateIslands();

        this.input.on("wheel", (pointer, gameObjects, dx, dy) => {
            this.scrollContainer.y -= dy * 0.5;
            this.scrollContainer.y = Phaser.Math.Clamp(
                this.scrollContainer.y,
                -600, // how far down you can scroll
                135     // top limit
            );
        });
    }

    createToggleBar() {
        const angels = this.add.image(200, 0, "angel-shop-icon").setOrigin(0.5).setInteractive({ useHandCursor: true });

        const islands = this.add.image(400, 0, "island-shop-icon").setOrigin(0.5).setInteractive({ useHandCursor: true });

        angels.on("pointerdown", () => {
            this.scene.start("ShopScene");
        });

        this.scrollContainer.add([angels,islands]);
    }

    generateIslands() {
        // Display Islands
        var x1 = this.sys.game.config.width/2 - 150;
        var x2 = this.sys.game.config.width/2 + 150;
        var x = this.sys.game.config.width/2 - 200
        var y = 200;
        const islands = Object.entries(IslandRegistry).map(([id, data]) => ({id,...data}));

        for (var i=0;i<islands.length;i++) {
            if (i % 2 == 0) {
                x = x1;
                y = (i!==0) ? y + 275 : y;
            } else {
                x = x2;
            }
            
            var islandImage = this.add.image(x,y,islands[i].id).setScale(0.35);
            var label = this.add.text(x+20,y+50,islands[i].price, {
                fontSize: "40px",
                fontFamily: "fields"
            });
            const labelBg = this.add.image(x+label.displayWidth/2,y+70,'rounded').setScale(1.5);
            const coin = this.add.image(x+label.displayWidth/2-55,y+70,'coin').setScale(0.1);

            this.scrollContainer.add([islandImage,labelBg,label,coin]);
        }
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

        const startX = 120;
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
