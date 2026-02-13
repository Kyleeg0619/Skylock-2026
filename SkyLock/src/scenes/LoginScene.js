import Phaser from "phaser";

async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User logged in:", user.uid);
        return user;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}