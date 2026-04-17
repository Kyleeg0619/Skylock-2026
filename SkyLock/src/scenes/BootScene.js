import { auth } from "../firebase/firebase.js";
import PlayerDataManager from "../services/PlayerDataManager.js";

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        auth.onAuthStateChanged(async (user) => {
            const playButton = document.querySelector('.playBtn');
            const loginForm = document.getElementById('loginForm');
            const signupForm = document.getElementById('signupForm');

            if (user) {
                // User is logged in: Load their data
                const player = await PlayerDataManager.load();
                this.registry.set('player', player);

                // Hide ALL UI elements - we're going straight to game
                if (loginForm) loginForm.style.display = 'none';
                if (signupForm) signupForm.style.display = 'none';
                if (playButton) playButton.style.display = 'none';

                // Skip TitleScene, go straight to Preloader → MainScene
                this.scene.start('Preloader');
            } else {
                // User is NOT logged in: Show login
                if (loginForm) loginForm.style.display = 'flex';
                if (playButton) playButton.style.display = 'none';

                this.scene.start('LoginScene');
            }
        });
    }
}