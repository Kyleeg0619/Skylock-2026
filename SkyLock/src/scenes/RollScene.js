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

    create() {
        this.music = this.sound.add('gachaMusic', {
            volume: this.registry.get("player").settings.sfx / 100
        });
        this.music.play();
        this.cameras.main.setBackgroundColor('#000000');
        this.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

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

        // Scene setup
        const cloud1 = this.add.image(0, 0, 'cloud').setScale(1.2).setPosition(this.sys.game.config.width / 4, this.sys.game.config.height / 2 + 100).setDepth(2);
        const cloud2 = this.add.image(0, 0, 'cloud').setScale(1).setPosition(3 * this.sys.game.config.width / 4, this.sys.game.config.height / 2).setDepth(2).setFlipX(true);
        this.add.image(0, 0, 'gate').setScale(1.3).setOrigin(0.5, 0.5).setPosition(this.sys.game.config.width / 2, this.sys.game.config.height / 2).setDepth(1);
        cam.setZoom(2);

        // 2. Fade In from black over 2000ms
        this.cameras.main.fadeIn(2000);

        // 3. Tween Zoom back to normal (1)
        this.tweens.add({
            targets: this.cameras.main,
            zoom: 1,
            duration: 2000,
            ease: 'Power2'
        });
        this.tweens.add({
            targets: cloud1,
            x: cloud1.x - 25,
            ease: 'Sine.easeInOut',
            duration: 2000,
        });
        this.tweens.add({
            targets: cloud2,
            x: cloud2.x + 25,
            ease: 'Sine.easeInOut',
            duration: 2000,
        });

        this.time.delayedCall(1700, () => {
            cam.shake(1000, 0.02);
            cloud1.tween = this.tweens.add({
                    targets: cloud1,
                    x: cloud1.x - 100,
                    ease: 'Sine.easeInOut',
                    duration: 2000,
                });
            cloud2.tween = this.tweens.add({
                    targets: cloud2,
                    x: cloud2.x + 100,
                    ease: 'Sine.easeInOut',
                    duration: 2000,
                });
        });
        
        cam.once('camerashakecomplete', () => {
                cam.flash(300, 255, 255, 255);
        });

        cam.once('cameraflashcomplete', () => {
            console.log("Cutscene complete, showing results...");
            cam.zoomTo(1.2, 300);
            this.scene.start('GachaResultScene', { results: this.results });
        });
    }

    // ----------------
    // Legendary Cutscene (for legendary rolls)
    // ----------------
    playLegendaryCutscene() {
        // Simple cutscene for legendary rolls
        const cam = this.cameras.main;

        // Scene setup
        const cloud1 = this.add.image(0, 0, 'cloud').setScale(1.2).setPosition(this.sys.game.config.width / 4, this.sys.game.config.height / 2 + 100).setDepth(2);
        const cloud2 = this.add.image(0, 0, 'cloud').setScale(1).setPosition(3 * this.sys.game.config.width / 4, this.sys.game.config.height / 2).setDepth(2).setFlipX(true);
        this.add.image(0, 0, 'gate').setScale(1.3).setOrigin(0.5, 0.5).setPosition(this.sys.game.config.width / 2, this.sys.game.config.height / 2).setDepth(1);
        const cherub = this.add.image(this.sys.game.config.width / 2, this.sys.game.config.height + 250, 'cherub').setScale(0.5).setDepth(3);
        cam.setZoom(2);

        // 2. Fade In from black over 2000ms
        this.cameras.main.fadeIn(2000);

        // 3. Tween Zoom back to normal (1)
        this.tweens.add({
            targets: this.cameras.main,
            zoom: 1,
            duration: 2000,
            ease: 'Power2'
        });
        this.tweens.add({
            targets: cloud1,
            x: cloud1.x - 25,
            ease: 'Sine.easeInOut',
            duration: 2000,
        });
        this.tweens.add({
            targets: cloud2,
            x: cloud2.x + 25,
            ease: 'Sine.easeInOut',
            duration: 2000,
        });

        this.time.delayedCall(1700, () => {
            cam.shake(1000, 0.02);
            cloud1.tween = this.tweens.add({
                    targets: cloud1,
                    x: cloud1.x - 100,
                    ease: 'Sine.easeInOut',
                    duration: 2000,
                });
            cloud2.tween = this.tweens.add({
                    targets: cloud2,
                    x: cloud2.x + 100,
                    ease: 'Sine.easeInOut',
                    duration: 2000,
                });
        });
        
        cam.once('camerashakecomplete', () => {
                cherub.tween = this.tweens.add({
                    targets: cherub,
                    y: cherub.y - 400,
                    ease: 'Sine.easeInOut',
                    duration: 2000,
                    onComplete: () => {
                        cam.flash(300, 255, 215, 0);
                    }
                });
        });

        cam.once('cameraflashcomplete', () => {
            console.log("Cutscene complete, showing results...");
            cam.zoomTo(1.2, 300);
            this.scene.start('GachaResultScene', { results: this.results });
        });
    }
}