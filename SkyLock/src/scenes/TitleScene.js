import Phaser from "phaser";

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    init() {
        // Check if player data exists in the registry
        console.log("Registry player:", this.registry.get("player"));
        this.player = this.registry.get("player");
        console.log(this.player.profile.username);
    }

    preload() {
        this.load.image('title-bg', 'assets/backgrounds/Title_bg.PNG');
    }

    create() {
        this.add.image(0, 0, 'title-bg').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        // --- play btn ---
        const playBtn = document.createElement('button');
        playBtn.className = 'playBtn';
        playBtn.innerHTML = '<span class="btn-label"> PLAY </span>';

        playBtn.addEventListener('click', () => {
            this.scene.start('MainScene');
            playBtn.remove();
        });

        // --- info page//popop ---
        const infoPage = document.createElement('div');
        infoPage.className = 'infoPopup';
        infoPage.innerHTML = `
                <h2>Socials</h2>
                <hr>
                <p><a href="https://www.instagram.com/skylockgame/" target="_blank">Kylee Grasela 
                <i class="bi bi-linkedin"></i> </a><br>Graphic Designer & Programmer</p>

                <p><a href="https://www.linkedin.com/in/andrew-lee-9b1a25209/" target="_blank">Charles Bundy <i class="bi bi-linkedin"></i></a><br>Programmer & Animator</p>

                <p><a href="https://www.linkedin.com/in/andrew-lee-9b1a25209/" target="_blank">Brittany Fetters <i class="bi bi-linkedin"></i></a><br>Programmer</p>
        `;
        infoPage.style.display = 'none'; // Initially hidden
        document.body.appendChild(infoPage);

        // --- settings page//popup ---
        const settingsPage = document.createElement('div');
        settingsPage.className = 'settingsPopup';
        settingsPage.innerHTML = `
        <h2>Settings</h2>
                <hr>
                <form action="">
                <br>
                    <h3>Volume</h3>
                    <hr>
                    <p> Music: </p>
                    <input type="range" id="musicVolume" min="0" max="100" value="${this.player.settings.music}">
                    <p> SFX: </p>
                    <input type="range" id="sfxVolume" min="0" max="100" value="${this.player.settings.sfx}">
                    <br><br>
                    <h3>Gacha</h3>
                    <hr>
                    <input type="checkbox" id="skipCutscene" ${this.player.settings.skipGacha ? "checked" : ""}> Skip Cutscene</input>
                    <br><br>
                    <h3>Player Info</h3>
                    <hr>
                    <p> Username: <input type="text" value="${this.player.profile.username}"></input> </p>

                    <button type="submit"> Save </button>
                </form>
                `;
        settingsPage.style.display = 'none'; // Initially hidden
        document.body.appendChild(settingsPage);

        // --- buttons ---
        const infoBtn = document.createElement('button');
        infoBtn.className = 'topBtns infoBtn';
        infoBtn.innerHTML = '<i class="bi bi-info-circle"></i>';

        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'topBtns settingsBtn';
        settingsBtn.innerHTML = '<i class="bi bi-gear"></i>';

        const container = document.getElementById('game-container');
        container.appendChild(infoBtn);
        container.appendChild(settingsBtn);
        container.appendChild(playBtn);
        container.appendChild(infoPage);
        container.appendChild(settingsPage);

        // ---  event  listeners ---
        infoBtn.addEventListener('click', () => {
            infoPage.style.display = infoPage.style.display === 'none' ? 'block' : 'none';
        });

        settingsBtn.addEventListener('click', () => {
            settingsPage.style.display = settingsPage.style.display === 'none' ? 'block' : 'none';
        });
    }

}