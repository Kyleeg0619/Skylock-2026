import {auth} from "../firebase/firebase.js";
import PlayerDataManager from "../services/PlayerDataManager.js";

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                const player = await PlayerDataManager.load();
                this.registry.set('player', player);
                this.scene.start('LoginScene');
            } else {
                this.scene.start('LoginScene');
            }
        });
    }
}