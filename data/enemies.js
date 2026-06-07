export const enemies = {
  Goblin: {
    name: "Goblin",
    hpMin: 16,
    hpMax: 20,
    atkMin: 6,
    atkMax: 8,
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
    hp: 67,
    atkMin: 8,
    atkMax: 10,
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