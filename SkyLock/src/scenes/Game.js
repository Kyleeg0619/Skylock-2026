import { Player } from '../gameObjects/Player.js';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.add.image(300, 300, 'background');

        // Setup Platforms
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(120, 190, 'island').setScale(0.3).refreshBody();
        this.platforms.create(470, 190, 'island2').setScale(0.3).refreshBody();
        this.platforms.create(120, 540, 'island3').setScale(0.3).refreshBody();
        this.platforms.create(470, 540, 'island4').setScale(0.3).refreshBody();

        // Initialize Player
        this.player = new Player(this, 100, 450);

        // Note: No collider here because we want them to fly "inside" the islands 
        // using the overlap logic inside Player.js

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        // Crucial: Call the player's update method!
        if (this.player) {
            this.player.update();
        }

        // Standard Movement Logic
        if (this.cursors.left.isDown) {
            this.player.group.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.group.setVelocityX(160);
        }
        
        if (this.cursors.up.isDown && this.player.body && this.player.body.touching.down) {
            this.player.group.setVelocityY(-330);
        }
    }
}