import { db } from "../firebase/firebase.js";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default class Player {
    static defaultLayout() {
        return {
            islandLayout: Array(8).fill('starter-island'),
            angelLayout: [
                ['dog-1', null],
                [null, null],
                [null, null],
                [null, null],
                [null, null],
                [null, null],
                [null, null],
                [null, null]
            ]
        };
    }

    static normalizeLayout(layout) {
        const defaultLayout = Player.defaultLayout();

        if (!layout || typeof layout !== 'object') {
            return defaultLayout;
        }

        const islandLayout = Array.isArray(layout.islandLayout) ? [...layout.islandLayout] : [];
        const angelLayout = Array.isArray(layout.angelLayout) ? [...layout.angelLayout] : [];

        while (islandLayout.length < 8) {
            islandLayout.push('starter-island');
        }
        while (angelLayout.length < 8) {
            angelLayout.push([null, null]);
        }

        return {
            islandLayout: islandLayout.slice(0, 8),
            angelLayout: angelLayout.slice(0, 8)
        };
    }

    static serializeLayout(layout) {
        const normalized = Player.normalizeLayout(layout);
        return {
            islandLayout: normalized.islandLayout,
            angelLayout: normalized.angelLayout.map(([angel1, angel2]) => ({
                angel1: angel1 ?? null,
                angel2: angel2 ?? null
            }))
        };
    }

    static deserializeLayout(dataLayout) {
        if (!dataLayout || typeof dataLayout !== 'object') {
            return Player.defaultLayout();
        }

        const islandLayout = Array.isArray(dataLayout.islandLayout) ? [...dataLayout.islandLayout] : [];
        const angelLayout = Array.isArray(dataLayout.angelLayout)
            ? dataLayout.angelLayout.map(slot => {
                if (Array.isArray(slot)) {
                    return [slot[0] ?? null, slot[1] ?? null];
                }
                if (slot && typeof slot === 'object') {
                    return [slot.angel1 ?? null, slot.angel2 ?? null];
                }
                return [null, null];
            })
            : [];

        return Player.normalizeLayout({ islandLayout, angelLayout });
    }

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

        this.layout = Player.defaultLayout();
        this.hasLayoutInDb = false;
    }

    toFirestore() {
        return {
            profile: this.profile,
            coins: typeof this.coins === 'number' ? this.coins : 0,
            angelCoins: typeof this.angelCoins === 'number' ? this.angelCoins : 0,
            angels: this.angels,
            islands: this.islands,
            settings: this.settings,
            layout: Player.serializeLayout(this.layout)
        };
    }

    async save() {
        console.log('Saving player data to DB:', this.toFirestore());
        const ref = doc(db,"players",this.uid);
        await setDoc(ref, this.toFirestore(), { merge: true });
        console.log('Player data saved successfully');
    }

    async loadCoins() {
        const ref = doc(db, "players", this.uid);
        const docSnap = await getDoc(ref);
        if (docSnap.exists()) {
            const data = docSnap.data();
            this.coins = data.coins || 0;
            this.angelCoins = data.angelCoins || 0;
        }
    }

    static fromFirestore(data, uid) {
        const player = new Player(uid, data.profile.email, data.profile.username);
        player.profile = data.profile || player.profile;
        player.coins = typeof data.coins === 'number' ? data.coins : player.coins;
        player.angelCoins = typeof data.angelCoins === 'number' ? data.angelCoins : player.angelCoins;
        player.angels = data.angels || player.angels;
        player.islands = data.islands || player.islands;
        player.settings = data.settings || player.settings;
        player.layout = Player.deserializeLayout(data.layout);
        player.hasLayoutInDb = !!data.layout;
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