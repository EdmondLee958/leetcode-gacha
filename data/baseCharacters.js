export const baseCharacters = {
  Knight: {
    hp: 21,
    atkMin: 4,
    atkMax: 6,
    spd: 4,
    critRate: 10,
    critDamage: 50,
    skills: [
      {
        number: 1,
        name: "Strike",
        type: "damage",
        target: "enemy",
        multiplier: 1
      },
      {
        number: 2,
        name: "Guard",
        type: "buff",
        target: "self",
        buff: {
          stat: "damageTaken",
          value: -25,
          duration: 3
        }
      }
    ]
  },

  Ranger: {
    hp: 16,
    atkMin: 8,
    atkMax: 10,
    spd: 7,
    critRate: 10,
    critDamage: 50,
    skills: [
      {
        number: 1,
        name: "Shot",
        type: "damage",
        target: "enemy",
        multiplier: 1
      },
      {
        number: 2,
        name: "Focus",
        type: "buff",
        target: "self",
        buff: {
          stat: "damageDone",
          value: 25,
          duration: 3
        }
      }
    ]
  },

  Doctor: {
    hp: 19,
    atkMin: 4,
    atkMax: 6,
    spd: 9,
    critRate: 10,
    critDamage: 50,
    skills: [
      {
        number: 1,
        name: "Scalpel",
        type: "damage",
        target: "enemy",
        multiplier: 1
      },
      {
        number: 2,
        name: "Patch Up",
        type: "heal",
        target: "ally",
        multiplier: 1
      }
    ]
  },

  Scout: {
    hp: 17,
    atkMin: 6,
    atkMax: 8,
    spd: 8,
    critRate: 10,
    critDamage: 50,
    skills: [
      {
        number: 1,
        name: "Stab",
        type: "damage",
        target: "enemy",
        multiplier: 1
      },
      {
        number: 2,
        name: "Drain Strike",
        type: "damageAndSelfHeal",
        target: "enemy",
        damageMultiplier: 0.5,
        healMultiplier: 0.5
      }
    ]
  },

  Mercenary: {
    hp: 20,
    atkMin: 5,
    atkMax: 9,
    spd: 7,
    critRate: 10,
    critDamage: 50,
    skills: [
      {
        number: 1,
        name: "Slash",
        type: "damage",
        target: "enemy",
        multiplier: 1
      },
      {
        number: 2,
        name: "Wide Swing",
        type: "aoeDamage",
        target: "allEnemies",
        multiplier: 0.5
      }
    ]
  },

  Bannerman: {
    hp: 16,
    atkMin: 5,
    atkMax: 7,
    spd: 8,
    critRate: 10,
    critDamage: 50,
    skills: [
      {
        number: 1,
        name: "Banner Strike",
        type: "damage",
        target: "enemy",
        multiplier: 1
      },
      {
        number: 2,
        name: "Rally",
        type: "buff",
        target: "ally",
        buff: {
          stat: "damageDone",
          value: 25,
          duration: 3
        }
      }
    ]
  },

  Ronin: {
    hp: 18,
    atkMin: 9,
    atkMax: 13,
    spd: 7,
    critRate: 15,
    critDamage: 50,
    skills: [
      {
        number: 1,
        name: "Cut",
        type: "damage",
        target: "enemy",
        multiplier: 1
      },
      {
        number: 2,
        name: "Focus Blade",
        type: "buff",
        target: "self",
        buff: {
          stat: "damageDone",
          value: 25,
          duration: 3
        }
      }
    ]
  }
};