import Phaser from "phaser";
import { initUI } from "../services/ui";
import { showUI } from "../services/ui";

export default class ExcursionScene extends Phaser.Scene {
    init(data) {
        this.player = this.registry.get("player");
        this.timer = data.timer || 0; // Timer in seconds
    }  

    preload() {
        this.load.image('excursion_bg', 'assets/backgrounds/excursion_bg.png');
    }

    create() {
        showUI({
            settings: true,
            home: false,
            shop: false,
            edit: false,
            info: false,
            coins: true,
            excursion: false
        });

        // Background
this.cameras.main.setBackgroundColor('#87ceeb');
        this.add.image(0, 0, 'excursion_bg').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        // Timer
        window.__excursionEnd = Date.now() + this.timer * 1000; // Store the end time in milliseconds

        const excursionUI = document.getElementById('excursionUI');
        excursionUI.style.display = 'flex';
        this.timerText = document.getElementById('excursionTimer');

        const cancelBtn = document.getElementById('cancelExcursionBtn');
                const cancelPopup = document.getElementById('cancelExcursionPopup');
        const confirmCancelBtn = document.getElementById('confirmCancelBtn');
        const cancelCloseBtn = document.getElementById('cancelCloseBtn');

        cancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cancelPopup.style.display = 'block';
        });

        confirmCancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cancelPopup.style.display = 'none';
            this.scene.start('TimerScene');
        });

        cancelCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cancelPopup.style.display = 'none';
        });

        this.events.on('shutdown', () => {
            excursionUI.style.display = 'none';
            cancelBtn.removeEventListener('click', this.handleCancelClick);
            confirmCancelBtn.removeEventListener('click', this.handleConfirmCancel);
            cancelCloseBtn.removeEventListener('click', this.handleCancelClose);
        });



        // Social Media Extension Tracker
        window.addEventListener('message', (event) => {
            // if (event.data?.type === 'SKYLOCK_OPEN_TABS') {
            //     const urls = event.data.urls;
            //     console.log('Received open tabs request:', urls);
            // }
            console.log('Received message:', event.data);
        });
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

        const now = Date.now();
        const remaining = Math.max(0, window.__excursionEnd - now);

        const seconds = Math.floor(remaining / 1000);
        this.timerText.textContent = `${seconds}`;

        if (remaining <= 0) {
            this.scene.start('TimerScene');
        } else if (remaining > 0 && window.__skylockDistraction) {
            window.__skylockDistraction = false; // Reset distraction flag each update
            this.handleDistraction();
        }
    }

    handleDistraction() {
        console.log('Distraction detected! Applying penalty.');
    }
}