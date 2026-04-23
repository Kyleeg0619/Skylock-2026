import Phaser from "phaser";
import AuthService from "../services/AuthService";
import PlayerDataManager from "../services/PlayerDataManager";
import { initUI, showUI } from "../services/ui";
import { AngelRegistry } from "../data/AngelRegistry";

export default class RollScene extends Phaser.Scene {
    init(data) {
        this.results = data.results;
        this.legendary = data.legendary || false;
    }

    preload() {
        // Load any assets needed for the cutscene (e.g., backgrounds, character sprites)
        this.load.image('gate', 'assets/cutscenes/gate.png');
        this.load.image('cloud', 'assets/cutscenes/cloud.png');
        this.load.image('cherub', 'assets/cutscenes/Cherub-rise.PNG');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');


        this.input.enabled = false;

        if (this.legendary) {
            // Handle legendary character display
            this.playLegendaryCutscene();
        } else {
            this.playDefaultCutscene();
        }
    }

    // ----------------
    // Default Cutscene (for non-legendary rolls)
    // ----------------
    playDefaultCutscene() {
        // Simple cutscene for non-legendary rolls
        const cam = this.cameras.main;
        cam.fadeIn(300, 0, 0, 50);

        cloud1 = this.add.image(200, 300, 'cloud').setScale(0.5);
        cloud2 = this.add.image(600, 300, 'cloud').setScale(0.5).flipX = true;

        this.add.image(400, 300, 'gate').setScale(0.5);

        cam.shake(500, 0.005);

        cam.on('camerashakecomplete', () => {
            this.scene.time.delayedCall(300, () => {
                cam.shake(300, 0.01);
            });
        });
        
        cam.on('camerashakecomplete', () => {
            cam.flashEffect(300, 255, 255, 255);
        });

        cam.on('flashcomplete', () => {
            this.finishCutscene();
        });
    }

    // ----------------
    // Legendary Cutscene (for legendary rolls)
    // ----------------
    playLegendaryCutscene() {
        const cam = this.cameras.main;
        cam.fadeIn(300, 0, 0, 50);

        cloud1 = this.add.image(200, 300, 'cloud').setScale(0.5);
        cloud2 = this.add.image(600, 300, 'cloud').setScale(0.5).flipX = true;

        this.add.image(400, 300, 'gate').setScale(0.5);
        cherub = this.add.image(400, 300, 'cherub').setScale(0.5).setAlpha(0);

        cam.shake(500, 0.005);

        cam.on('camerashakecomplete', () => {
            this.scene.time.delayedCall(300, () => {
                cam.shake(300, 0.01);
            });
        });

        this.scene.time.delayedCall(300, () => {
            this.tweens.add({
                targets: cherub,
                alpha: 1,
                y: 250,
                ease: 'Power1',
                duration: 1000,
            });
        });
        
        this.scene.time.delayedCall(1300, () => {
            cam.flashEffect(300, 255, 255, 255);
        });

        cam.on('flashcomplete', () => {
            this.finishCutscene();
        });
    }

    finishCutscene() {
        this.scene.start("GachaResultScene", { results: this.results });
    }
}