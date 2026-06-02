import mongoose from "mongoose";

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

  party: [
    {
      characterId: String,
      name: String,
      rarity: String,
      classType: String,
      hp: Number,
      maxHp: Number,
      atkMin: Number,
      atkMax: Number,
      spd: Number,
      alive: {
        type: Boolean,
        default: true
      }
    }
  ]
}, {
  timestamps: true
});

const Run = mongoose.model("Run", runSchema);

export default Run;