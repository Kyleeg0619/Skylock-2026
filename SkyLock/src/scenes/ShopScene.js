import Phaser from 'phaser';
import { angelRegistry } from "../data/AngelRegistry.js";

export default class ShopScene extends Phaser.Scene {
    constructor() {
        super('ShopScene');
    }

    preload() {
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
    }

    create() {
        // Background
        this.cameras.main.setBackgroundColor('#a27ad4');

        // Build shop data from angelRegistry
        const shopData = this.buildShopData();
        console.log("Shop Data:", shopData);

        this.buildShopUI(shopData);
    }
    buildShopData() {
        const shopData = {
            name: 'SkyLock Shop',
            dogs: [],
            cats: [],
            buns: []
        };

        for (const [key, angel] of Object.entries(angelRegistry)) {
            if (angel.rarity === 'common') {

                if (key.startsWith('dog')) {
                    shopData.dogs.push({ id: key, ...angel });

                } else if (key.startsWith('cat')) {
                    shopData.cats.push({ id: key, ...angel });

                } else if (key.startsWith('bunny')) {
                    shopData.buns.push({ id: key, ...angel });
                }
            }
        }

        return shopData;
    }
    buildShopUI(data) {
        this.add.text(50, 50, data.name, {
            fontSize: 32,
            color: '#ffffff'
        });

        this.add.text(50, 120, `Dogs: ${data.dogs.length}`, { fontSize: 24, color: '#fff' });
        this.add.text(50, 160, `Cats: ${data.cats.length}`, { fontSize: 24, color: '#fff' });
        this.add.text(50, 200, `Bunnies: ${data.buns.length}`, { fontSize: 24, color: '#fff' });

    }
}