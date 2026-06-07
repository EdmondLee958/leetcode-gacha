export const enemies = {
  Goblin: {
    name: "Goblin",
    hpMin: 13,
    hpMax: 18,
    atkMin: 5,
    atkMax: 7,
    spd: 6,
    critRate: 5,
    critDamage: 50,
    skills: [
      {
        number: 1,
        name: "Club Strike",
        type: "damage",
        target: "enemy",
        multiplier: 1
      }
    ]
  },

  FirstBoss: {
    name: "First Boss",
    hp: 83,
    atkMin: 8,
    atkMax: 11,
    spd: 7,
    critRate: 5,
    critDamage: 50,
    skills: [
      {
        number: 1,
        name: "Heavy Strike",
        type: "damage",
        target: "enemy",
        multiplier: 1
      }
    ]
  }
};