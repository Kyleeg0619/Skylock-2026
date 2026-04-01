import Phaser from "phaser";
import { initUI } from "../services/ui";
import { showUI } from "../services/ui";

export default class TimerScene extends Phaser.Scene {
    init() {
        this.player = this.registry.get("player");
    }

    preload() {
        this.load.image('timer_bg', 'assets/backgrounds/timer_bg.png');
    }

    create() {
        showUI({
            settings: true,
            home: true,
            shop: false,
            edit: false,
            info: false,
            coins: true,
            excursion: false
        });

        // Background
        this.cameras.main.setBackgroundColor('#87ceeb');
        this.add.image(0, 0, 'timer_bg').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        // Timer Form
        const form = document.getElementById('timerForm');
        form.style.display = 'block'; // Ensure the form is visible

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const minutes = parseInt(document.getElementById('minutes').value) || 0;

            this.scene.start('ExcursionScene', { timer: minutes * 60 }); // Pass timer in seconds
        });

        // Remove Form
        this.events.on('shutdown',this.cleanup,this);
    }

    cleanup() {
        this.events.off('shutdown',this.cleanup,this);
        const form = document.getElementById('timerForm');
        if (form) {
            form.removeEventListener('submit', this.handleSubmit);
            form.style.display = 'none';
        }
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

        const coins = document.getElementById('coinCount');
        coins.textContent = this.player.coins;
    }

}