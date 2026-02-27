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
        this.angels = { owned: []};
        this.islands = { owned: ["starter_island"]};
        this.settings = { music: true, sfx: true };
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
}