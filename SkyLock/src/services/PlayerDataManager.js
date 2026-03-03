import {db, auth} from "../firebase/firebase.js";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

export default class PlayerDataManager {
    static ref() {
        return doc(db, "players", auth.currentUser.uid);
    }

    static async load() {
        const snap = await getDoc(this.ref());
        return snap.exists() ? snap.data() : null;
    }

    static async createDefault() {
        const user = auth.currentUser;
        const player = new Player(user.uid, user.email, user.username);
        await setDoc(this.ref(), player.toFirestore());
    }
     
    static async save(playerData) {
        const ref = doc(db,"players",auth.currentUser.uid);
        await setDoc(ref, playerData, { merge: true });
    }
}