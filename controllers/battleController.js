import User from "../models/User.js";
import { baseCharacters } from "../data/baseCharacters.js";

function randomAtk(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function startBattle(req, res) {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.lineup || user.lineup.length !== 4) {
      return res.status(400).json({ message: "You need a lineup of 4 characters" });
    }

    const heroes = user.lineup.map(id => {
      const owned = user.characters.id(id);
      const stats = baseCharacters[owned.name];

      return {
        id: owned._id.toString(),
        name: owned.name,
        hp: stats.hp,
        maxHp: stats.hp,
        atkMin: stats.atkMin,
        atkMax: stats.atkMax,
        spd: stats.spd,
        side: "hero"
      };
    });

    const enemies = [
      {
        name: "Goblin",
        hp: randomAtk(32, 36),
        maxHp: 36,
        atkMin: 4,
        atkMax: 6,
        spd: 5,
        side: "enemy"
      }
    ];

    const log = [];
    let round = 1;

    while (
      heroes.some(h => h.hp > 0) &&
      enemies.some(e => e.hp > 0) &&
      round <= 20
    ) {
      log.push(`Round ${round}`);

      const turnOrder = [...heroes, ...enemies]
        .filter(unit => unit.hp > 0)
        .sort((a, b) => b.spd - a.spd);

      for (const unit of turnOrder) {
        if (unit.hp <= 0) continue;

        const targets = unit.side === "hero"
          ? enemies.filter(e => e.hp > 0)
          : heroes.filter(h => h.hp > 0);

        if (targets.length === 0) break;

        const target = targets[0];
        const damage = randomAtk(unit.atkMin, unit.atkMax);

        target.hp = Math.max(0, target.hp - damage);

        log.push(`${unit.name} attacks ${target.name} for ${damage} damage. ${target.name} HP: ${target.hp}`);
      }

      round++;
    }

    const result = enemies.every(e => e.hp <= 0) ? "win" : "loss";

    res.json({
      result,
      heroes,
      enemies,
      log
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}