import Phaser from "phaser";
import AuthService from "../services/AuthService";
import PlayerDataManager from "../services/PlayerDataManager";

export default class LoginScene extends Phaser.Scene {
    constructor() {
        super('LoginScene');
    }

    init() {
        // Check if player data exists in the registry
        if (this.registry.get('player')) {
            this.scene.start('TitleScene');
        }
    }

    preload() {
        // Load any assets needed for the login scene (e.g., background, buttons)
        this.load.image('bg', 'assets/backgrounds/island_bg.png');
        this.load.html('loginForm', 'assets/components/loginForm.html');
    }

    create() {        
        // Background
        this.cameras.main.setBackgroundColor('#87ceeb');
        this.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        // Create login form
        const form = document.getElementById('loginForm');
        form.style.display = 'flex'; // Ensure the form is visible

        // Add title to form
        const newChild = document.createElement("h1");
        newChild.style.textAlign = "center";
        newChild.style.color = "var(--off-white)";
        newChild.style.zIndex = "100";
        newChild.textContent = "Login";
        document.getElementById("loginForm").prepend(newChild);

        // Add logo to form
        const logo = document.createElement("img");
        logo.src = "assets/icons/logo.png";
        logo.classList.add("logo");
        document.getElementById("loginForm").prepend(logo);
        // Add Link to Signup
        const signupLink = document.getElementsByClassName("formLink");
        signupLink[0].addEventListener("click", (e) => {
            e.preventDefault();
            
            this.scene.start("SignupScene");
        });
        

        // Handle form submission
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            try {
                const user = await AuthService.login(email, password);

                let player = await PlayerDataManager.load();

                this.registry.set('player', player);

                this.scene.start("TitleScene");
            } catch (error) {
                const errorText = document.createElement("p");
                errorText.setAttribute("id", "errorText");
                errorText.style.color = "red";
                errorText.style.textAlign = "center";
                errorText.textContent = "Invalid email or password";
                
                // Remove existing error messages
                const existingErrors = document.querySelectorAll("#loginForm > #errorText");
                existingErrors.forEach(err => err.remove());
                
                document.getElementById("loginForm").appendChild(errorText);
            }
        });

        this.events.on('shutdown', this.cleanup, this);
    }

    cleanup() {
        // Clean up event listeners when the scene is shut down
        this.events.off('shutdown', this.cleanup, this);
        const form = document.getElementById('loginForm');
        if (form) {
            form.removeEventListener("submit", this.handleSubmit);
            form.style.display = 'none'; // Hide the form when leaving the scene
        }
    }
}