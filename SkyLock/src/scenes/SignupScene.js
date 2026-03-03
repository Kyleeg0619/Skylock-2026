import Phaser from "phaser";
import AuthService from "../services/AuthService";
import PlayerDataManager from "../services/PlayerDataManager";

export default class SignupScene extends Phaser.Scene {
    constructor() {
        super('SignupScene');
    }

    preload() {
        this.load.image('bg', 'assets/backgrounds/island_bg.png');
        this.load.html('signupForm', 'assets/components/signupForm.html');
    }

    create() {
        this.cameras.main.setBackgroundColor('#87ceeb');
        this.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        // Create login form
        this.form = this.add.dom(this.sys.game.config.width / 2, this.sys.game.config.height / 2).createFromCache('signupForm');
        this.form.setOrigin(0, 0);

        // Add title to form
        const newChild = document.createElement("h1");
        newChild.style.textAlign = "center";
        newChild.style.color = "var(--off-white)";
        newChild.style.zIndex = "100";
        newChild.textContent = "Sign-Up";
        document.getElementById("loginForm").prepend(newChild);

        // Add logo to form
        const logo = document.createElement("img");
        logo.src = "assets/icons/logo.png";
        logo.classList.add("logo");
        document.getElementById("loginForm").prepend(logo);
        // Add Link to Login
        const loginLink = document.getElementsByClassName("formLink");
        loginLink[0].addEventListener("click", (e) => {
            e.preventDefault();

            this.scene.start("LoginScene");
        });
        

        // Handle form submission
        document.getElementById("loginForm").addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (password !== confirmPassword) {
                const errorText = document.createElement("p");
                errorText.style.color = "red";
                errorText.style.textAlign = "center";
                errorText.textContent = "Passwords do not match.";
                // Remove existing error messages
                const existingErrors = document.querySelectorAll("#loginForm > p:not(.formLink)");
                existingErrors.forEach(err => err.remove());
                document.getElementById("loginForm").appendChild(errorText);
                return;
            }

            try {
                const user = await AuthService.signup(email, password);

                // Create player data with the chosen username
                const player = await PlayerDataManager.load();

                this.registry.set('player', player);

                this.scene.start("TitleScene");
            } catch (error) {
                const errorText = document.createElement("p");
                errorText.style.color = "red";
                errorText.style.textAlign = "center";
                errorText.textContent = error.message || "Sign up failed. Please try again.";
                
                // Remove existing error messages
                const existingErrors = document.querySelectorAll("#loginForm > p:not(.formLink)");
                existingErrors.forEach(err => err.remove());
                
                document.getElementById("loginForm").appendChild(errorText);
            }
        });

        this.events.on('shutdown', this.cleanup, this);
    }

    cleanup() {
        // Clean up event listeners when the scene is shut down
        if (this.form) {
            this.form.removeAllListeners();
            this.form.destroy();
            this.form = null;
        }
    }
}
