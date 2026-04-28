import Phaser from "phaser";
import AuthService from "../services/AuthService";
import PlayerDataManager from "../services/PlayerDataManager";
import { initUI, showUI } from "../services/ui";
import { updateCoinCount } from "../services/ui";
import { updateAngelCoinCount } from "../services/ui";
import { verifyPurchase, verifyLegendaryPurchase } from "../classes/Player";

export default class GachaScene extends Phaser.Scene {
    init() {
        this.player = this.registry.get("player");
    }

    preload() {
        // Load any assets needed for the gacha scene (e.g., background, buttons)
        this.load.image('gacha_bg', 'assets/backgrounds/gacha_bg.png');

        // Buttons
        this.load.image('b1', 'assets/icons/button_summon1.png');
        this.load.image('b5', 'assets/icons/button_summon5.png');
        this.load.image('legendary', 'assets/icons/legendary_summon_button.png')
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
            angelcoins: true
        });

            updateCoinCount(this.player.coins);
            updateAngelCoinCount(this.player.angelCoins);

        // Gacha Prices
        this.summon1Cost = 200;
        this.summon5Cost = 1000;
        this.legendaryCost = 100;

        // Background
        this.cameras.main.setBackgroundColor('#f0e68c');
        this.add.image(0, 0, 'gacha_bg').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        // Summon Buttons
        const summon1Button = this.add.image(0, 0, 'b1').setInteractive().on('pointerdown', async () => {
            if (!verifyPurchase(this.player, this.summon1Cost)) {
                // Not enough coins, show an error message or feedback
                alert("Not enough coins for a summon!");
                return;
            }
            var legendary = false;
            const results = [];
            const result = await this.rollGacha();

            if (result.rarity === 'legendary') legendary = true;

            if (!this.player.angels.owned.includes(result.angel.id)) {
                    this.player.angels.owned.push(result.angel.id);
                } else {
                    this.player.angelCoins += 1;
                };

            this.player.coins -= this.summon1Cost;
            this.player.angels.owned.push(result.angel.id);
            await this.player.save();

            results.push(result);
            this.scene.start('RollScene', { results, legendary });
        });

        const summon5Button = this.add.image(0, 0, 'b5').setInteractive().on('pointerdown', async () => {
            if (!verifyPurchase(this.player, this.summon5Cost)) {
                // Not enough coins, show an error message or feedback
                alert("Not enough coins for 5 summons!");
                return;
            }
            var legendary = false;
            const results = [];
            this.player.coins -= this.summon5Cost;
            for (let i = 0; i < 5; i++) {
                const result = await this.rollGacha();

                if (result.rarity === 'legendary') legendary = true;

                if (!this.player.angels.owned.includes(result.angel.id)) {
                    this.player.angels.owned.push(result.angel.id);
                } else {
                    this.player.angelCoins += 1;
                };

                results.push(result);
            }

            await this.player.save();

            this.scene.start('RollScene', { results, legendary });
        });

        const legendaryButton = this.add.image(0, 0, 'legendary').setInteractive().on('pointerdown', async () => {
            if (!verifyLegendaryPurchase(this.player, this.legendaryCost)) {
                // Not enough angel coins, show an error message or feedback
                alert("Not enough Angel Coins for a legendary summon!");
                return;
            }
            const result = await this.rollLegendary();
            this.scene.start('RollScene', { results: [result], legendary: true });
        });

        summon5Button.setOrigin(1,1).setPosition(this.sys.game.config.width - 30, this.sys.game.config.height - 30);
        summon1Button.setOrigin(1,1).setPosition(this.sys.game.config.width - 30, this.sys.game.config.height - 205);
        legendaryButton.setOrigin(1,0).setPosition(200 + 30, this.sys.game.config.height - 150 - 30);
    }

    async update() {
        // Any animations or updates for the gacha scene can go here

        // Example: Check for button clicks or animate characters
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

    async rollGacha() {
        const res = await fetch('https://us-central1-skylock-c920c.cloudfunctions.net/rollGacha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        return await res.json();
    }

    async rollLegendary() {
        const res = await fetch('https://us-central1-skylock-c920c.cloudfunctions.net/rollLegendary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        return await res.json();
    }
}