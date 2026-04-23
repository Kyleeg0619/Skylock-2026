import Phaser from "phaser";
import AuthService from "../services/AuthService";
import PlayerDataManager from "../services/PlayerDataManager";

export default class GachaResultScene extends Phaser.Scene {
    init(data) {
        this.results = data.results;
        this.player = this.registry.get("player");
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        const cam = this.cameras.main;
        cam.fadeIn(300, 0, 0, 50);
        this.input.enabled = false;
    }
}