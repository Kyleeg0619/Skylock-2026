// ui.js
import Phaser from "phaser";

export function initUI(player, registry, scene) {
    const infoBtn = document.getElementById('infoBtn');
    const infoPage = document.getElementById('infoPopup');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPage = document.getElementById('settingsPopup');
    const settingsForm = document.getElementById('settingsForm');

    const homeBtn = document.getElementById('homeBtn');
    const shopBtn = document.getElementById('shopBtn');
    const editBtn = document.getElementById('editBtn');

    homeBtn.addEventListener('click', () => {
        this.scene.start
    });

    // toggle listeners
    infoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        infoPage.style.display =
            infoPage.style.display === 'none' ? 'block' : 'none';
    });

    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPage.style.display =
            settingsPage.style.display === 'none' ? 'block' : 'none';

        if (settingsPage.style.display === 'block') {
            document.getElementById('musicVolume').value = player.settings.music;
            document.getElementById('sfxVolume').value = player.settings.sfx;
            document.getElementById('skipCutscene').checked = player.settings.skipGacha;
            document.getElementById('usernameInput').value = player.profile.username;
        }
    });

    // form submit
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        player.settings.music = parseInt(document.getElementById('musicVolume').value);
        player.settings.sfx = parseInt(document.getElementById('sfxVolume').value);
        player.settings.skipGacha = document.getElementById('skipCutscene').checked;
        player.profile.username = document.getElementById('usernameInput').value;

        await player.save();
        registry.set('player', player);

        settingsPage.style.display = 'none';
    });

    // prevent popup clicks from closing
    infoPage.addEventListener('click', (e) => e.stopPropagation());
    settingsPage.addEventListener('click', (e) => e.stopPropagation());

    // click outside to close
    document.addEventListener('click', () => {
        infoPage.style.display = 'none';
        settingsPage.style.display = 'none';
    });
}