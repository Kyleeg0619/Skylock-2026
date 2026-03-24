import { db } from "../firebase/firebase.js";
import { doc, setDoc } from "firebase/firestore";

export default class Player {
    constructor(uid, email, username) {
        this.uid = uid;
        this.profile = {
            email: email,
            username: username,
            createdAt: Date.now(),
            lastLogin: Date.now(),
        };
        this.coins = 0;
        this.angels = { owned: ["dog-1"]};
        this.islands = { owned: ["starter-island"]};
        this.placedIslands = [];
            // Each entry:
            // {
            //   islandId: "starter_island",
            //   position: { x: 0, y: 0 },
            //   angels: ["dog-1", null]
            // }
        this.settings = { music: 100, sfx: 100, skipGacha: false};
    }

    toFirestore() {
        return {
            profile: this.profile,
            coins: this.coins,
            angels: this.angels,
            islands: this.islands,
            settings: this.settings
        };
    }

    async save() {
        const ref = doc(db,"players",this.uid);
        await setDoc(ref, this.toFirestore(), { merge: true });
    }

    static fromFirestore(data, uid) {
        const player = new Player(uid, data.profile.email, data.profile.username);
        player.profile = data.profile;
        player.coins = data.coins;
        player.angels = data.angels;
        player.islands = data.islands;
        player.settings = data.settings;
        return player;
    }
}