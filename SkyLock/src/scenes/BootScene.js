import { auth } from "../firebase/firebase.js";
import PlayerDataManager from "../services/PlayerDataManager.js";
import { IslandRegistry } from "../data/IslandRegistry.js";
import { AngelRegistry } from "../data/AngelRegistry.js";

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Fonts
        this.load.font('titleFont', '/assets/fonts/titleFont.ttf');

        // Backgrounds
        this.load.image('title_bg', '/assets/backgrounds/title_bg.png');
        this.load.image('bg', '/assets/backgrounds/island_bg.png');
        this.load.image('gacha_bg', '/assets/backgrounds/gacha_bg.png');
        this.load.image('excursion_bg', '/assets/backgrounds/excursion_bg.png');
        this.load.image('timer_bg', '/assets/backgrounds/timer_bg.png');
        
        // Audio
        this.load.audio('theme',['/assets/audio/floating-garden.mp3']);

        this.load.audio('shopMusic', ['/assets/audio/shop.mp3']);

        this.load.audio('gachaMusic', ['/assets/audio/gacha.mp3']);
        this.load.audio('gachaRollMusic', ['/assets/audio/gacha-roll.mp3']);

        this.load.audio('excursionMusic', ['/assets/audio/excursion.mp3']);

        // Islands
        for (const [id, island] of Object.entries(IslandRegistry)) {
            this.load.image(id, `/assets/islands/${island.sprite}`);
        }

        // Angels
        for (const [id, angel] of Object.entries(AngelRegistry)) {
            this.load.image(id, `/assets/angels/${angel.sprite}`);
        }

        // UI
        this.load.image('cloud-coin', '/assets/icons/cloud-coin.png');

        this.load.image('rounded', '/assets/icons/rounded-rect.png');
        this.load.image('rounded-large', '/assets/icons/rounded-rect-2.png');

        this.load.image('gacha-link','/assets/icons/gacha-link.png');
        this.load.image('angel-shop-icon', '/assets/icons/angel-shop-icon.png');
        this.load.image('island-shop-icon', '/assets/icons/island-shop-icon.png');

        this.load.image('b1', '/assets/icons/button_summon1.png');
        this.load.image('b5', '/assets/icons/button_summon5.png');
        this.load.image('legendary', '/assets/icons/legendary_summon_button.png')
        
        this.load.image('gate', '/assets/cutscenes/gate.png');
        this.load.image('cloud', '/assets/cutscenes/cloud.png');
        this.load.image('cherub', '/assets/cutscenes/cherub-rise.png');
        this.load.image('backButton','/assets/icons/back_to_gacha.png');

        this.load.image('cancel_popup', '/assets/icons/penalty.png');
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
                this.scene.start('MainScene');
            } else {
                // User is NOT logged in: Show login
                if (loginForm) loginForm.style.display = 'flex';
                if (playButton) playButton.style.display = 'none';

                this.scene.start('LoginScene');
            }
        });
    }
}