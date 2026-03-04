import {db, auth} from "../firebase/firebase.js";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import Player from "../classes/Player.js";

export default class PlayerDataManager {
    static ref() {
        return doc(db, "players", auth.currentUser.uid);
    }

    static async load() {
        const snap = await getDoc(this.ref());
        return snap.exists() ? snap.data() : null;
    }

    static async createDefault(username) {
        const user = auth.currentUser;
        const player = new Player(user.uid, user.email, username);
        await setDoc(this.ref(), player.toFirestore());
    }
     
    static async save(playerData) {
        const ref = doc(db,"players",auth.currentUser.uid);
        await setDoc(ref, playerData, { merge: true });
    }
}