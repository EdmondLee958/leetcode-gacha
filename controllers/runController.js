import User from "../models/User.js";
import Run from "../models/Run.js";
import { baseCharacters } from "../data/baseCharacters.js";

export async function startRun(req, res) {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (!user.lineup || user.lineup.length !== 4) {
      return res.status(400).json({
        message: "You need a lineup of 4 characters"
      });
    }

    const existingRun = await Run.findOne({
      userId: user._id,
      status: "active"
    });

    if (existingRun) {
      return res.status(400).json({
        message: "You already have an active run",
        run: existingRun
      });
    }

    const party = user.lineup.map(id => {
      const owned = user.characters.id(id);

      if (!owned) {
        throw new Error("Lineup contains a character you no longer own");
      }

      const stats = baseCharacters[owned.name];

      return {
        characterId: owned._id.toString(),
        name: owned.name,
        rarity: owned.rarity,
        classType: owned.classType,
        hp: stats.hp,
        maxHp: stats.hp,
        atkMin: stats.atkMin,
        atkMax: stats.atkMax,
        spd: stats.spd,
        alive: true
      };
    });

    const run = await Run.create({
      userId: user._id,
      party
    });

    res.status(201).json({
      message: "Run started",
      run
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

function randomAtk(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function runBattle(req, res) {
  try {
    const run = await Run.findOne({
      userId: req.user.userId,
      status: "active"
    });

    if (!run) {
      return res.status(404).json({
        message: "No active run found"
      });
    }

    if (run.pendingReward) {
  return res.status(400).json({
    message: "Claim your reward before starting the next battle"
  });
}

    const heroes = run.party.map(hero => ({
      characterId: hero.characterId,
      name: hero.name,
      hp: hero.hp,
      maxHp: hero.maxHp,
      atkMin: hero.atkMin,
      atkMax: hero.atkMax,
      spd: hero.spd,
      side: "hero"
    }));

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

        const targets =
          unit.side === "hero"
            ? enemies.filter(e => e.hp > 0)
            : heroes.filter(h => h.hp > 0);

        if (targets.length === 0) break;

        const target = targets[0];
        const damage = randomAtk(unit.atkMin, unit.atkMax);

        target.hp = Math.max(0, target.hp - damage);

        log.push(
          `${unit.name} attacks ${target.name} for ${damage} damage. ${target.name} HP: ${target.hp}`
        );
      }

      round++;
    }

    const heroesWon = enemies.every(e => e.hp <= 0);
    const heroesLost = heroes.every(h => h.hp <= 0);

    run.party.forEach(savedHero => {
      const updatedHero = heroes.find(
        h => h.characterId === savedHero.characterId
      );

      savedHero.hp = updatedHero.hp;
      savedHero.alive = updatedHero.hp > 0;
    });

    if (heroesWon) {
      run.score += 1;
      run.encounterNumber += 1;
      run.pendingReward = true;
    }

    if (heroesLost) {
      run.status = "failed";
    }

    await run.save();

    res.json({
      result: heroesWon ? "win" : "loss",
      runStatus: run.status,
      encounterNumber: run.encounterNumber,
      score: run.score,
      party: run.party,
      enemies,
      log
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function claimReward(req, res) {
  try {
    const { characterId, rewardType } = req.body;

    const run = await Run.findOne({
      userId: req.user.userId,
      status: "active"
    });

    if (!run) {
      return res.status(404).json({
        message: "No active run found"
      });
    }

    if (!run.pendingReward) {
      return res.status(400).json({
        message: "No reward available"
      });
    }

    const character = run.party.find(
      c => c.characterId === characterId
    );

    if (!character) {
      return res.status(404).json({
        message: "Character not found in run"
      });
    }

    if (!character.alive) {
      return res.status(400).json({
        message: "Cannot reward a dead character"
      });
    }

    if (rewardType === "heal") {
      const healAmount = Math.ceil(character.maxHp * 0.25);
      character.hp = Math.min(character.maxHp, character.hp + healAmount);
    } else if (rewardType === "hp") {
      character.maxHp += 3;
      character.hp += 3;
    } else if (rewardType === "atk") {
      character.atkMin += 1;
      character.atkMax += 1;
    } else {
      return res.status(400).json({
        message: "Invalid reward type"
      });
    }

    run.pendingReward = false;

    await run.save();

    res.json({
      message: "Reward applied",
      rewardType,
      character,
      run
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}