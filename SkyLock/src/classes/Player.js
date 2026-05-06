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
        this.level = 0;
        this.coins = 0;
        this.angelCoins = 0;
        this.angels = { owned: ["dog-1"]};
        this.islands = { owned: ["starter-island"]};
        this.settings = { music: 100, sfx: 100, skipGacha: false};
    }

    toFirestore() {
        return {
            profile: this.profile,
            coins: this.coins,
            angelCoins: this.angelCoins,
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
        player.angelCoins = data.angelCoins;
        player.angels = data.angels;
        player.islands = data.islands;
        player.settings = data.settings;
        return player;
    }
}

export function verifyPurchase(player,cost) {
    if (player.coins >= cost) {
        player.coins -= cost;
        return true;
    } else {
        return false;
    }
}

export function verifyLegendaryPurchase(player,cost) {
    if (player.angelCoins >= cost) {
        player.angelCoins -= cost;
        return true;
    } else {
        return false;
    }
}