import Phaser from "phaser";
import PlayerDataManager from "../services/PlayerDataManager";
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

        this.load.image('bg','/assets/backgrounds/island_bg.png');

        this.load.image('angel-shop-icon', '/assets/icons/angel-shop-icon.png');
        this.load.image('island-shop-icon', '/assets/icons/island-shop-icon.png');

        this.load.image('coin','/assets/icons/cloud-coin.png');
        this.load.image('rounded','/assets/icons/rounded-rect.png');
        this.load.image('rounded-rect','/assets/icons/rounded-rect-2.png');
    }

    async create() {
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
            window.__goHomeRequested = false;
            this.scene.start('MainScene');
        }

        if (window.__goToShop) {
            window.__goToShop = false;
            this.scene.start('ShopScene');
        }
    }

    createToggleBar() {
        const angels = this.add.image(200, 0, "angel-shop-icon").setOrigin(0.5).setInteractive({ useHandCursor: true });

        const islands = this.add.image(400, 0, "island-shop-icon").setOrigin(0.5).setInteractive({ useHandCursor: true });

        angels.on("pointerdown", () => {
            this.scene.start("ShopScene");
        });

        this.scrollContainer.add([angels,islands]);
    }

    async generateIslands() {
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
            
            const islandData = islands[i];
            var islandImage = this.add.image(x,y,islandData.id).setScale(0.35).setInteractive().on( 'pointerdown', () => {
                this.openConfirmPopup(islandData);
            });
            var label = this.add.text(x+20,y+50,islandData.price, {
                fontSize: "40px",
                fontFamily: "fields"
            });
            const labelBg = this.add.image(x+label.displayWidth/2,y+70,'rounded').setScale(1.5);
            const coin = this.add.image(x+label.displayWidth/2-55,y+70,'coin').setScale(0.1);

            this.scrollContainer.add([islandImage,labelBg,label,coin]);
        }
    }

    async openConfirmPopup(island) {
        const overlay = this.add.rectangle(300, 400, 600, 800, 0x000000, 0.4);

        const box = this.add.image(300, 400, 'rounded-rect').setOrigin(0.5);
        box.displayWidth = 420;
        box.displayHeight = 300;

        const sprite = this.add.image(300, 340, island.id).setScale(0.15);

        const text = this.add.text(300, 420, `Buy ${island.name} for ${island.price}?`, {
            fontSize: "26px",
            color: colorPalette["off-white"],
            align: "center",
            fontFamily: "fields"
        }).setOrigin(0.5);

        const buy = this.add.text(150, 480, "BUY", {
            fontSize: "32px",
            color: colorPalette["gold"],
            fontWeight: "bold",
            fontFamily: "fields"
        }).setInteractive();

        const cancel = this.add.text(340, 480, "CANCEL", {
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

        buy.on("pointerdown", async () => {
            console.log("Purchased island:", island.id);
            if (verifyPurchase(this.player,island.price)) {
                this.player.islands.owned.push(island.id);
                await this.player.save();
                updateCoinCount(this.player.coins);
            } else {
                alert('Insufficient Funds');
            }
            close();
        });

        cancel.on("pointerdown", close);
    }
}
