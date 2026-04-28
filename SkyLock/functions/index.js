import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { AngelRegistry } from "./AngelRegistry.js";

setGlobalOptions({ maxInstances: 10 });

const rarityOdds = {
  common: 0.75,
  rare: 0.20,
  epic: 0.04,
  legendary: 0.01
};

const angelsByRarity = {
  common: [],
  rare: [],
  epic: [],
  legendary: []
};

for (const [id, angel] of Object.entries(AngelRegistry)) {
  angelsByRarity[angel.rarity].push({ id, ...angel });
}

function rollRarity() {
  const r = Math.random();
  let sum = 0;

  for (const [rarity, odds] of Object.entries(rarityOdds)) {
    sum += odds;
    if (r <= sum) return rarity;
  }
  return "common";
}

function pickAngel(rarity) {
  const pool = angelsByRarity[rarity];
  return pool[Math.floor(Math.random() * pool.length)];
}

export const rollGacha = onRequest((req, res) => {
  // CORS HEADERS — MUST BE FIRST
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // Actual function logic
  const rarity = rollRarity();
  const angel = pickAngel(rarity);

  res.json({
    success: true,
    rarity,
    angel
  });
});

export const rollLegendary = onRequest((req, res) => {
  // CORS HEADERS — MUST BE FIRST
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // Actual function logic
  const angel = pickAngel("legendary");
  
  res.json({
    success: true,
    rarity: "legendary",
    angel
  });
});
