import { auth, googleProvider } from "../firebase/firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

export default class AuthService {
    static async signup(email, password) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        return userCred.user;
    }

    static async login(email, password) {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        return userCred.user;
    }

    static async loginWithGoogle() {
        const userCred = await signInWithPopup(auth, googleProvider);
        return userCred.user;
    }
}