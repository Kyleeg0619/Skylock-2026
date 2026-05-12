import Phaser from "phaser";
import AuthService from "../services/AuthService";
import PlayerDataManager from "../services/PlayerDataManager";
import { AngelRegistry } from "../data/AngelRegistry";
import { updateCoinCount, updateAngelCoinCount } from "../services/ui";

export default class GachaResultScene extends Phaser.Scene {
    init(data) {
        this.results = data.results;
        this.player = this.registry.get("player");
    }

    create() {
        updateAngelCoinCount(this.player.angelCoins);
        updateCoinCount(this.player.coins);

        if (!this.sound.get('gachaMusic')) {
            this.music = this.sound.add('gachaMusic', {
                volume: this.player.settings.music / 100
            });
            this.music.setLoop(true);
            this.music.play();
        }
        
    this.cameras.main.setBackgroundColor('#000000');
    const cam = this.cameras.main;
    cam.fadeIn(300, 0, 0, 50);
    this.input.enabled = true;

    // Background
    this.add.image(0, 0, 'bg')
        .setOrigin(0, 0)
        .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    // Back to Gacha Button
    const backButton = this.add.image(width/2, height - 75, 'backButton').setDepth(3);
    backButton.setInteractive().on('pointerdown', async () => {
        this.scene.start('GachaScene');
    });

    // Container background
    const graphics = this.add.graphics();
    graphics.fillStyle(0xa27ad4, 1);
    graphics.fillRoundedRect(width / 2 - (this.sys.game.config.width - 100) / 2, height / 2 - (this.sys.game.config.height - 200) / 2, this.sys.game.config.width - 100, this.sys.game.config.height - 200, 20).setDepth(0);

    // --- Build containers for each angel ---
    const angelContainers = [];

    for (let i = 0; i < this.results.length; i++) {
        const result = this.results[i];

        const angelImage = this.add.image(0, 0, result.angel.id)
            .setScale(0.20)
            .setDepth(1);

        const angelName = this.add.text(0, 100, result.angel.name, {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'titleFont'
        }).setOrigin(0.5).setDepth(1);

        const container = this.add.container(0, 0, [angelImage, angelName])
            .setDepth(1);

        angelContainers.push(container);

        // Pop-in tween per container
        this.tweens.add({
            targets: angelImage,
            scale: { from: 0.05, to: 0.20 },
            ease: 'Back.Out',
            duration: 500,
            delay: i * 150
        });
    }

    // --- Grid layout ---
    const cols = 2;
    const cellWidth = 180;
    const cellHeight = 180;

    Phaser.Actions.GridAlign(angelContainers, {
        width: cols,
        cellWidth: cellWidth,
        cellHeight: cellHeight,
        x: width / 2 - ((cols - 1) * cellWidth) / 2,
        y: height / 2 - cellHeight - 30
    });
}

}