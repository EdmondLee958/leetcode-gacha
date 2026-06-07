import User from "../models/User.js";
import Run from "../models/Run.js";
import { baseCharacters } from "../data/baseCharacters.js";
import { enemies as enemyData } from "../data/enemies.js";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createGoblin(position, scalingLevel = 0) {
  const base = enemyData.Goblin;
  const scale = 1 + scalingLevel * 0.1;

  const hp = Math.round(randomInt(base.hpMin, base.hpMax) * scale);

  return {
    name: base.name,
    side: "enemy",
    position,
    hp,
    maxHp: hp,
    atkMin: Math.round(base.atkMin * scale),
    atkMax: Math.round(base.atkMax * scale),
    spd: Math.round(base.spd * scale),
    critRate: base.critRate,
    critDamage: base.critDamage,
    alive: true,
    buffs: []
  };
}

function createBoss(scalingLevel = 0) {
  const base = enemyData.FirstBoss;
  const scale = 1 + scalingLevel * 0.1;

  return {
    name: base.name,
    side: "enemy",
    position: 1,
    hp: Math.round(base.hp * scale),
    maxHp: Math.round(base.hp * scale),
    atkMin: Math.round(base.atkMin * scale),
    atkMax: Math.round(base.atkMax * scale),
    spd: Math.round(base.spd * scale),
    critRate: base.critRate,
    critDamage: base.critDamage,
    alive: true,
    buffs: []
  };
}

function createEnemiesForEncounter(encounterNumber, scalingLevel) {
  const isBossFight = encounterNumber % 5 === 0;

  if (isBossFight) {
    return [createBoss(scalingLevel)];
  }

  return [
    createGoblin(1, scalingLevel),
    createGoblin(2, scalingLevel),
    createGoblin(3, scalingLevel),
    createGoblin(4, scalingLevel)
  ];
}

function buildTurnOrder(party, enemies) {
  return [...party, ...enemies]
    .filter(unit => unit.alive && unit.hp > 0)
    .sort((a, b) => b.spd - a.spd)
    .map(unit => unit._id.toString());
}

function findUnitById(run, unitId) {
  return [...run.party, ...run.enemies].find(
    unit => unit._id.toString() === unitId
  );
}

function getCurrentUnit(run) {
  const currentUnitId = run.turnOrder[run.currentTurnIndex];
  return findUnitById(run, currentUnitId);
}

function getDamageModifier(unit) {
  const damageBuffs = unit.buffs.filter(
    buff => buff.stat === "damageDone"
  );

  return damageBuffs.reduce(
    (total, buff) => total + buff.value,
    0
  );
}

function getDamageTakenModifier(unit) {
  const damageTakenBuffs = unit.buffs.filter(
    buff => buff.stat === "damageTaken"
  );

  return damageTakenBuffs.reduce(
    (total, buff) => total + buff.value,
    0
  );
}

function rollDamage(unit, multiplier = 1) {
  const baseDamage = randomInt(unit.atkMin, unit.atkMax);

  const didCrit = Math.random() * 100 < unit.critRate;

  let damage = baseDamage * multiplier;

  if (didCrit) {
    damage *= 1 + unit.critDamage / 100;
  }

  damage *= 1 + getDamageModifier(unit) / 100;

  return {
    damage: Math.max(1, Math.round(damage)),
    didCrit
  };
}

function applyDamage(target, rawDamage) {
  let damage = rawDamage;

  damage *= 1 + getDamageTakenModifier(target) / 100;

  damage = Math.max(1, Math.round(damage));

  target.hp = Math.max(0, target.hp - damage);

  if (target.hp <= 0) {
    target.alive = false;
  }

  return damage;
}

function tickBuffs(unit) {
  unit.buffs.forEach(buff => {
    buff.duration -= 1;
  });

  unit.buffs = unit.buffs.filter(buff => buff.duration > 0);
}

