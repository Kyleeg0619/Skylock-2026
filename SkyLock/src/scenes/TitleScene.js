import Phaser from "phaser";

export class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    preload() {
        this.load.image('bg', 'assets/Island_bg.PNG');
    }

    create() {
        this.add.image(0, 0, 'bg').setOrigin(0, 0);

        // --- play brn ---
        const playBtn = document.createElement('button');
        playBtn.className = 'playBtn';
        playBtn.innerHTML = '<span class="btn-label"> PLAY </span>';

        playBtn.addEventListener('click', () => {
            this.scene.start('MainScene');
            playBtn.remove();
        });

        // --- info page//popop ---
        this.infoPage = this.add.dom(300, 350).createFromHTML(`
            <div class="infoPopup">
                <h2>Behind The Game</h2>
                <p>Socials</p>

                <h2>Why we made SkyLock</h2>
                <p>uhhuh</p>

                <button id="closeInfoBtn">Close</button>
            </div>
        `);
        this.infoPage.setVisible(false);

        // --- settings page/popup --- 
        this.settingsPage = this.add.dom(300, 350).createFromHTML(`
            <div class="settingsPopup">
                <h2>Settings</h2>
                <hr>

                <h3>Volume</h3>
                <hr>
                <p> Master Volume: </p>
                <input type="range" id="masterVolume" min="0" max="100">

                <p> Music: </p>
                <input type="range" id="musicVolume" min="0" max="100">

                <p> SFX: </p>
                <input type="range" id="sfxVolume" min="0" max="100">

                <h3>Gacha</h3>
                <hr>
                <p> Skip Cutcene </p>

                <h3>Player Info</h3>
                <hr>
                <p> Username: Player </p>

                <button id="closeStgBtn">Close</button>
            </div>
        `);
        this.settingsPage.setVisible(false);

        // --- buttons ---
        const infoBtn = document.createElement('button');
        infoBtn.className = 'topBtns infoBtn';
        infoBtn.innerHTML = '<i class="bi bi-info-circle"></i>';
        document.body.appendChild(infoBtn);

        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'topBtns settingsBtn';
        settingsBtn.innerHTML = '<i class="bi bi-gear"></i>';
        document.body.appendChild(settingsBtn);

        const container = document.getElementById('gameContainer');
        container.appendChild(infoBtn);
        container.appendChild(settingsBtn);
        container.appendChild(playBtn);

        // ---  event  lsteners ---
        infoBtn.addEventListener('click', () => {
            this.infoPage.setVisible(true);
        });

        settingsBtn.addEventListener('click', () => {
            this.settingsPage.setVisible(true);
        });

        const closeInfoBtn = this.infoPage.node.querySelector('#closeInfoBtn');
        closeInfoBtn.addEventListener('click', () => {
            this.infoPage.setVisible(false);
        });

        const closeStgBtn = this.settingsPage.node.querySelector('#closeStgBtn');
        closeStgBtn.addEventListener('click', () => {
            this.settingsPage.setVisible(false);
        });
    }

    update() {}
}