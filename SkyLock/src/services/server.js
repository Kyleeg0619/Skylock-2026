import { express } from 'express';
import { cors } from 'cors';
import { AngelRegistry } from '../data/AngelRegistry';

const express = require('express');
const app = express();
app.use(express.json());

const rarityOdds = {
  "common": 0.75,
  "rare": 0.20,
  "epic": 0.04,
  "legendary": 0.01
};

const angelsByRarity = {
    common: [],
    rare: [],
    epic: [],
    legendary: []
}

for (const [id, angel] of Object.entries(AngelRegistry)) {
    angelsByRarity[angel.rarity].push({ id, ...angel });
}

function rollRarity() {
    const roll = Math.random();
    let cumulative = 0;

    for (const [rarity, odds] of Object.entries(rarityOdds)) {
        cumulative += odds;
        if (r <= cumulative) return rarity;
    }
    return "common"; // Fallback
}

function rollAngel() {
    const pool = angelsByRarity[rollRarity()];
    return pool[Math.floor(Math.random() * pool.length)];
}

app.post('/rollGacha', (req, res) => {
    const rarity = rollRarity();
    const angel = rollAngel();
    res.json({ success: true, rarity, angel });
});

app.listen(3000, () => {
    // Gacha server started
});