function advanceTurn(run) {
  run.currentTurnIndex += 1;

  if (run.currentTurnIndex >= run.turnOrder.length) {
    run.currentTurnIndex = 0;
    run.turnOrder = buildTurnOrder(run.party, run.enemies);
    run.battleLog.push("New round begins.");
  }

  let safety = 0;

  while (safety < 20) {
    const unit = getCurrentUnit(run);

    if (unit && unit.alive && unit.hp > 0) {
      break;
    }

    run.currentTurnIndex += 1;

    if (run.currentTurnIndex >= run.turnOrder.length) {
      run.currentTurnIndex = 0;
      run.turnOrder = buildTurnOrder(run.party, run.enemies);
      run.battleLog.push("New round begins.");
    }

    safety++;
  }
}

function checkBattleEnd(run) {
  const alliesAlive = run.party.some(unit => unit.alive && unit.hp > 0);
  const enemiesAlive = run.enemies.some(unit => unit.alive && unit.hp > 0);

  if (!alliesAlive) {
    run.status = "failed";
    run.phase = "ended";
    run.battleLog.push("Your party was defeated.");
    return "loss";
  }

  if (!enemiesAlive) {
    run.score += 1;
    run.encounterNumber += 1;
    run.pendingReward = true;
    run.phase = "reward";
    run.rewardClaims = [];

    if ((run.encounterNumber - 1) % 5 === 0) {
      run.enemyScalingLevel += 1;
      run.battleLog.push("Boss defeated. Future enemies grow stronger.");
    }

    run.battleLog.push("Enemies defeated. Choose rewards.");
    return "win";
  }

  return null;
}

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

    const party = user.lineup.map((id, index) => {
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
        side: "ally",
        position: index + 1,
        hp: stats.hp,
        maxHp: stats.hp,
        atkMin: stats.atkMin,
        atkMax: stats.atkMax,
        spd: stats.spd,
        critRate: stats.critRate,
        critDamage: stats.critDamage,
        alive: true,
        buffs: []
      };
    });

    const enemies = createEnemiesForEncounter(1, 0);

    const run = await Run.create({
      userId: user._id,
      party,
      enemies,
      phase: "battle",
      battleLog: ["Run started.", "Encounter 1 begins."]
    });

    run.turnOrder = buildTurnOrder(run.party, run.enemies);
    run.currentTurnIndex = 0;

    await run.save();

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

