import Phaser from "phaser";
import { showUI, updateCoinCount } from "../services/ui";
import { AngelRegistry } from "../data/AngelRegistry.js";

export default class ExcursionScene extends Phaser.Scene {
    init(data) {
        this.player = this.registry.get("player");
        this.timer = data.timer || 0; // Timer in seconds
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

        updateCoinCount(this.player.coins);

        this.music = this.sound.add('excursionMusic', {
            volume: this.player.settings.music / 100
        });
        this.music.setLoop(true);
        this.music.play();

        // Background
this.cameras.main.setBackgroundColor('#87ceeb');
        this.add.image(0, 0, 'excursion_bg').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        // Timer
        window.__excursionEnd = Date.now() + this.timer * 1000; // Store the end time in milliseconds
        this.coinsEarned = 0;
        this.excursionRateBonus = this.getExcursionRateBonus();

        const excursionUI = document.getElementById('excursionUI');
        excursionUI.style.display = 'flex';
        this.timerText = document.getElementById('excursionTimer');

        const cancelBtn = document.getElementById('cancelExcursionBtn');
        const cancelPopup = document.getElementById('cancelExcursionPopup');
        const confirmCancelBtn = document.getElementById('confirmCancelBtn');
        const cancelCloseBtn = document.getElementById('cancelCloseBtn');
        const potentialRewardText = document.getElementById('potentialReward');

        cancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cancelPopup.style.display = 'block';
            potentialRewardText.textContent = Math.floor(this.coinsEarned * 0.9); // Show potential reward after penalty
        });

        confirmCancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cancelPopup.style.display = 'none';
            this.handleCancel();
            this.scene.start('MainScene');
        });

        cancelCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cancelPopup.style.display = 'none';
        });

        this.events.on('shutdown', () => {
            this.sound.stopAll();
            excursionUI.style.display = 'none';
            cancelPopup.style.display = 'none';
            cancelBtn.removeEventListener('click', this.handleCancelClick);
            confirmCancelBtn.removeEventListener('click', this.handleConfirmCancel);
            cancelCloseBtn.removeEventListener('click', this.handleCancelClose);
        });



        // Social Media Extension Tracker
        window.addEventListener('message', (event) => {
            console.log('Received message:', event.data);
        });
    }

    getExcursionRateBonus() {
        const ownedAngels = this.player?.angels?.owned || [];
        return ownedAngels.reduce((total, angelId) => {
            const entry = AngelRegistry[angelId];
            return total + (entry?.buff?.excursionRate || 0);
        }, 0);
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

            if (this.music) {
                this.music.setVolume(this.player.settings.music / 100);
            }
        }

        if (window.__goHomeRequested) {
            window.__goHomeRequested = false;
            this.scene.start('MainScene');
        }

        const now = Date.now();
        const remaining = Math.max(0, window.__excursionEnd - now);

        const seconds = Math.floor(remaining / 1000);
        this.timerText.textContent = `${seconds}`;

        // 10 coins earned per minute
        this.coinsEarned = Math.floor(
            ((this.timer - seconds) / 60) * 10 * (this.penaltyMultiplier || 1) * (1 + this.excursionRateBonus)
        );
        this.coinsEarned = Math.max(0, this.coinsEarned); // Ensure coins don't go negative

        this.rewardText = document.getElementById('rewardAmount');
        this.rewardText.textContent = `${Math.floor(this.coinsEarned)}`;

        if (remaining <= 0) {
            this.handleComplete();

            console.log(`Excursion completed! Earned ${this.coinsEarned} coins.`);

            this.scene.start('MainScene');
        } else if (remaining > 0 && window.__skylockDistraction) {
            this.handleDistraction();

            window.__skylockDistraction = false; // Reset distraction flag each update  
        }
    }

    // Handle distractions (e.g., social media notifications)
    // Initialize penalty popup elements
    // Reduce reward
    async handleDistraction() {
        console.log('Distraction detected! Applying penalty.');

        // Apply penalty to current coins
        this.coinsEarned = Math.floor(this.coinsEarned * 0.7);

        // Apply penalty to future coins
        this.penaltyMultiplier = (this.penaltyMultiplier || 1) * 0.7;

        this.rewardText.textContent = `${this.coinsEarned}`;
    }


    async handleCancel() {
        this.coinsEarned = Math.max(0, this.coinsEarned - this.coinsEarned*0.1); // Reduce reward by 10%

        this.player.coins += Math.floor(this.coinsEarned); // Add remaining coins to player profile
        await this.player.save();
        this.registry.set('player', this.player);

        console.log('Excursion cancelled. Applying penalty.');
    }

    async handleComplete() {
        console.log(`Excursion completed! Earned ${this.coinsEarned} coins.`);

        this.player.coins += this.coinsEarned;
        await this.player.save();
        this.registry.set('player', this.player);
    }
    
}