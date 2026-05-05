import PlayerDataManager from "../services/PlayerDataManager";
import { AngelRegistry } from "../data/AngelRegistry.js";
import { showUI, updateCoinCount, initUI } from "../services/ui.js";
import { verifyPurchase } from "../classes/Player.js";

const colorPalette = {
    "royal-purple": '0xa27ad4',
    "dark-purple": '0x6654c0',
    "off-white": 'fffbe6',
    "gold": '0xe3b969',
    "honey": '0xd08e64'
};


export default class ShopScene extends Phaser.Scene {
    constructor() {
        super("ShopScene");
    }

    init() {
        this.player = this.registry.get("player");
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

        if (!this.sound.get('shopMusic')) {
            this.music = this.sound.add('shopMusic', {
            volume: this.player.settings.music / 100
        });
            this.music.setLoop(true);
            this.music.play();
        }

        this.cameras.main.setBackgroundColor("#4f2e95");
        const bg = this.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
        this.scrollContainer = this.add.container(0, 80);

        this.categorized = this.sortAngels();

        this.createToggleBar();
        this.gachaButton();
        this.createShelf(this.categorized.dogs, 500, "Dogs");
        this.createShelf(this.categorized.cats, 810, "Cats");
        this.createShelf(this.categorized.buns, 1120, "Buns");
        
        this.input.on("wheel", (pointer, gameObjects, dx, dy) => {
            this.scrollContainer.y -= dy * 0.5;
            this.scrollContainer.y = Phaser.Math.Clamp(
                this.scrollContainer.y,
                -600, // how far down you can scroll
                120     // top limit
            );
        });
    }

    async update() {
        if (window.__settingsOpened) {
            window.__settingsOpened = false;

            musicVolume.value = this.player.settings.music;
            sfxVolume.value = this.player.settings.sfx;
            skipCutscene.checked = this.player.settings.skipGacha;
            usernameInput.value = this.player.profile.username;
        }

        if (window.__settingsSubmitted) {
            window.__settingsSubmitted = false;

            this.player.settings.music = parseInt(musicVolume.value);
            this.player.settings.sfx = parseInt(sfxVolume.value);
            this.player.settings.skipGacha = skipCutscene.checked;
            this.player.profile.username = usernameInput.value;

            await this.player.save();
            this.registry.set('player', this.player);
            this.music.setVolume(this.player.settings.music / 100);
        }

        if (window.__goHomeRequested) {
            this.sound.stopAll();
            window.__goHomeRequested = false;
            this.scene.start('MainScene');
        }
    }

    createToggleBar() {
        const angels = this.add.image(200, 55, "angel-shop-icon").setOrigin(0.5).setInteractive({ useHandCursor: true });

        const islands = this.add.image(400, 55, "island-shop-icon").setOrigin(0.5).setInteractive({ useHandCursor: true });

        islands.on("pointerdown", () => {
            this.scene.start("IslandShopScene");
        });

        this.scrollContainer.add([angels, islands]);
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
        const gachaButton = this.add.image(300, 230, "gacha-link").setOrigin(0.5).setInteractive({ useHandCursor: true }).on("pointerdown", async () => {
            this.sound.stopAll();
            this.scene.sleep('ShopScene');
            this.scene.start("GachaScene");
        });
        gachaButton.displayWidth = 550;
        gachaButton.displayHeight = 207;

        this.scrollContainer.add([gachaButton]);
    }
    
    createShelf(items, yOffset, label) {
    // Shelf background
    const shelf = this.add.image(300, yOffset, "rounded-large").setOrigin(0.5);
    shelf.displayWidth = 550;
    shelf.displayHeight = 280;

    const title = this.add.text(300, yOffset - 100, label, {
        fontSize: "40px",
        fontFamily: "fields",
        fontWeight: "900"
    }).setOrigin(0.5).setFill(`#${colorPalette["off-white"]}`);

    this.scrollContainer.add([shelf, title]);

    // positions
    const startX = 110;
    const spacingX = 180;

    items.forEach((item, i) => {
        const x = startX + i * spacingX;

        const y = yOffset + 90;
        // angel sprites
        const card = this.add.image(x, yOffset, item.id)
            .setScale(0.22)
            .setInteractive({ useHandCursor: true });

        const price = this.add.text(x + 20, y, `${item.buyValue}`, {
            fontSize: "28px",
            color: `#${colorPalette["off-white"]}`,
            fontWeight: "bold",
            fontFamily: "fields"
        }).setOrigin(0, 0.5);

        const coin = this.add.image(x + 20, y, "cloud-coin")
            .setScale(0.10)
            .setOrigin(1, 0.5);

        const priceBg = this.add.image(x-30, y, "rounded")
            .setOrigin(0,0.5);

        card.on("pointerdown", () => this.confirmPopup(item));

        this.scrollContainer.add([card, priceBg,price, coin]);
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
        color: `#${colorPalette["off-white"]}`,
        fontFamily: "fields",
        fontWeight: "900",
        align: "center"
    })
    .setOrigin(0.5)
    .setDepth(52);

    const adopt = this.add.text(180, 480, "ADOPT", {
        fontSize: "34px",
        color: `#${colorPalette["off-white"]}`,
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
        color: `#${colorPalette["off-white"]}`,
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

    adopt.on("pointerdown", async () => {
        if (this.player.angels.owned.includes(item.id)) {
            alert('angel already obtained');
            return;
        }

        if (verifyPurchase(this.player,item.buyValue)) {
            this.player.angels.owned.push(item.id);
            await this.player.save();
            updateCoinCount(this.player.coins);
        } else {
            alert('insufficient funds');
            return;
        }
        close();
    });

    cancel.on("pointerdown", close);
}
}
