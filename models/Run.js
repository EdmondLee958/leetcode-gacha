import mongoose from "mongoose";

const combatantSchema = new mongoose.Schema({
  characterId: String,
  name: String,
  rarity: String,
  classType: String,
  side: String,
  position: Number,

  hp: Number,
  maxHp: Number,
  atkMin: Number,
  atkMax: Number,
  spd: Number,
  critRate: Number,
  critDamage: Number,

  alive: {
    type: Boolean,
    default: true
  },

  buffs: {
    type: [
      {
        stat: String,
        value: Number,
        duration: Number
      }
    ],
    default: []
  }
}, { _id: true });

const runSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  status: {
    type: String,
    enum: ["active", "completed", "failed"],
    default: "active"
  },

  encounterNumber: {
    type: Number,
    default: 1
  },

  score: {
    type: Number,
    default: 0
  },

  pendingReward: {
    type: Boolean,
    default: false
  },

  rewardClaims: {
  type: [String],
  default: []
},

  phase: {
    type: String,
    enum: ["battle", "reward", "ended"],
    default: "battle"
  },

  party: [combatantSchema],

  enemies: [combatantSchema],

  turnOrder: {
    type: [String],
    default: []
  },

  currentTurnIndex: {
    type: Number,
    default: 0
  },

  battleLog: {
    type: [String],
    default: []
  },

  enemyScalingLevel: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Run = mongoose.model("Run", runSchema);

export default Run;