export async function getCurrentRun(req, res) {
  try {
    const run = await Run.findOne({
      userId: req.user.userId
    }).sort({ createdAt: -1 });

    if (!run) {
      return res.status(404).json({
        message: "No run found"
      });
    }

    res.json({ run });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function endRun(req, res) {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const run = await Run.findOne({
      userId: req.user.userId,
      status: { $in: ["active", "failed"] }
    });

    if (!run) {
      return res.status(404).json({
        message: "No run found to end"
      });
    }

    const deadCharacterIds = run.party
      .map(character => character.characterId);

    user.characters = user.characters.filter(character =>
      !deadCharacterIds.includes(character._id.toString())
    );

    user.lineup = user.lineup.filter(characterId =>
      !deadCharacterIds.includes(characterId)
    );

    await user.save();

    await Run.deleteOne({ _id: run._id });

    res.json({
      message: "Run ended",
      score: run.score,
      deadCharacterIds,
      remainingCharacters: user.characters,
      lineup: user.lineup
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

    if (run.rewardClaims.includes(characterId)) {
  return res.status(400).json({
    message: "This character already claimed a reward"
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
    } else if (rewardType === "spd") {
      character.spd += 1;
    } else if (rewardType === "critRate") {
      character.critRate += 1;
    } else if (rewardType === "critDamage") {
      character.critDamage += 2;
    } else {
      return res.status(400).json({
        message: "Invalid reward type"
      });
    }

run.rewardClaims.push(characterId);

const livingCharacters = run.party.filter(character => character.alive);

if (run.rewardClaims.length >= livingCharacters.length) {
  run.pendingReward = false;
  run.phase = "battle";
  run.rewardClaims = [];

  const enemies = createEnemiesForEncounter(
    run.encounterNumber,
    run.enemyScalingLevel
  );

  run.enemies = enemies;
  run.battleLog.push(`Encounter ${run.encounterNumber} begins.`);

  await run.save();

  run.turnOrder = buildTurnOrder(run.party, run.enemies);
  run.currentTurnIndex = 0;
}

    await run.save();

    run.turnOrder = buildTurnOrder(run.party, run.enemies);
    run.currentTurnIndex = 0;

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

export async function runAction(req, res) {
  try {
    const { skillNumber, targetSide, targetPosition } = req.body;

    const run = await Run.findOne({
      userId: req.user.userId,
      status: "active"
    });

    if (!run) {
      return res.status(404).json({
        message: "No active run found"
      });
    }

    if (run.phase !== "battle") {
      return res.status(400).json({
        message: "Run is not currently in battle phase",
        phase: run.phase
      });
    }

    const actingUnit = getCurrentUnit(run);

    if (!actingUnit) {
      return res.status(400).json({
        message: "No current unit found"
      });
    }

    const characterData =
      actingUnit.side === "ally"
        ? baseCharacters[actingUnit.name]
        : enemyData.Goblin.name === actingUnit.name
          ? enemyData.Goblin
          : enemyData.FirstBoss;

    const skill = characterData.skills.find(
      skill => skill.number === Number(skillNumber)
    );

    if (!skill) {
      return res.status(400).json({
        message: "Invalid skill"
      });
    }

    if (actingUnit.side === "enemy") {
      return res.status(400).json({
        message: "It is currently an enemy turn. Use /runs/enemy-action."
      });
    }

    let logLine = "";

    if (skill.type === "damage") {
      const target = run.enemies.find(
        enemy =>
          enemy.position === Number(targetPosition) &&
          enemy.alive
      );

      if (!target) {
        return res.status(400).json({
          message: "Invalid enemy target"
        });
      }

      const roll = rollDamage(actingUnit, skill.multiplier);
      const finalDamage = applyDamage(target, roll.damage);

      logLine =
        `${actingUnit.name} used ${skill.name} on ${target.name} for ${finalDamage} damage`;

      if (roll.didCrit) {
        logLine += " (CRIT)";
      }

      logLine += ".";
    }

    else if (skill.type === "heal") {
      const target = run.party.find(
        ally =>
          ally.position === Number(targetPosition) &&
          ally.alive
      );

      if (!target) {
        return res.status(400).json({
          message: "Invalid ally target"
        });
      }

      const healAmount = randomInt(actingUnit.atkMin, actingUnit.atkMax);
      target.hp = Math.min(target.maxHp, target.hp + healAmount);

      logLine =
        `${actingUnit.name} used ${skill.name} and healed ${target.name} for ${healAmount}.`;
    }

    else if (skill.type === "buff") {
      let target;

      if (skill.target === "self") {
        target = actingUnit;
      } else if (skill.target === "ally") {
        target = run.party.find(
          ally =>
            ally.position === Number(targetPosition) &&
            ally.alive
        );
      }

      if (!target) {
        return res.status(400).json({
          message: "Invalid buff target"
        });
      }

      target.buffs.push({
        stat: skill.buff.stat,
        value: skill.buff.value,
        duration: skill.buff.duration
      });

      logLine =
        `${actingUnit.name} used ${skill.name} on ${target.name}.`;
    }

    else if (skill.type === "damageAndSelfHeal") {
      const target = run.enemies.find(
        enemy =>
          enemy.position === Number(targetPosition) &&
          enemy.alive
      );

      if (!target) {
        return res.status(400).json({
          message: "Invalid enemy target"
        });
      }

      const roll = rollDamage(actingUnit, skill.damageMultiplier);
      const finalDamage = applyDamage(target, roll.damage);

      const healAmount = Math.round(
        randomInt(actingUnit.atkMin, actingUnit.atkMax) *
        skill.healMultiplier
      );

      actingUnit.hp = Math.min(
        actingUnit.maxHp,
        actingUnit.hp + healAmount
      );

      logLine =
        `${actingUnit.name} used ${skill.name}, dealt ${finalDamage}, and healed ${healAmount}`;

      if (roll.didCrit) {
        logLine += " (CRIT)";
      }

      logLine += ".";
    }

    else if (skill.type === "aoeDamage") {
      const hits = [];

      for (const enemy of run.enemies.filter(e => e.alive)) {
        const roll = rollDamage(actingUnit, skill.multiplier);
        const finalDamage = applyDamage(enemy, roll.damage);

        hits.push(
          `${enemy.name} ${enemy.position} took ${finalDamage}${roll.didCrit ? " CRIT" : ""}`
        );
      }

      logLine =
        `${actingUnit.name} used ${skill.name}. ${hits.join(", ")}.`;
    }

    else {
      return res.status(400).json({
        message: "Unsupported skill type"
      });
    }

    run.battleLog.push(logLine);

    tickBuffs(actingUnit);

    const battleResult = checkBattleEnd(run);

if (!battleResult) {
  advanceTurn(run);

  let currentUnit = getCurrentUnit(run);

  while (
    currentUnit &&
    currentUnit.side === "enemy" &&
    run.phase === "battle"
  ) {

    const targets = run.party.filter(
      ally => ally.alive && ally.hp > 0
    );

    if (targets.length === 0) {
      break;
    }

    const target =
      targets[Math.floor(Math.random() * targets.length)];

    const roll = rollDamage(currentUnit, 1);

    const finalDamage =
      applyDamage(target, roll.damage);

    let enemyLog =
      `${currentUnit.name} ${currentUnit.position} attacked ${target.name} for ${finalDamage}`;

    if (roll.didCrit) {
      enemyLog += " (CRIT)";
    }

    enemyLog += ".";

    run.battleLog.push(enemyLog);

    tickBuffs(currentUnit);

    const enemyResult =
      checkBattleEnd(run);

    if (enemyResult) {
      break;
    }

    advanceTurn(run);

    currentUnit = getCurrentUnit(run);
  }
}

    await run.save();

    res.json({
      message: "Action resolved",
      battleResult,
      currentTurn: getCurrentUnit(run),
      run
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function enemyAction(req, res) {
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

    if (run.phase !== "battle") {
      return res.status(400).json({
        message: "Run is not currently in battle phase",
        phase: run.phase
      });
    }

    const actingUnit = getCurrentUnit(run);

    if (!actingUnit || actingUnit.side !== "enemy") {
      return res.status(400).json({
        message: "It is not an enemy turn"
      });
    }

    const targets = run.party.filter(
      ally => ally.alive && ally.hp > 0
    );

    if (targets.length === 0) {
      return res.status(400).json({
        message: "No valid targets"
      });
    }

    const target =
      targets[Math.floor(Math.random() * targets.length)];

    const roll = rollDamage(actingUnit, 1);
    const finalDamage = applyDamage(target, roll.damage);

    let logLine =
      `${actingUnit.name} ${actingUnit.position} attacked ${target.name} for ${finalDamage} damage`;

    if (roll.didCrit) {
      logLine += " (CRIT)";
    }

    logLine += ".";

    run.battleLog.push(logLine);

    tickBuffs(actingUnit);

    const battleResult = checkBattleEnd(run);

    if (!battleResult) {
      advanceTurn(run);
    }

    await run.save();

    res.json({
      message: "Enemy action resolved",
      battleResult,
      currentTurn: getCurrentUnit(run),
      run
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}