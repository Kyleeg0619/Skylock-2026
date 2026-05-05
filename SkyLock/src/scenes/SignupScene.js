import Phaser from "phaser";
import AuthService from "../services/AuthService";
import PlayerDataManager from "../services/PlayerDataManager";
import { showUI } from "../services/ui";

export default class SignupScene extends Phaser.Scene {
    constructor() {
        super('SignupScene');
    }

    create() {
        showUI({
            settings: false,
            home: false,
            shop: false,
            edit: false,
            info: false,
            coins: false,
            excursion: false
        });
        
        this.cameras.main.setBackgroundColor('#87ceeb');
        this.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        // Create signup form
        const form = document.getElementById('signupForm');
        form.style.display = 'flex'; // Ensure the form is visible

        // Add title to form
        const newChild = document.createElement("h1");
        newChild.style.textAlign = "center";
        newChild.style.color = "var(--off-white)";
        newChild.style.zIndex = "100";
        newChild.textContent = "Sign-Up";
        document.getElementById("signupForm").prepend(newChild);

        // Add Link to Login
        const loginLink = document.getElementsByClassName("formLink");
        loginLink[0].addEventListener("click", (e) => {
            e.preventDefault();

            this.scene.start("LoginScene");
        });
        

        // Handle form submission
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("signup-email").value;
            const username = document.getElementById("signup-username").value;
            const password = document.getElementById("signup-password").value;
            const confirmPassword = document.getElementById("signup-confirmPassword").value;

            if (password !== confirmPassword) {
                const errorText = document.createElement("p");
                errorText.style.color = "red";
                errorText.style.textAlign = "center";
                errorText.textContent = "Passwords do not match.";
                // Remove existing error messages
                const existingErrors = document.querySelectorAll("#signupForm > p:not(.formLink)");
                existingErrors.forEach(err => err.remove());
                document.getElementById("signupForm").appendChild(errorText);
                return;
            }

            try {
                await AuthService.signup(email, password);

                // Create default player with Chosen username
                await PlayerDataManager.createDefault(username);

                // Load the final saved player data to ensure registry has all necessary info before starting TitleScene
                const player = await PlayerDataManager.load();

                // Store in registry for global access across scenes
                this.registry.set('player', player);

                // Continue to TitleScene after successful signup and player data setup
                this.scene.start("TitleScene");
            } catch (error) {
                const errorText = document.createElement("p");
                errorText.style.color = "red";
                errorText.style.textAlign = "center";
                errorText.textContent = error.message || "Sign up failed. Please try again.";
                
                // Remove existing error messages
                const existingErrors = document.querySelectorAll("#signupForm > p:not(.formLink)");
                existingErrors.forEach(err => err.remove());
                
                document.getElementById("signupForm").appendChild(errorText);
            }
        });

        this.events.on('shutdown', this.cleanup, this);
    }

    cleanup() {
        // Clean up event listeners when the scene is shut down
        this.events.off('shutdown', this.cleanup, this);
        const form = document.getElementById('signupForm');
        if (form) {
            form.removeEventListener("submit", this.handleSubmit);
            form.style.display = 'none'; // Hide the form when leaving the scene
        }
    }
}
